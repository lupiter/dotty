//
//  GlossyButtonStyle.swift
//  Dotty
//
//  Created by Catherine Wise on 15/1/2023.
//

import Foundation
import SwiftUI

struct GlossyButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled
    
    static let glossyWhite = Gradient(colors: [Color(white: 0.99), Color(white: 0.98), Color(white: 0.96), Color(white: 0.93), Color(white: 0.88), Color(white: 0.91), Color(white: 0.95), Color(white: 0.98)])
    
    static let glossyBlue = Gradient(colors: [
        Color(red: 222, green: 225, blue: 244),
        Color(red: 154, green: 193, blue: 234),
        Color(red: 121, green: 181, blue: 236),
        Color(red: 100, green: 168, blue: 242),
        Color(red: 158, green: 223, blue: 255),
        Color(red: 187, green: 255, blue: 255),
    ])
    
    @ViewBuilder private func backgroundView(
      configuration: Configuration
    ) -> some View {
      if !isEnabled { // 1
        disabledBackground
      } else if configuration.isPressed { // 2
        pressedBackground
      } else {
        enabledBackground
      }
    }
    
    // 1
    private var enabledBackground: some View {
      LinearGradient(
        gradient: GlossyButtonStyle.glossyWhite,
        startPoint: .top,
        endPoint: .bottom)
    }

    // 2
    private var disabledBackground: some View {
      LinearGradient(
        colors: [.gray],
        startPoint: .top,
        endPoint: .bottom)
    }

    // 3
    private var pressedBackground: some View {
      LinearGradient(
        gradient: GlossyButtonStyle.glossyBlue,
        startPoint: .top,
        endPoint: .bottom)
      .opacity(0.4)
    }
    
    func makeBody(configuration: Configuration) -> some View {
      // 1
      HStack {
        // 2
        configuration.label
      }
      .font(.body.bold())
      // 3
      .foregroundColor(isEnabled ? .black : .white)
      .padding()
      .frame(height: 44)
      // 4
      .background(backgroundView(configuration: configuration))
      .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color(white: 0.56), lineWidth: 1))
      .cornerRadius(10)
    }
}

struct GlossyButton<Label>: View where Label : View {
    var action: () -> Void
    var label: () -> Label
    
    init(action: @escaping () -> Void, @ViewBuilder label: @escaping () -> Label) {
        self.action = action
        self.label = label
    }
    
    var body: some View {
        Button(action: action, label: label)
        .background(.linearGradient(GlossyButtonStyle.glossyWhite, startPoint: .top, endPoint: .bottom))
        .overlay() {
            RoundedRectangle(cornerRadius: 10).stroke(Color(white: 0.56), lineWidth: 1)
        }
    }
    
    
}

struct GlossyButtonStyle_Previews: PreviewProvider {
    static var previews: some View {
        Button("Hi", action: {}).buttonStyle(GlossyButtonStyle()).previewDisplayName("Style")

        GlossyButton(action: {
        }, label: {
            Text("Hi")
        }).previewDisplayName("Button")
    }
}
