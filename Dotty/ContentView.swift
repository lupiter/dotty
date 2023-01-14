//
//  ContentView.swift
//  Dotty
//
//  Created by Catherine Wise on 1/8/2022.
//

import SwiftUI
import os
import Introspect

enum Tool {
    case Pen
    case Eraser
    case Fill
    case Move
}

let MAX_RECENT = 20

struct ContentView: View {
    @Binding var document: DottyDocument
    @State var scale: CGFloat = 1.0
    @State var currentColor: Color = Color(red: 0.5, green: 0.0, blue: 0.5)
    @State var recentColors: [Color] = []
    @State var activeTool: Tool = Tool.Pen
    @State var lastScale: CGFloat = 1.0
    @State var pan: CGPoint = CGPoint(x: 0, y: 0)
    @Environment(\.undoManager) var undoManager
    var superDismiss: DismissAction?
    
    
    @ViewBuilder
    var menus: some View {
        Spacer()
    }
    
    @ViewBuilder
    var toolset: some View {
        Picker(selection: $activeTool, content: {
            Image(systemName: "paintbrush.pointed.fill").accessibilityLabel("Paint").tag(Tool.Pen)
            Image(systemName: "eraser").accessibilityLabel("Erase").tag(Tool.Eraser)
            Image(systemName: "drop.fill").accessibilityLabel("Flood Fill").tag(Tool.Fill)
            Image(systemName: "arrow.up.and.down.and.arrow.left.and.right").accessibilityLabel("Move").tag(Tool.Move)
        }, label: {
            Text("Tool")
        }).pickerStyle(.segmented)
    }
    
    @ViewBuilder
    func viewtools(proxy: GeometryProxy) -> some View {
        Button() {
            undoManager?.undo()
        } label: {
            Image(systemName: "arrow.uturn.backward")
        }
        .disabled(!(undoManager?.canUndo ?? false))
        
        Button() {
            undoManager?.redo()
        } label: {
            Image(systemName: "arrow.uturn.forward")
        }
        .disabled(!(undoManager?.canRedo ?? false))
        
        if (proxy.size.width > 400) {
            Spacer()
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
            
            if (proxy.size.width > 500) {
                Button() {
                    scale = 1
                } label: {
                    Image(systemName: "1.magnifyingglass")
                }.keyboardShortcut("0", modifiers: .command)
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
            .padding(.all, 5)
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
        HStack (spacing: 0) {
            VStack (spacing: 2.8) {
                Rectangle().frame(height: 1)
                Rectangle().frame(height: 1)
                Rectangle().frame(height: 1)
                Rectangle().frame(height: 1)
                Rectangle().frame(height: 1)
                Rectangle().frame(height: 1)
            }.padding(.all, 4)
            Text(document.title).font(.custom("ChiKareGo2", size: 16)).padding(.all).fixedSize()
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
        .padding([.horizontal, .top], 5)
    }
    
    var body: some View {
        GeometryReader { geom in
            VStack (alignment: .center, spacing: 0) {
                titlebar
                GeometryReader { innerGeom in
                    ScrollView {
                        CanvasView(document: $document, scale: $scale, currentColor: $currentColor, currentTool: $activeTool)
                            .frame(minHeight: innerGeom.size.height)
                    }
                    .background(Color.white)
                    .border(Color.black, width: 1)
                    .padding([.leading, .trailing, .bottom], 5)
                    .highPriorityGesture(
                        DragGesture().onChanged({ value in
                            document.paint(location: value.location, scale: scale, tool: activeTool, color: currentColor)
                        })
                    )
#if os(iOS)
                    .scrollDisabled(true)
                    .introspectScrollView(customize: { view in
                        view.contentOffset = CGPoint(x: 0 - pan.x, y: 0 - pan.y)
                    })
#endif
                    .gesture(RotationGesture().onChanged({ angle in
                        os_log("Rotation %d", angle.degrees)
                    }))
                    #if os(macOS)
                    .gesture(MagnificationGesture()
                        .onChanged() { value in
                            os_log("Magnification %d", value)
                            let delta = value / lastScale
                            lastScale = value
                            scale = min(scale * delta, 15)
                        }
                        .onEnded() { value in
                            lastScale = 1.0
                        }
                    )
                    #endif
#if os(iOS)
                    TapView { touch in
                        os_log("Touch! %d", touch.touches)
                        if touch.touches == 1 {
                            document.paint(location: touch.center, scale: scale, tool: activeTool, color: currentColor)
                        } else if touch.touches > 1 {
                            switch touch.type {
                            case .Start:
                                break
                            case .Move:
                                let spread = touch.fromLast.spread
                                let newScale = CGFloat(document.image.width) * scale / spread
                                
                                os_log("gogo %f %f %f", touch.fromLast.spread, scale, scale + touch.fromLast.spread)
                                scale = min(max(scale + (touch.fromLast.spread / 2), 1), 15)
                                pan = CGPoint(x: pan.x + touch.fromLast.move.x, y: pan.y + touch.fromLast.move.y)
                            case .End:
                                break
                            }
                        }
                    }
#endif
                }
#if os(iOS)
                colors
                    .padding(.horizontal, 5)
                    .background(Color.white)
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
                    viewtools(proxy: geom)
                }
            }
#else
            .toolbar  {
                ToolbarItem {
                    toolset
                }
                ToolbarItemGroup {
                    viewtools(proxy: geom)
                }
            }
            .navigationTitle("")
#endif
        }
        .navigationBarTitleDisplayMode(.inline)
        .background(Color.gray)
        .toolbarBackground(Color.white)
        .toolbarBackground(.visible, for: .navigationBar)
        
    }
    
}


struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack() {
            ContentView(document: .constant(DottyDocument()), scale: 1.0, recentColors: [Color.red, Color.yellow, Color.green, Color.blue, Color.purple, Color.gray, Color.black, Color.white])}.previewDisplayName("Many colors")
        
        
        NavigationStack() {
            ContentView(document: .constant(DottyDocument()), scale: 1.0, recentColors: [Color.pink])
            
        }.previewDisplayName("One color")
        
        
        NavigationStack() {
            ContentView(document: .constant(DottyDocument()), scale: 1.0, recentColors: [])
            
        }.previewDisplayName("No color")
        
    }
}
