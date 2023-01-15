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

func clamp<T>(_ value: T, min minimum: T, max maximum: T) -> T where T : Comparable {
    return min(max(value, minimum), maximum)
}

struct ContentView: View {
    @Binding var document: DottyDocument
    @State var scale: CGFloat = 44.0
    @State var currentColor: Color = Color(red: 0.5, green: 0.0, blue: 0.5)
    @State var activeTool: Tool = Tool.Pen
    @State var lastScale: CGFloat = 1.0
    @State var pan: CGPoint = CGPoint(x: 0, y: 0)
    @Environment(\.undoManager) var undoManager
    
    
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
                scale = scale - 1.0
            } label: {
                Image(systemName: "minus.magnifyingglass")
            }.keyboardShortcut("-", modifiers: .command)
            
            Button() {
                scale = scale + 1.0
            } label: {
                Image(systemName: "plus.magnifyingglass")
            }.keyboardShortcut("+", modifiers: .command)
            
            if (proxy.size.width > 500) {
                Button() {
                    scale = 44.0
                } label: {
                    Image(systemName: "1.magnifyingglass")
                }.keyboardShortcut("0", modifiers: .command)
            }
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
        .overlay(Rectangle().frame(width: nil, height: 1, alignment: .bottom).foregroundColor(Color.black), alignment: .bottom)
//        .overlay(Rectangle().frame(width: 1, height: nil, alignment: .leading).foregroundColor(Color.black), alignment: .leading)
//        .overlay(Rectangle().frame(width: 1, height: nil, alignment: .trailing).foregroundColor(Color.black), alignment: .trailing)
//        .padding([.horizontal, .top], 5)
    }
    
    @ViewBuilder
    var canvas: some View {
        HStack {
            GeometryReader { innerGeom in
                ScrollView {
                    CanvasView(document: $document, scale: $scale, currentColor: $currentColor, currentTool: $activeTool)
                        .frame(minHeight: innerGeom.size.height)
                }
#if os(iOS)
                .scrollDisabled(true)
                .introspectScrollView(customize: { view in
                    view.contentOffset = CGPoint(
                        x: clamp(0 - pan.x, min: 0 - view.frame.width * 2, max: view.frame.width * 2),
                        y: clamp(0 - pan.y, min: 0 - view.frame.height * 2, max: view.frame.height * 2)
                    )
                })
#elseif os(macOS)
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
#endif
#if os(iOS)
                
                TapView { touch in
                    if touch.touches == 1 {
                        document.paint(location: touch.center, scale: scale, tool: activeTool, color: currentColor)
                    } else if touch.touches > 1 {
                        switch touch.type {
                        case .Start:
                            break
                        case .Move:
                            scale = clamp(scale + (touch.fromLast.spread / 16), min: CGFloat(1), max: CGFloat(44))
                            pan = CGPoint(x: pan.x + touch.fromLast.move.x, y: pan.y + touch.fromLast.move.y)
                        case .End:
                            break
                        }
                    }
                }
#endif
            }
        }
    }
    
    var body: some View {
        GeometryReader { geom in
            VStack (alignment: .leading, spacing: 0) {
                titlebar
                canvas
                    .background(Color.white)
#if os(iOS)
                ColorView(currentColor: $currentColor)
                    .padding(.horizontal, 5)
                    .background(Color.white)
                    .overlay(Rectangle().frame(width: nil, height: 1, alignment: .top).foregroundColor(Color.black), alignment: .top)
#endif
            }
            .toolbar {
                ToolbarItem {
                    toolset
                }
#if os(macOS)
                ToolbarItem {
                    ColorView(currentColor: $currentColor)
                }
                ToolbarItem {
                    Spacer()
                }
#endif
                ToolbarItemGroup {
                    viewtools(proxy: geom)
                }
            }
#if os(iOS)
            .navigationTitle("")
#endif
        }
        .navigationBarTitleDisplayMode(.inline)
        .background(Color.gray)
        .toolbarBackground(Color.white, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        
    }
    
}


struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack() {
            ContentView(document: .constant(DottyDocument()))
        }
    }
}
