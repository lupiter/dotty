//
//  VintageButtonStyle.swift
//  Dotty
//
//  Created by Catherine Wise on 13/1/2023.
//

import Foundation
import SwiftUI

struct VintageButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding(8)
            .frame(minWidth: 38, minHeight: 38)
            .border(.foreground, width: 1)
    }
}

struct VintageButtonStyle_Previews: PreviewProvider {
    static var previews: some View {
        HStack (spacing: 0) {
            Button(action: {}, label: {
                Text("I'm a button!")
            }).buttonStyle(VintageButtonStyle())
            Button(action: {}, label: {
                Image(systemName: "paperplane")
            }).buttonStyle(VintageButtonStyle())
            Button(action: {}, label: {
                Image(systemName: "eraser")
            }).buttonStyle(VintageButtonStyle())
            Button(action: {}, label: {
                Image(systemName: "arrow.up.and.down.and.arrow.left.and.right")
            }).buttonStyle(VintageButtonStyle())
        }
    }
}
