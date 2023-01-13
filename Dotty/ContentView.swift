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

let MAX_RECENT = 20

struct ContentView: View {
    @Binding var document: DottyDocument
    @State var scale: CGFloat = 1
    @State var currentColor: Color = Color(red: 0.5, green: 0.0, blue: 0.5)
    @State var recentColors: [Color] = []
    @State var activeTool: Tool = Tool.Pen
    @State var lastScale: CGFloat = 1.0
    @Environment(\.undoManager) var undoManager
    
    
    @ViewBuilder
    var menus: some View {
        Spacer()
    }
    
    @ViewBuilder
    var toolset: some View {
        VintagePicker(selection: $activeTool, options: [
            PickerOption(value: Tool.Pen, label: Image(systemName: "paintbrush.pointed.fill").accessibilityLabel("Paint")),
            PickerOption(value: Tool.Eraser, label: Image(systemName: "eraser").accessibilityLabel("Erase")),
            PickerOption(value: Tool.Fill, label: Image(systemName: "drop.fill").accessibilityLabel("Flood Fill")),
            PickerOption(value: Tool.Move, label: Image(systemName: "arrow.up.and.down.and.arrow.left.and.right").accessibilityLabel("Move"))
        ])
    }
    
    @ViewBuilder
    func viewtools(proxy: GeometryProxy) -> some View {
        Button() {
            undoManager?.undo()
        } label: {
            Image(systemName: "arrow.uturn.backward")
        }.buttonStyle(VintageButtonStyle())
            .disabled(!(undoManager?.canUndo ?? false))
        
        Button() {
            undoManager?.redo()
        } label: {
            Image(systemName: "arrow.uturn.forward")
        }.buttonStyle(VintageButtonStyle())
            .disabled(!(undoManager?.canRedo ?? false))
        
        if (proxy.size.width > 400) {
            Spacer()
            Button() {
                scale = scale - 1
            } label: {
                Image(systemName: "minus.magnifyingglass")
            }.keyboardShortcut("-", modifiers: .command)
                .buttonStyle(VintageButtonStyle())
            
            Button() {
                scale = scale + 1
            } label: {
                Image(systemName: "plus.magnifyingglass")
            }.keyboardShortcut("+", modifiers: .command)
                .buttonStyle(VintageButtonStyle())
            
            if (proxy.size.width > 500) {
                Button() {
                    scale = 1
                } label: {
                    Image(systemName: "1.magnifyingglass")
                }.keyboardShortcut("0", modifiers: .command)
                    .buttonStyle(VintageButtonStyle())
            }
        }
    }
    
    @ViewBuilder
    var colors: some View {
        HStack (spacing: 0) {
            ColorPicker(selection: $currentColor, supportsOpacity: true) {
                Text("Paint Color")
            }
            .labelsHidden()
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
                        }).frame(width: 32, height: 32)
                    }
                }
            }
            Spacer()
        }
    }
    
    @ViewBuilder
    var titlebar: some View {
        HStack {
            ZStack {
                VStack (spacing: 2.8) {
                    Rectangle().frame(height: 1)
                    Rectangle().frame(height: 1)
                    Rectangle().frame(height: 1)
                    Rectangle().frame(height: 1)
                    Rectangle().frame(height: 1)
                    Rectangle().frame(height: 1)
                }.padding(.all, 4)
                HStack {
                    Button(action: {
                        
                    }, label: {
                        
                    })
                    .frame(width: 20, height: 20)
                    .accessibilityLabel("Back")
                    .border(.foreground, width: 1)
                    .padding(.all, 2)
                    .background(.background)
                    .padding(.leading, 10)
                    .buttonStyle(.plain)
                    Spacer()
                }
            }
            Text(document.title)
            VStack (spacing: 2.8) {
                Rectangle().frame(height: 1)
                Rectangle().frame(height: 1)
                Rectangle().frame(height: 1)
                Rectangle().frame(height: 1)
                Rectangle().frame(height: 1)
                Rectangle().frame(height: 1)
            }.padding(.all, 4)
        }
        .frame(height: 32)
        .background(Color.white)
        .overlay(Rectangle().frame(width: nil, height: 1, alignment: .top).foregroundColor(Color.black), alignment: .top)
        .overlay(Rectangle().frame(width: 1, height: nil, alignment: .leading).foregroundColor(Color.black), alignment: .leading)
        .overlay(Rectangle().frame(width: 1, height: nil, alignment: .trailing).foregroundColor(Color.black), alignment: .trailing)
        .padding(.horizontal)
    }

    var body: some View {
        GeometryReader { geom in
            VStack (alignment: .center, spacing: 0) {
#if os(iOS)
                HStack {
                    toolset
                        .background(Color.white)
                        .border(Color.black, width: 1)
                        .padding(.all)
                    Spacer()
                    HStack(spacing: 0) {
                        viewtools(proxy: geom)
                    }
                    .background(Color.white)
                    .border(Color.black, width: 1)
                    .padding(.all)
                }
#endif
                titlebar
                GeometryReader { innerGeom in
                    ScrollView {
                        CanvasView(document: $document, scale: $scale, currentColor: $currentColor, currentTool: $activeTool)
                            .frame(minHeight: innerGeom.size.height)
                    }
                    .background(Color.white)
                    .border(Color.black, width: 1)
                    .padding([.leading, .trailing])
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
                    .background(Color.white)
                    .border(Color.black, width: 1)
                    .padding(.all)
#endif
            }
            .background(
                Color.gray
            )
#if os(macOS)
            .toolbar {
                //            GeometryReader { toolbarProxy in
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
                    viewtools(proxy: geom)
                }
            }
#endif
        }.navigationBarTitleDisplayMode(.inline)
    }
    
}


struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(document: .constant(DottyDocument()), scale: 1.0, recentColors: [Color.red, Color.yellow, Color.green, Color.blue, Color.purple, Color.gray, Color.black, Color.white]).previewDisplayName("Many colors")
        
        
            ContentView(document: .constant(DottyDocument()), scale: 1.0, recentColors: [Color.pink]).previewDisplayName("One color")
        
        
            ContentView(document: .constant(DottyDocument()), scale: 1.0, recentColors: []).previewDisplayName("No color")
    }
}
