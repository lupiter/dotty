//
//  DottyApp.swift
//  Dotty
//
//  Created by Catherine Wise on 1/8/2022.
//

import SwiftUI

@main
struct DottyApp: App {
    var body: some Scene {
        DocumentGroup(newDocument: DottyDocument()) { file in
            ContentView(document: file.$document)
        }
    }
}
