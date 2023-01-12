//
//  DottyDocumentTest.swift
//  DottyTests
//
//  Created by Catherine Wise on 13/8/2022.
//

import XCTest
@testable import Dotty



final class DottyDocumentTest: XCTestCase {
    var onePx: CGImage? = nil

    override func setUpWithError() throws {
        #if os(macOS)
        let nsImage = Bundle(for: type(of: self)).image(forResource: "1px")!
        onePx = nsImage.cgImage(forProposedRect: nil, context: nil, hints: nil)!
        #elseif os(iOS)
        onePx = (UIImage.init(named: "1px")?.cgImage)!
        #endif
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }
    

    func testDefault() throws {
        // it's fine
    }
}
