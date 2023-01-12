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
    @State var lastScale: CGFloat = 1.0
    
    @ViewBuilder
    var toolset: some View {
        Picker(selection: $activeTool) {
            Image(systemName: "paintbrush.pointed.fill").tag(Tool.Pen).accessibilityLabel("Pixel Paint")
            Image(systemName: "eraser").tag(Tool.Eraser).accessibilityLabel("Pixel Erase")
            Image(systemName: "paintbrush.fill").tag(Tool.Fill).accessibilityLabel("Flood Fill")
            Image(systemName: "arrow.up.and.down.and.arrow.left.and.right").tag(Tool.Move).accessibilityLabel("Move")
        } label: {
            Text("Tools")
        }.pickerStyle(.segmented)
            .fixedSize(horizontal: true, vertical: false)
    }
    
    @ViewBuilder
    var colors: some View {
        HStack (spacing: 0) {
            ColorPicker(selection: $currentColor, supportsOpacity: true) {
                Text("Paint Color")
            }
            .labelsHidden()
            .padding(.all)
            .onChange(of: currentColor) { newValue in
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
            ScrollView(.horizontal) {
                HStack (spacing: 0) {
                    ForEach(recentColors.indices, id: \.self) { idx in
                        Button(action: {
                            currentColor = recentColors[idx]
                        }, label: {
                            recentColors[idx]
                        }).frame(width: 22, height: 22)
                    }
                }
            }
            Spacer()
        }
    }

    var body: some View {
        VStack {
#if os(iOS)
            HStack {
                Spacer()
                toolset
                Spacer()
            }
#endif
            GeometryReader { proxy in
                ScrollView {
                    CanvasView(document: $document, scale: $scale, currentColor: $currentColor, currentTool: $activeTool)
                        .frame(minHeight: proxy.size.height)
                }
                .gesture(MagnificationGesture()
                    .onChanged() { value in
                        let delta = value.magnitude / lastScale
                        lastScale = value.magnitude
                        scale = min(scale * delta, 15)
                    }
                    .onEnded() { value in
                        lastScale = 1.0
                    }
                )
            }
#if os(iOS)
            colors
#endif
        }
#if os(macOS)
        .toolbar {
            ToolbarItem {
                toolset
            }
            
            ToolbarItem {
                colors
            }
            
            ToolbarItem {
                Spacer()
            }
            
            ToolbarItemGroup {
                Button() {
                    scale = scale - 1
                } label: {
                    Image(systemName: "minus.magnifyingglass")
                }.keyboardShortcut("-", modifiers: .command)
                
                Button() {
                    scale = scale + 1
                } label: {
                    Image(systemName: "plus.magnifyingglass")
                }.keyboardShortcut("+", modifiers: .command)
                
                Button() {
                    scale = 1
                } label: {
                    Image(systemName: "1.magnifyingglass")
                }.keyboardShortcut("0", modifiers: .command)
            }
        }
#endif
    }
    
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(document: .constant(DottyDocument()), scale: 1.0, recentColors: [Color.red, Color.yellow, Color.green, Color.blue, Color.purple, Color.gray, Color.black, Color.white]).previewDisplayName("Many colors")
        
        
            ContentView(document: .constant(DottyDocument()), scale: 1.0, recentColors: [Color.pink]).previewDisplayName("One color")
        
        
            ContentView(document: .constant(DottyDocument()), scale: 1.0, recentColors: []).previewDisplayName("No color")
    }
}
