//
//  MultiTouchView.swift
//  Dotty
//
//  Created by Catherine Wise on 14/1/2023.
//

import Foundation
import SwiftUI
import os

#if os(iOS)
// https://stackoverflow.com/questions/61566929/swiftui-multitouch-gesture-multiple-gestures
import UIKit

enum TouchType {
    case Start
    case Move
    case End
}

struct MultiTouchDelta {
    let spread: CGFloat
    let move: CGPoint
    
    static let zero: MultiTouchDelta =
        MultiTouchDelta(
            spread: 0,
            move: CGPoint(x: 0, y: 0)
        )
    
    static func calculate(touches: Set<UITouch>) -> MultiTouchDelta {
        let previous = touches.map() { $0.previousLocation(in: $0.view)}
        let previousCenter = previous.center()
        let endCenter = touches.center()
        let move = CGPoint(x: endCenter.x - previousCenter.x, y: endCenter.y - previousCenter.y)
        guard touches.count > 1 else { // One touch doesn't give us enough data for spread or twist
            return MultiTouchDelta(
                spread: 0.0,
                move: move
            )
        }
        let spread = touches.distance() - previous.distance()
        os_log("spread %f , %f ; %f \n move %f , %f", touches.distance(), previous.distance(), spread, move.x, move.y)
        
        return MultiTouchDelta(
            spread: spread,
            move: move
        )
    }
    
    
}

struct MultiTouch {
    let fromLast: MultiTouchDelta
    let touches: Int
    let center: CGPoint
    let type: TouchType
}

extension CGPoint {
    func distanceSquared(to: CGPoint) -> CGFloat {
        return (self.x - to.x) * (self.x - to.x) + (self.y - to.y) * (self.y - to.y)
    }
    
    func distance(to: CGPoint) -> CGFloat {
        return sqrt(distanceSquared(to: to))
    }
}

extension [CGPoint] {
    func center() -> CGPoint {
        guard self.count > 0 else {
            return CGPoint()
        }
        guard self.count > 1 else { // Save some maths if there's only one
            return self.first!
        }
        let sum = self.reduce(CGPoint(x: 0, y: 0)) {
            return CGPoint(x: $0.x + $1.x, y: $0.y + $1.y)
        }
        return CGPoint(x: sum.x / CGFloat(self.count), y: sum.y / CGFloat(self.count))
    }
    
    func distance() -> CGFloat {
        guard self.count > 1 else { // Save some maths again
            return 0
        }
        // ignore everything after the first two, sorry
        return self[0].distance(to: self[1])
    }
}

extension Set<UITouch> {
    func center() -> CGPoint {
        guard self.count > 0 else {
            return CGPoint()
        }
        return self.map() { $0.location(in: $0.view) }.center()
    }
    
    func distance() -> CGFloat {
        guard self.count > 1 else { // Save some maths again
            return 0
        }
        return self.map() { $0.location(in: $0.view) }.distance()
    }
}

class NFingerGestureRecognizer: UIGestureRecognizer {

    var touchCallback: (MultiTouch) -> Void
    var touchCount: Int? = nil

    init(
        target: Any?,
        touchCallback: @escaping (MultiTouch) -> ()
    ) {
        self.touchCallback = touchCallback
        super.init(target: target, action: nil)
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent) {
        touchCount = touches.count
        touchCallback(MultiTouch(
            fromLast: MultiTouchDelta.zero,
            touches: touches.count,
            center: touches.center(),
            type: .Start
        ))
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent) {
        touchCount = max(touchCount ?? touches.count, touches.count)
        touchCallback(MultiTouch(
            fromLast: MultiTouchDelta.calculate(touches: touches),
            touches: touchCount ?? touches.count,
            center: touches.center(),
            type: .Move
        ))
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent) {
        touchCount = max(touchCount ?? 1, touches.count)
        touchCallback(MultiTouch(
            fromLast: MultiTouchDelta.calculate(touches: touches),
            touches: touchCount ?? touches.count,
            center: touches.center(),
            type: .End
        ))
    }

}

struct TapView: UIViewRepresentable {

    var touchCallback: (MultiTouch) -> Void

    func makeUIView(context: UIViewRepresentableContext<TapView>) -> TapView.UIViewType {
        let v = UIView(frame: .zero)
        let gesture = NFingerGestureRecognizer(
            target: context.coordinator,
            touchCallback: touchCallback
        )
        v.addGestureRecognizer(gesture)
        return v
    }
    
    func updateUIView(_ uiView: UIView, context: UIViewRepresentableContext<TapView>) {
        // empty
    }

}
#endif
