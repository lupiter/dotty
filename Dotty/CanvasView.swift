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
    @State var activeScale: CGFloat = 1
    
    func updatePixel(x: Int, y: Int) {
        document.updateColor(x: x, y: y, color: currentColor)
    }

    var body: some View {
        ScrollView {
            HStack {
                Spacer()
                VStack {
                    Spacer()
                    Image(document.image, scale: 1, label: Text(document.title))
                        .resizable(resizingMode: .stretch)
                        .interpolation(.none)
                        .aspectRatio(contentMode: .fit)
                        .frame(width: activeScale * CGFloat(document.image.width), height: activeScale * CGFloat(document.image.height))
                        .onTapGesture(coordinateSpace: .local) { location in
                            updatePixel(x: Int(location.x / activeScale), y: Int(location.y / activeScale))
                        }
//                    .background() {
//                        Image("grid")
//                            .resizable(capInsets: EdgeInsets(), resizingMode: .tile)
//                            .antialiased(false)
//                    }
                    
                    Spacer()
                }
                Spacer()
            }
            .gesture(MagnificationGesture()
                .onChanged() { value in
                    activeScale = value.magnitude
                }
                .onEnded() { _ in
                    scale = activeScale * scale
                    activeScale = 1
                }
            )
        }
    }
}

struct CamvasView_Previews: PreviewProvider {
    static var previews: some View {
        CanvasView(document: .constant(DottyDocument()), scale: .constant(1.0), currentColor: .constant(Color(red: 0.7, green: 0.0, blue: 0.7)))
    }
}
