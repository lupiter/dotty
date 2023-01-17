//
//  GlossyButtonStyle.swift
//  Dotty
//
//  Created by Catherine Wise on 15/1/2023.
//

import Foundation
import SwiftUI

enum ButtonOrder {
    case Leading
    case Center
    case Trailing
    case Alone
}

extension View {
    func cornerRadius(topLeft: CGFloat, topRight: CGFloat, bottomRight: CGFloat, bottomLeft: CGFloat) -> some View {
        clipShape(RoundedCorner(topLeft: topLeft, topRight: topRight, bottomLeft: bottomLeft, bottomRight: bottomRight))
    }
}

struct RoundedCorner: Shape {
    var topLeft: CGFloat = 0.0
    var topRight: CGFloat = 0.0
    var bottomLeft: CGFloat = 0.0
    var bottomRight: CGFloat = 0.0
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        let w = rect.size.width
        let h = rect.size.height
        
        // Make sure we do not exceed the size of the rectangle
        let tr = min(min(self.topRight, h/2), w/2)
        let tl = min(min(self.topLeft, h/2), w/2)
        let bl = min(min(self.bottomLeft, h/2), w/2)
        let br = min(min(self.bottomRight, h/2), w/2)
        
        path.move(to: CGPoint(x: w / 2.0, y: 0))
        path.addLine(to: CGPoint(x: w - tr, y: 0))
        path.addArc(center: CGPoint(x: w - tr, y: tr), radius: tr,
                    startAngle: Angle(degrees: -90), endAngle: Angle(degrees: 0), clockwise: false)
        
        path.addLine(to: CGPoint(x: w, y: h - br))
        path.addArc(center: CGPoint(x: w - br, y: h - br), radius: br,
                    startAngle: Angle(degrees: 0), endAngle: Angle(degrees: 90), clockwise: false)
        
        path.addLine(to: CGPoint(x: bl, y: h))
        path.addArc(center: CGPoint(x: bl, y: h - bl), radius: bl,
                    startAngle: Angle(degrees: 90), endAngle: Angle(degrees: 180), clockwise: false)
        
        path.addLine(to: CGPoint(x: 0, y: tl))
        path.addArc(center: CGPoint(x: tl, y: tl), radius: tl,
                    startAngle: Angle(degrees: 180), endAngle: Angle(degrees: 270), clockwise: false)
        path.closeSubpath()

        return path
    }
}


struct GlossyButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) private var isEnabled
    var order: ButtonOrder = .Alone
    
    static let glossyWhite = Gradient(colors: [
        Color(white: 0.99),
        Color(white: 0.98),
        Color(white: 0.96),
        Color(white: 0.93),
        Color(white: 0.88),
        Color(white: 0.91),
        Color(white: 0.95),
        Color(white: 0.98)
    ])
    
    static let glossyBlue = Gradient(colors: [
        Color(red: 222/255, green: 225/255, blue: 244/255),
        Color(red: 154/255, green: 193/255, blue: 234/255),
        Color(red: 121/255, green: 181/255, blue: 236/255),
        Color(red: 100/255, green: 168/255, blue: 242/255),
        Color(red: 158/255, green: 223/255, blue: 255/255),
        Color(red: 187/255, green: 255/255, blue: 255/255)
    ])
    
    init(order: ButtonOrder = .Alone) {
        self.order = order
    }
    
    @ViewBuilder private func backgroundView(
      configuration: Configuration
    ) -> some View {
      if !isEnabled {
        disabledBackground
      } else if configuration.isPressed {
        pressedBackground
      } else {
        enabledBackground
      }
    }
    
    private var enabledBackground: some View {
      LinearGradient(
        gradient: GlossyButtonStyle.glossyWhite,
        startPoint: .top,
        endPoint: .bottom)
    }

    private var disabledBackground: some View {
      LinearGradient(
        gradient: GlossyButtonStyle.glossyWhite,
        startPoint: .top,
        endPoint: .bottom)
    }

    private var pressedBackground: some View {
      LinearGradient(
        gradient: GlossyButtonStyle.glossyBlue,
        startPoint: .top,
        endPoint: .bottom)
    }
    
    private var corners: UIRectCorner {
        switch order {
        case .Alone:
            return [.allCorners]
        case .Trailing:
            return [.bottomRight, .topRight]
        case .Leading:
            return [.bottomLeft, .topLeft]
        case .Center:
            return []
        }
    }
    
    func makeBody(configuration: Configuration) -> some View {
      HStack {
          configuration.label
      }
      .font(.body.bold())
      .foregroundColor(isEnabled ? .black : .gray)
      .padding()
      .frame(height: 32)
      .background(backgroundView(configuration: configuration))
      .overlay(RoundedCorner(
        topLeft: order == .Alone || order == .Leading ? 10 : 0,
        topRight: order == .Alone || order == .Trailing ? 10 : 0,
        bottomLeft: order == .Alone || order == .Leading ? 10 : 0, bottomRight: order == .Alone || order == .Trailing ? 10 : 0
      ).stroke(Color(white: 0.56), lineWidth: 1))
      .cornerRadius(
        topLeft: order == .Alone || order == .Leading ? 10 : 0,
        topRight: order == .Alone || order == .Trailing ? 10 : 0,
        bottomRight: order == .Alone || order == .Trailing ? 10 : 0,
        bottomLeft: order == .Alone || order == .Leading ? 10 : 0
      )
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
        VStack {
            Button("Normal", action: {}).buttonStyle(GlossyButtonStyle())
            
            HStack (spacing: 0) {
                Button("Left", action: {}).buttonStyle(GlossyButtonStyle(order:.Leading))
                Button("Disabled", action: {}).buttonStyle(GlossyButtonStyle(order:.Trailing)).disabled(true)
            }
            
        }.previewDisplayName("Style")

        GlossyButton(action: {
        }, label: {
            Text("Hi")
        }).previewDisplayName("Button")
    }
}
