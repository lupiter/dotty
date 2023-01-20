//
//  CanvasView.swift
//  Dotty
//
//  Created by Catherine Wise on 3/8/2022.
//

import SwiftUI
import os


func clamp<T>(_ value: T, min minimum: T, max maximum: T) -> T where T : Comparable {
    return min(max(value, minimum), maximum)
}

struct CanvasView: View {
    @ObservedObject var document: DottyDocument
    @Binding var currentColor: Color
    @Binding var currentTool: Tool
    @Binding var scale: CGFloat
    @State var lastScale: CGFloat = 1.0
    @State var panX: CGFloat = 0.0
    @State var panY: CGFloat = 0.0
    @Environment(\.undoManager) var undoManager
    
    var canvasOffset: CGSize {
        let width = CGFloat(document.image.width) * scale / 2
        let height = CGFloat(document.image.height) * scale / 2
        return CGSize(
            width: clamp(panX, min: 0 - width, max: 0),
            height: clamp(panY, min: 0 - height, max: 0)
        )
    }
    
    @ViewBuilder
    var image: some View {
        Image(
            document.image,
            scale: scale,
            label: Text(document.title)
        )
        .resizable(resizingMode: .stretch)
        .interpolation(.none)
        .aspectRatio(contentMode: .fit)
        .frame(width: max(1.0, scale) * CGFloat(document.image.width), height: max(1.0, scale) * CGFloat(document.image.height))
        .onTapGesture(coordinateSpace: .local) { location in
            document.paint(location: location, scale: scale, tool: currentTool, color: currentColor)
        }
        .background() {
            Image("grid")
                .resizable(resizingMode: .tile)
                .antialiased(false)
        }
    }
    
    
#if os(iOS)
    @ViewBuilder
    var canvas: some View {
        VStack {
            HStack {
                ZStack {
                    image
                        .offset(canvasOffset)
                        .overlay {
                            TapView { touch in
                                if touch.touches == 1 {
                                    if touch.type == .Start {
                                        document.pushHistory(undoManager: undoManager!)
                                    }
                                    document.paint(location: touch.center, scale: scale, tool: currentTool, color: currentColor)
                                } else if touch.touches > 1 {
                                    switch touch.type {
                                    case .Start:
                                        break
                                    case .Move:
                                        scale = clamp(scale + (touch.fromLast.spread / 16), min: CGFloat(1), max: CGFloat(44))
                                        os_log("pan! was %f,%f delta %f,%f", panX, panY, touch.fromLast.move.x, touch.fromLast.move.y)
                                        panX += touch.fromLast.move.x
                                        panY += touch.fromLast.move.y
                                    case .End:
                                        break
                                    }
                                }
                            }
                        }
                }
            }
        }
    }
#elseif os(macOS)
    @ViewBuilder
    var canvas: some View {
        ScrollView {
            image
        }
        .highPriorityGesture(
            DragGesture().onChanged({ value in
                document.paint(location: value.location, scale: scale, tool: activeTool, color: currentColor)
            })
        )
        .gesture(MagnificationGesture()
            .onChanged() { value in
                let delta = value / lastScale
                lastScale = value
                scale = min(scale * delta, 15)
            }
            .onEnded() { value in
                lastScale = 1.0
            }
        )
        .frame(width: viewSize.width)
    }
#endif
    
    
    var body: some View {
        canvas
    }
}

struct CamvasView_Previews: PreviewProvider {
    static var previews: some View {
        CanvasView(document: DottyDocument(), currentColor: .constant(Color(red: 0.7, green: 0.0, blue: 0.7)), currentTool: .constant(Tool.Pen), scale: .constant(22.0))
    }
}
