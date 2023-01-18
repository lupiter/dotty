//
//  ColorView.swift
//  Dotty
//
//  Created by Catherine Wise on 15/1/2023.
//

import Foundation
import SwiftUI
import os

let MAX_RECENT = 20

extension Color {
    var intComponents: [Int] {
        if let components = self.cgColor?.components {
            return components.map() { comp in
                lroundf(Float(comp) * 255)
            }
        }
        return []
    }
}

struct ColorView: View {
    @Binding var currentColor: Color
    @State var recentColors: [Color] = []
    
    var body: some View {
        HStack (spacing: 0) {
            ColorPicker(selection: $currentColor, supportsOpacity: true) {
                Text("Paint Color")
            }
            .labelsHidden()
            .padding(.all, 5)
            .onChange(of: currentColor) { newValue in
                for color in recentColors {
                    if color.intComponents == newValue.intComponents {
                        return
                    }
                }
                if recentColors.count >= MAX_RECENT {
                    recentColors.removeFirst()
                }
                recentColors.append(currentColor)
            }
            .background {
                LinearGradient(gradient: GlossyButtonStyle.glossyWhite, startPoint: .top, endPoint: .bottom)
            }
            .clipShape(RoundedRectangle(cornerRadius: 10))
            .shadow(radius: 2, y: 1)
//            .border(Color(white: 0.56))
            .overlay { RoundedRectangle(cornerRadius: 10).stroke(Color(white: 0.56), lineWidth: 0.5) }
            .padding(.all, 5)
            ScrollView(.horizontal) {
                HStack (spacing: 0) {
                    ForEach(recentColors, id:\.self) { color in
                        Button(action: {
                            currentColor = color
                        }, label: {
                            color
                        }).frame(width: 38, height: 38)
                    }
                }
            }
            Spacer()
        }
    }
}

struct ColorView_Previews: PreviewProvider {
    static var previews: some View {
        ColorView(currentColor: .constant(Color.pink), recentColors: [Color.red, Color.orange, Color.yellow, Color.green, Color.blue, Color.purple])
            .previewDisplayName("Many")
        ColorView(currentColor: .constant(Color.red))
            .previewDisplayName("None")
    }
}
