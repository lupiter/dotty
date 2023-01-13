//
//  VintageButtonStyle.swift
//  Dotty
//
//  Created by Catherine Wise on 13/1/2023.
//

import Foundation
import SwiftUI

struct PickerOption<Label, SelectionValue> where Label: View, SelectionValue: Hashable {
    let value: SelectionValue
    let label: Label
}

struct VintagePicker<Label, SelectionValue>: View where Label : View, SelectionValue : Hashable {
    @Binding var selection: SelectionValue
    var options: [PickerOption<Label, SelectionValue>]
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(options, id:\.value) { itm in
                Button(action: {
                    selection = itm.value
                }, label: {
                    itm.label
                }).buttonStyle(VintageButtonStyle())
                .if(selection == itm.value) { view in
                    view
                        .colorInvert()
                        .background(.foreground)
                        .border(.foreground)
                }
            }
        }
    }
}



struct VintagePicker_Previews: PreviewProvider {
    
    static var previews: some View {
        HStack {
            VintagePicker(selection: .constant(.Pen), options: [
                PickerOption(value: Tool.Pen, label: Image(systemName: "paintbrush.pointed.fill").accessibilityLabel("Paint")),
                PickerOption(value: Tool.Eraser, label: Image(systemName: "eraser").accessibilityLabel("Erase")),
                PickerOption(value: Tool.Move, label: Image(systemName: "arrow.up.and.down.and.arrow.left.and.right").accessibilityLabel("Move"))
            ])
        }
    }
}
