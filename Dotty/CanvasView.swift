//
//  CanvasView.swift
//  Dotty
//
//  Created by Catherine Wise on 3/8/2022.
//

import SwiftUI
import os

struct CanvasView: View {
    @ObservedObject var document: DottyDocument
    @Binding var scale: CGFloat
    @Binding var currentColor: Color
    @Binding var currentTool: Tool
    
    
    var body: some View {
        VStack {
            Spacer()
            HStack {
                Spacer()
                ZStack {
                    Image(document.image, scale: scale, label: Text(document.title))
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
                
                Spacer()
            }
            Spacer()
        }
        
    }
}

struct CamvasView_Previews: PreviewProvider {
    static var previews: some View {
        CanvasView(document: DottyDocument(), scale: .constant(1.0), currentColor: .constant(Color(red: 0.7, green: 0.0, blue: 0.7)), currentTool: .constant(Tool.Pen))
    }
}
