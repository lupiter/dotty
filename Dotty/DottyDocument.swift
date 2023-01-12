//
//  DottyDocument.swift
//  Dotty
//
//  Created by Catherine Wise on 1/8/2022.
//

import SwiftUI
import UniformTypeIdentifiers

extension CGImage {
    func pngData() -> Data? {
        guard let mutableData = CFDataCreateMutable(nil, 0),
              let destination = CGImageDestinationCreateWithData(mutableData, UTType.png.identifier as CFString, 1, nil) else { return nil }
        CGImageDestinationAddImage(destination, self, nil)
        guard CGImageDestinationFinalize(destination) else { return nil }
        return mutableData as Data
    }
}

enum FileError: Error {
    case fileError(String)
}

#if os(macOS)
let DEFAULT = (NSImage(named: "drums")?.cgImage(forProposedRect: nil, context: nil, hints: nil))!
#elseif os(iOS)
let DEFAULT = (UIImage.init(named: "drums")?.cgImage)!
#endif

func sliceForComponent(_ arr: [UInt8], start: Int, length: Int) -> [UInt8] {
    let removeEnd = arr.prefix(start + length)
    return removeEnd.suffix(length)
}

func dataToComponent(_ arr: [UInt8], mode: CGBitmapInfo, divisor: Double = 1) -> CGFloat {
    var data = arr
    if mode.contains(.floatComponents) {
        // todo: work out how to decode these
        var comp: UInt = 0
        for byteIndex in 0..<arr.count {
            comp = comp + UInt(data[byteIndex]) << byteIndex
        }
        return CGFloat(bitPattern: comp)
    }
    if mode.contains(.byteOrder16Big) || mode.contains(.byteOrder32Big) {
        data = arr.reversed()
    }
    var comp = 0.0
    for byteIndex in 0..<data.count {
        comp = comp + Double(data[byteIndex] << byteIndex)
    }
    return comp / 255.0
}

func floatColorToInt(_ component: CGFloat) -> UInt8 {
    return UInt8(component * 255)
}

extension Array {
    func chunked(into size: Int) -> [[Element]] {
        return stride(from: 0, to: count, by: size).map {
            Array(self[$0 ..< Swift.min($0 + size, count)])
        }
    }
}

struct DottyDocument: FileDocument {
    var dots: [[CGColor]]
    var height: Int
    var width: Int
    var title: String
    static var readableContentTypes: [UTType] { [.png] }
    
    var uiDots: [[Color]] {
        get {
            return dots.map() { $0.map() { Color($0) } }
        }
    }
    
    mutating func updateColor(x: Int, y: Int, color: Color) {
        dots[y][x] = color.cgColor!
    }

    init(image: CGImage = DEFAULT, title: String? = nil) {
        self.title = title ?? "Untitled.png"
        self.height = image.height
        self.width = image.width
        self.dots = DottyDocument.decode(image: image, width: width)
    }
    
    static func decode(image: CGImage, width: Int) -> [[CGColor]] {
        if (image.colorSpace?.name != CGColorSpace.sRGB && image.colorSpace?.name != CGColorSpaceCreateDeviceRGB().name) {
            print(image.colorSpace?.name ?? "Color Space? IDK")
            return []
        }
        
        let bytesPerComponent = image.bitsPerComponent / 8
        let bytesPerPixel = image.bitsPerPixel / 8
        let imageData = image.dataProvider?.data
        var pixelBuf = [UInt8](repeating:0, count: image.bitsPerPixel / 8)
        
        let alphaModeFirst = image.alphaInfo == CGImageAlphaInfo.first
        let alphaModeLast = image.alphaInfo == CGImageAlphaInfo.last
        let alphaModeSkipFirst = image.alphaInfo == CGImageAlphaInfo.noneSkipFirst
        let alphaModePreFirst = image.alphaInfo == CGImageAlphaInfo.premultipliedFirst
        let alphaModePreLast = image.alphaInfo == CGImageAlphaInfo.premultipliedLast
        let alphaFirst = alphaModeFirst || alphaModeSkipFirst || alphaModePreFirst
        var dots: [CGColor] = []
        print(alphaModeLast, alphaModeFirst, alphaModeSkipFirst, alphaFirst)
        
        for row in 0..<image.height {
            for pixel in 0..<image.width {
                let pixelPoint = row * image.bytesPerRow + (pixel * bytesPerPixel)
                CFDataGetBytes(imageData, CFRangeMake(pixelPoint, bytesPerPixel), &pixelBuf)
                let red = sliceForComponent(pixelBuf, start: alphaFirst ? 1 : 0, length: bytesPerComponent)
                let green = sliceForComponent(pixelBuf, start: alphaFirst ? 2 : 1, length: bytesPerComponent)
                let blue = sliceForComponent(pixelBuf, start: alphaFirst ? 3 : 2, length: bytesPerComponent)
                var alpha: [UInt8] = []
                if alphaModeFirst || alphaModePreFirst {
                    alpha = sliceForComponent(pixelBuf, start: 0, length: bytesPerComponent)
                } else if alphaModeLast || alphaModePreLast {
                    alpha = sliceForComponent(pixelBuf, start: 3, length: bytesPerComponent)
                }
                let newColor = CGColor(red: dataToComponent(red, mode: image.bitmapInfo), green: dataToComponent(green, mode: image.bitmapInfo), blue: dataToComponent(blue, mode: image.bitmapInfo), alpha: alpha.count > 0 ? dataToComponent(alpha, mode: image.bitmapInfo) : 1.0)
                dots.append(newColor)
            }
        }
        return dots.chunked(into: width)
    }

    init(configuration: ReadConfiguration) throws {
        guard let data = configuration.file.regularFileContents,
              let fileImage = CGImage(pngDataProviderSource: CGDataProvider.init(data: data as CFData)!, decode: nil, shouldInterpolate: false, intent: CGColorRenderingIntent.absoluteColorimetric)
        else {
            throw CocoaError(.fileReadCorruptFile)
        }
        self.init(image: fileImage, title: configuration.file.filename!)
    }
    
    static func encode(dots: [CGColor], width: Int, height: Int) -> CGImage? {
        var data: [UInt8] = []
        for color in dots {
            let components: [UInt8] = color.components!.map() { component in floatColorToInt(component)}
            data.append(contentsOf: components)
        }
        let bitsPerComponent = 8
        let bitsPerPixel = bitsPerComponent * 4
        let bytesPerPixel = bitsPerPixel / bitsPerComponent
        
        let dataProvider = CGDataProvider.init(data: Data(data) as CFData)!
        return CGImage(
            width: width,
            height: height,
            bitsPerComponent: bitsPerComponent,
            bitsPerPixel: bitsPerPixel,
            bytesPerRow: bytesPerPixel * width,
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.last.rawValue | CGBitmapInfo.byteOrder32Little.rawValue),
            provider: dataProvider,
            decode: nil,
            shouldInterpolate: false,
            intent: .defaultIntent
        )
    }
    
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
        var tempDots: [CGColor] = dots.flatMap { $0 }
        let image = DottyDocument.encode(dots: tempDots, width: width, height: height)!
        
        guard let mutableData = CFDataCreateMutable(nil, 0),
              let destination = CGImageDestinationCreateWithData(mutableData, UTType.png.identifier as CFString, 1, nil) else {
            throw FileError.fileError("can't make data")
        }
        CGImageDestinationAddImage(destination, image, nil)
        guard CGImageDestinationFinalize(destination) else {
            throw FileError.fileError("can't finalize data")
        }
        
        return .init(regularFileWithContents: mutableData as Data)
    }
    
    
}
