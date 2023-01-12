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
    
    
    func testSingleRedPixel() throws {
        let decoded = DottyDocument.decode(image: onePx!)
        XCTAssertEqual(decoded.count, 1)
        // order is red, green, blue, alpha
        XCTAssertEqual(decoded[0].components, [1, 0, 0, 1])
        
        let image = DottyDocument.encode(dots: decoded, width: 1, height: 1)
        XCTAssertNotNil(image)
        let data = image?.dataProvider?.data
        XCTAssertNotNil(data)
        print(data!)
        
        let decoded2 = DottyDocument.decode(image: image!)
        XCTAssertEqual(decoded2[0].components, [1, 0, 0, 1])
    }

    func testDefault() throws {
        let decoded = DottyDocument.decode(image: DEFAULT)
        let image = DottyDocument.encode(dots: decoded, width: DEFAULT.width, height: DEFAULT.height)
        XCTAssertNotNil(image)

        let decoded2 = DottyDocument.decode(image: image!)
        XCTAssertEqual(decoded.count, decoded2.count)
        for (idx, color) in decoded.enumerated() {
            XCTAssertTrue(decoded2.count > idx)
            XCTAssertEqual(color, decoded2[idx])
        }
    }
}
