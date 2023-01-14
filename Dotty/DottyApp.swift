//
//  DottyApp.swift
//  Dotty
//
//  Created by Catherine Wise on 1/8/2022.
//

import SwiftUI

@main
struct DottyApp: App {
    @Environment(\.dismiss) var dismiss
    
    var body: some Scene {
        DocumentGroup(newDocument: DottyDocument()) { file in
            ContentView(document: file.$document, scale: 1.0, superDismiss: dismiss)
        }
#if os(macOS)
        .windowToolbarStyle(.expanded)
#endif
    }
}
