//
//  CanvasView.swift
//  Dotty
//
//  Created by Catherine Wise on 3/8/2022.
//

import SwiftUI
import os

struct CanvasView: View {
    @Binding var document: DottyDocument
    @Binding var scale: CGFloat
    @Binding var currentColor: Color
    @Binding var currentTool: Tool
    
    func updatePixel(x: Int, y: Int) {
        document.updateColor(x: x, y: y, color: currentColor)
    }
    
    func clearPixel(x: Int, y: Int) {
        document.updateColor(x: x, y: y, color: Color.black.opacity(0.0))
    }
    
    func floodFill(x: Int, y: Int) {
        document.floodFill(x: x, y: y, color: currentColor)
    }

    var body: some View {
        HStack {
            Spacer()
            VStack {
                Spacer()
                Image(document.image, scale: scale, label: Text(document.title))
                    .resizable(resizingMode: .stretch)
                    .interpolation(.none)
                    .aspectRatio(contentMode: .fit)
                    .frame(width: scale * CGFloat(document.image.width), height: scale * CGFloat(document.image.height))
                    .onTapGesture(coordinateSpace: .local) { location in
                        let x = Int(location.x / scale)
                        let y = Int(location.y / scale)
                        switch currentTool {
                        case Tool.Pen:
                            updatePixel(x: x, y: y)
                        case Tool.Fill:
                            floodFill(x: x, y: y)
                        case Tool.Eraser:
                            clearPixel(x: x, y: y)
                        case Tool.Move:
                            // TODO: implement move
                            break
                        }
                    }
                .background() {
                    Image("grid")
                        .resizable(capInsets: EdgeInsets(), resizingMode: .tile)
                        .antialiased(false)
                }
                
                Spacer()
            }
            Spacer()
        }
        
    }
}

struct CamvasView_Previews: PreviewProvider {
    static var previews: some View {
        CanvasView(document: .constant(DottyDocument()), scale: .constant(1.0), currentColor: .constant(Color(red: 0.7, green: 0.0, blue: 0.7)), currentTool: .constant(Tool.Pen))
    }
}
