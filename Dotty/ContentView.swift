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

struct ContentView: View {
    @ObservedObject var document: DottyDocument
    @State var currentColor: Color = Color(red: 0.5, green: 0.0, blue: 0.5)
    @State var activeTool: Tool = Tool.Pen
    @State var viewSize: CGSize = CGSize(width: 0, height: 0)
    @State var scale: CGFloat = 22.0
    @Environment(\.undoManager) var undoManager
    
    @ViewBuilder
    var toolset: some View {
        GlossyPicker(selection: $activeTool, options: [
            GlossyPickerOption(id: Tool.Pen, icon: "paintbrush.pointed.fill", label: "Paint"),
            GlossyPickerOption(id: Tool.Eraser, icon: "eraser", label: "Erase"),
            GlossyPickerOption(id: Tool.Fill, icon: "drop.fill", label: "Flood Fill"),
            GlossyPickerOption(id: Tool.Move, icon: "arrow.up.and.down.and.arrow.left.and.right", label: "Move"),
        ])
        .fixedSize()
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
                .buttonStyle(GlossyButtonStyle(order: viewSize.width > 500 ? .Center : .Trailing))
                
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
        .frame(height: 42)
        .background(alignment: .bottom) {
            stripes
        }
        .overlay(separator(.bottom), alignment: .bottom)
    }
    
    
    
    var body: some View {
        VStack (alignment: .leading, spacing: 0) {
            titlebar
            GeometryReader { _ in
                CanvasView(document: document, currentColor: $currentColor, currentTool: $activeTool, scale: $scale)
            }.zIndex(-1)
#if os(iOS)
            ColorView(currentColor: $currentColor)
                .padding(.horizontal, 5)
                .background(alignment:.top) {
                    stripes
                }
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
            ContentView(document: DottyDocument(), scale: 30)
        }
    }
}
