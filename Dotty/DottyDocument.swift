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

struct DottyDocumentSnapshot {
    var image: CGImage
    var title: String
}

struct Point {
    let x: Int
    let y: Int
}

class DottyDocument: ReferenceFileDocument, ObservableObject {
    typealias Snapshot = DottyDocumentSnapshot
    
    @Published var image: CGImage
    @Published var title: String
    static var readableContentTypes: [UTType] { [.png] }
    var ctx: CGContext
    var history: [CGImage] = []
    var future: [CGImage] = []
    
    func paint(location: CGPoint, scale: CGFloat, tool: Tool, color: Color) {
        let x = Int(location.x / scale)
        let y = Int(location.y / scale)
        os_log("%d,%d in %d,%d", x, y, image.width, image.height)
        switch tool {
        case Tool.Pen:
            updateColor(x: x, y: y, color: color)
        case Tool.Fill:
            floodFill(x: x, y: y, color: color)
        case Tool.Eraser:
            clearColor(x: x, y: y)
        case Tool.Move:
            // TODO: implement move
            break
        }
    }
    
    func updateColor(x: Int, y: Int, color: Color) {
        ctx.setFillColor(color.cgColor!)
        updatePixel(x: x, y: y)
        ctx.drawPath(using: .fill)
        
        image = ctx.makeImage()!
    }
    
    private func updatePixel(x: Int, y: Int) {
        let rect = CGRect(x: x, y: image.height - y - 1, width: 1, height: 1)
        ctx.addRect(rect)
    }
    
    func clearColor(x: Int, y: Int) {
        let rect = CGRect(x: x, y: image.height - y - 1, width: 1, height: 1)
        ctx.clear(rect)
        ctx.drawPath(using: .fill)
        
        image = ctx.makeImage()!
    }
    
    private func readPixel(x: Int, y: Int) -> CGColor {
        let dataPtr = ctx.data!
        let location = (y * ctx.bytesPerRow) + (x * ctx.bitsPerPixel) / 4
        let pixelPtr = dataPtr.assumingMemoryBound(to: CGFloat.self) + location
        return CGColor(colorSpace: ctx.colorSpace!, components: pixelPtr)!
    }
    
    func floodFill(x startX: Int, y startY: Int, color: Color) {
        // Adapted from Tom Cantwell https://cantwell-tom.medium.com/flood-fill-and-line-tool-for-html-canvas-65e08e31aec6
        ctx.setFillColor(color.cgColor!)

        let pixel = readPixel(x: startX, y: startY)
        // exit early if colour is unchanged
        if (color.cgColor == pixel) {
            return
        }
        
        var pixelStack = [Point(x: startX, y: startY)]
        fill(stack: &pixelStack, source: pixel)
    }
    
    private func fill(stack: inout [Point], source: CGColor) {
        let position = stack.popLast()!
        var y = position.y
        while y >= 0, readPixel(x: position.x, y: y) == source {
            y -= 1
        }
        // don't overextend
        y += 1
        var reachLeft = false
        var reachRight = false
        
        while y < ctx.height && readPixel(x: position.x, y: y) == source {
            updatePixel(x: position.x, y: y)
            if position.x > 0 {
                if readPixel(x: position.x - 1, y: y) == source {
                    if !reachLeft {
                        stack.append(Point(x: position.x - 1, y: y))
                        reachLeft = true
                    }
                } else if reachLeft {
                    reachLeft = false
                }
            }
            if position.x < ctx.width - 1 {
                if readPixel(x: position.x + 1, y: y) == source {
                    if !reachRight {
                        stack.append(Point(x: position.x + 1, y: y))
                        reachRight = true
                    }
                } else if reachRight {
                    reachRight = false
                }
            }
            y += 1
        }
        if stack.count > 0 {
            fill(stack: &stack, source: source)
        }
        
        ctx.drawPath(using: .fill)
        image = ctx.makeImage()!
    }
    
    func pushHistory(undoManager: UndoManager) {
        if let additional = image.copy() {
            history.append(additional)
            future = []
            undoManager.registerUndo(withTarget: self) { undo in
                undo.popHistory(undoManager: undoManager)
            }
        }
    }
    
    func replace(additional: CGImage) {
        let rect = CGRect(x: 0, y: 0, width: additional.width, height: additional.height)
        ctx.clear(rect)
        ctx.draw(additional, in: rect)
        ctx.drawPath(using: .fill)
        image = ctx.makeImage()!
    }
    
    func popHistory(undoManager: UndoManager) {
        if let additional = history.popLast() {
            future.append(image.copy()!)
            replace(additional: additional)
            undoManager.registerUndo(withTarget: self) { redo in
                redo.popFuture(undoManager: undoManager)
            }
        }
    }
    
    func popFuture(undoManager: UndoManager) {
        if let additional = future.popLast() {
            history.append(image.copy()!)
            replace(additional: additional)
            undoManager.registerUndo(withTarget: self) { undo in
                undo.popHistory(undoManager: undoManager)
            }
        }
    }
    
    init(image: CGImage = DEFAULT, title: String? = nil) {
        self.title = title ?? "Untitled.png"
        self.image = image
        self.ctx = CGContext(
            data: nil,
            width: image.width,
            height: image.height,
            bitsPerComponent: image.bitsPerComponent,
            bytesPerRow: image.bytesPerRow,
            space: image.colorSpace!,
            bitmapInfo: CGBitmapInfo.floatComponents.rawValue | CGImageAlphaInfo.last.rawValue
        )!
        ctx.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height))
    }
    
    required convenience init(configuration: ReadConfiguration) throws {
        guard let data = configuration.file.regularFileContents,
              let fileImage = CGImage(pngDataProviderSource: CGDataProvider.init(data: data as CFData)!, decode: nil, shouldInterpolate: false, intent: CGColorRenderingIntent.absoluteColorimetric)
        else {
            throw CocoaError(.fileReadCorruptFile)
        }
        self.init(image: fileImage, title: configuration.file.filename!)
    }
    
    func snapshot(contentType: UTType) throws -> Snapshot {
        return DottyDocumentSnapshot(image: image, title: title)
    }
    
    func fileWrapper(snapshot: DottyDocumentSnapshot, configuration: WriteConfiguration) throws -> FileWrapper {
        guard let mutableData = CFDataCreateMutable(nil, 0),
              let destination = CGImageDestinationCreateWithData(mutableData, UTType.png.identifier as CFString, 1, nil) else {
            throw FileError.fileError("can't make data")
        }
        CGImageDestinationAddImage(destination, snapshot.image, nil)
        guard CGImageDestinationFinalize(destination) else {
            throw FileError.fileError("can't finalize data")
        }
        
        return .init(regularFileWithContents: mutableData as Data)
    }
}
