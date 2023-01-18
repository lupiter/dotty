//
//  GlossyPicker.swift
//  Dotty
//
//  Created by Catherine Wise on 18/1/2023.
//

import SwiftUI

struct GlossyPickerOption<SelectionValue>: Identifiable where SelectionValue : Hashable {
    var id: SelectionValue
    let icon: String
    let label: String
}

struct GlossyPicker<SelectionValue> : View where SelectionValue : Hashable  {
    @Binding var selection: SelectionValue
    var options: [GlossyPickerOption<SelectionValue>]
    
    var body: some View {
        HStack (spacing: 0) {
            ForEach(options) { option in
                let order: ButtonOrder = option.id == options.first?.id ? .Leading : option.id == options.last?.id ? .Trailing : .Center
                Button(action: {
                    selection = option.id
                }, label: {
                    Image(systemName: option.icon)
                })
                .accessibilityLabel(option.label)
                .buttonStyle(GlossyButtonStyle(
                    order: order,
                    active: option.id == selection
                ))
            }
        }
    }
}

struct GlossyPicker_Previews: PreviewProvider {
    
    static var previews: some View {
        GlossyPicker(selection: .constant(Tool.Fill), options: [
            GlossyPickerOption(id: .Fill, icon: "drop", label: "Fill"),
            GlossyPickerOption(id: .Eraser, icon: "eraser", label: "Eraser"),
            GlossyPickerOption(id: .Move, icon: "arrow.up", label: "Move")
        ])
    }
}
