//
//  ColorView.swift
//  Dotty
//
//  Created by Catherine Wise on 15/1/2023.
//

import Foundation
import SwiftUI

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
}
