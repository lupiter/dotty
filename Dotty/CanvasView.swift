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
                    
                    GridLayout(horizontalSpacing: 0, verticalSpacing: 0) {
                        ForEach(Array(document.uiDots.enumerated()), id: \.offset) { rowIndex, row in
                            GridRow {
                                ForEach(Array(row.enumerated()), id: \.offset) { columnIndex, color in
                                    Rectangle().fill(color).frame(width: 1 * scale, height: 1 * scale).onTapGesture {
                                        updatePixel(x: columnIndex, y: rowIndex)
                                    }
                                }
                            }
                        }
                    }.scaleEffect(activeScale)
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
