//
//  DottyDocument.swift
//  Dotty
//
//  Created by Catherine Wise on 1/8/2022.
//

import SwiftUI
import UniformTypeIdentifiers
import os

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
    var image: CGImage
    var title: String
    static var readableContentTypes: [UTType] { [.png] }
    
    mutating func paint(location: CGPoint, scale: CGFloat, tool: Tool, color: Color) {
        let x = Int(location.x / scale)
        let y = Int(location.y / scale)
        switch tool {
        case Tool.Pen:
            updateColor(x: x, y: y, color: color)
        case Tool.Fill:
            floodFill(x: x, y: y, color: color)
        case Tool.Eraser:
            updateColor(x: x, y: y, color: Color.black.opacity(0.0))
        case Tool.Move:
            // TODO: implement move
            break
        }
    }
    
    mutating func updateColor(x: Int, y: Int, color: Color) {
        os_log("%d %d in %d %d", x, y, image.width, image.height)
        let ctx = CGContext(
            data: nil,
            width: image.width,
            height: image.height,
            bitsPerComponent: image.bitsPerComponent,
            bytesPerRow: image.bytesPerRow,
            space: image.colorSpace!,
            bitmapInfo: CGBitmapInfo.byteOrderDefault.rawValue | CGImageAlphaInfo.premultipliedFirst.rawValue
        )!
        ctx.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height))
        ctx.setFillColor(color.cgColor!)
        let rect = CGRect(x: x, y: image.height - y - 1, width: 1, height: 1)
        ctx.addRect(rect)
        ctx.drawPath(using: .fill)
        
        image = ctx.makeImage()!
    }
    
    mutating func floodFill(x: Int, y: Int, color: Color) {
        // TODO: implement flood fill
    }
    
    init(image: CGImage = DEFAULT, title: String? = nil) {
        self.title = title ?? "Untitled.png"
        self.image = image
    }
    
    init(configuration: ReadConfiguration) throws {
        guard let data = configuration.file.regularFileContents,
              let fileImage = CGImage(pngDataProviderSource: CGDataProvider.init(data: data as CFData)!, decode: nil, shouldInterpolate: false, intent: CGColorRenderingIntent.absoluteColorimetric)
        else {
            throw CocoaError(.fileReadCorruptFile)
        }
        self.init(image: fileImage, title: configuration.file.filename!)
    }
    
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
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
