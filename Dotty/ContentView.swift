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

func clamp<T>(_ value: T, min minimum: T, max maximum: T) -> T where T : Comparable {
    return min(max(value, minimum), maximum)
}

struct ContentView: View {
    @ObservedObject var document: DottyDocument
    @State var scale: CGFloat = 22.0
    @State var currentColor: Color = Color(red: 0.5, green: 0.0, blue: 0.5)
    @State var activeTool: Tool = Tool.Pen
    @State var lastScale: CGFloat = 1.0
    @State var pan: CGPoint = CGPoint(x: 0, y: 0)
    @State var canvasSize: CGSize = CGSize(width: 0, height: 0)
    @State var viewSize: CGSize = CGSize(width: 0, height: 0)
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
        })
        .pickerStyle(.segmented)
        .fixedSize()
        .background() {
            LinearGradient(
              gradient: GlossyButtonStyle.glossyWhite,
              startPoint: .top,
              endPoint: .bottom)
        }
    }
    
    @ViewBuilder
    var viewtools: some View {
        HStack (spacing: 0) {
            Button() {
                undoManager?.undo()
            } label: {
                Image(systemName: "arrow.uturn.backward")
            }
            .disabled(!(undoManager?.canUndo ?? false))
            .buttonStyle(GlossyButtonStyle(order: .Leading))
            
            Button() {
                undoManager?.redo()
            } label: {
                Image(systemName: "arrow.uturn.forward")
            }
            .disabled(!(undoManager?.canRedo ?? false))
            .buttonStyle(GlossyButtonStyle(order: .Trailing))
        }
        
        if (viewSize.width > 400) {
            Spacer()
            HStack (spacing: 0) {
                Button() {
                    scale = scale - 1.0
                } label: {
                    Image(systemName: "minus.magnifyingglass")
                }
                .keyboardShortcut("-", modifiers: .command)
                .buttonStyle(GlossyButtonStyle(order: .Leading))
                
                Button() {
                    scale = scale + 1.0
                } label: {
                    Image(systemName: "plus.magnifyingglass")
                }
                .keyboardShortcut("+", modifiers: .command)
                .buttonStyle(GlossyButtonStyle(order: .Center))
                
                if (viewSize.width > 500) {
                    Button() {
                        scale = 44.0
                    } label: {
                        Image(systemName: "1.magnifyingglass")
                    }
                    .keyboardShortcut("0", modifiers: .command)
                    .buttonStyle(GlossyButtonStyle(order: .Trailing))
                }
            }
        }
    }
    
    @ViewBuilder
    var stripes: some View {
        VStack (spacing: 1) {
            Group {
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
            }
            Group {
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
            }
            Group {
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
                Rectangle().frame(height: 2)
            }
        }.foregroundColor(Color(white: 0.97))
            .background(Color(white: 0.99))
    }
    
    @ViewBuilder
    func separator(_ alignment: Alignment) -> some View {
        Rectangle().frame(width: nil, height: 1, alignment: alignment).foregroundColor(Color(white: 0.56))
    }
    
    @ViewBuilder
    var titlebar: some View {
        HStack {
            Spacer()
            toolset
            Spacer()
            viewtools
            Spacer()
        }
        .background(
            stripes
        )
        .frame(height: 42)
        .overlay(separator(.bottom), alignment: .bottom)
    }
    
    @ViewBuilder
    var canvas: some View {
        ScrollView {
            CanvasView(document: document, scale: $scale, currentColor: $currentColor, currentTool: $activeTool)
                .frame(minHeight: canvasSize.height)
                .readSize { newSize in
                    canvasSize = newSize
                }
#if os(macOS)
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
#elseif os(iOS)
        .overlay {
            TapView { touch in
                if touch.touches == 1 {
                    if touch.type == .Start {
                        document.pushHistory(undoManager: undoManager!)
                    }
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
        }
#endif
            
        }
        .frame(width: viewSize.width)
#if os(iOS)
        .scrollDisabled(true)
        .introspectScrollView(customize: { view in
            view.contentOffset = CGPoint(
                x: clamp(0 - pan.x, min: 0 - view.frame.width * 2, max: view.frame.width * 2),
                y: clamp(0 - pan.y, min: 0 - view.frame.height * 2, max: view.frame.height * 2)
            )
        })
#endif
    }
    
    var body: some View {
        VStack (alignment: .leading, spacing: 0) {
            titlebar
            canvas
#if os(iOS)
            ColorView(currentColor: $currentColor)
                .padding(.horizontal, 5)
                .background { Color.white }
                .overlay(separator(.top), alignment: .top)
#endif
        }
        #if os(macOS)
        .toolbar {
            ToolbarItem {
                toolset
            }
            ToolbarItem {
                ColorView(currentColor: $currentColor)
            }
            ToolbarItem {
                Spacer()
            }
            ToolbarItemGroup {
                viewtools
            }
        }
        #endif
        .readSize { newSize in
            viewSize = newSize
        }
        .navigationTitle(document.title)
        .navigationBarTitleDisplayMode(.inline)
        .background { Color.white }
        .toolbarBackground(Color.white, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
    }
}


struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationStack() {
            ContentView(document: DottyDocument())
        }
    }
}
