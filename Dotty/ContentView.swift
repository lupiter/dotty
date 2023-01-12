//
//  ContentView.swift
//  Dotty
//
//  Created by Catherine Wise on 1/8/2022.
//

import SwiftUI

enum Tool {
    case Pen
    case Eraser
    case Fill
    case Move
}

let MAX_RECENT = 4


struct ContentView: View {
    @Binding var document: DottyDocument
    @State var scale: CGFloat = 1
    @State var currentColor: Color = Color(red: 0.5, green: 0.0, blue: 0.5)
    @State var recentColors: [Color] = []
    @State var activeTool: Tool = Tool.Pen

    var body: some View {
            
        ScrollView {
            CanvasView(document: $document, scale: $scale, currentColor: $currentColor)
        }.toolbar {
            ToolbarItem {
                Picker(selection: $activeTool) {
                    Image(systemName: "paintbrush.pointed.fill").tag(Tool.Pen).accessibilityLabel("Pixel Paint")
                    Image(systemName: "paintbrush.pointed").tag(Tool.Eraser).accessibilityLabel("Pixel Erase")
                    Image(systemName: "paintbrush.fill").tag(Tool.Fill).accessibilityLabel("Flood Fill")
                    Image(systemName: "arrow.up.and.down.and.arrow.left.and.right").tag(Tool.Move).accessibilityLabel("Move")
                } label: {
                    
                }.pickerStyle(.segmented)
                    .fixedSize(horizontal: true, vertical: false)
            }
            
            ToolbarItem {
                ColorPicker(selection: $currentColor) {
                }.onChange(of: currentColor) { newValue in
                    for color in recentColors {
                        if color == newValue {
                            return
                        }
                    }
                    if recentColors.count >= MAX_RECENT {
                        recentColors.removeFirst()
                    }
                    recentColors.append(currentColor)
                }
//                ForEach(recentColors.indices, id: \.self) { idx in
//                    recentColors[idx]
//                }
            }
            
            #if os(macOS)
            ToolbarItem {
                Spacer()
            }
            
            ToolbarItemGroup {
                Button() {
                    scale = scale - 0.1
                } label: {
                    Image(systemName: "plus.magnifyingglass")
                }.keyboardShortcut("-", modifiers: .command)
                
                Button() {
                    scale = scale + 0.1
                } label: {
                    Image(systemName: "minus.magnifyingglass")
                }.keyboardShortcut("+", modifiers: .command)
                
                Button() {
                    scale = 1
                } label: {
                    Image(systemName: "1.magnifyingglass")
                }.keyboardShortcut("0", modifiers: .command)
            }
            #endif
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(document: .constant(DottyDocument()), scale: 1.0)
    }
}
