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
//    let twist: Angle
    let move: CGPoint
    
    static let zero: MultiTouchDelta =
        MultiTouchDelta(
            spread: 0,
//            twist: Angle(),
            move: CGPoint(x: 0, y: 0)
        )
    
    static func diff(start: [UITouch:CGPoint], end: Set<UITouch>) -> MultiTouchDelta {
        let startCenter = Array(start.values).center()
        let endCenter = end.center()
        let move = CGPoint(x: endCenter.x - startCenter.x, y: endCenter.y - startCenter.y)
        guard start.count > 1 else { // One touch doesn't give us enough data for spread or twist
            return MultiTouchDelta(
                spread: 0.0,
//                twist: Angle(),
                move: move
            )
        }
        let spread = end.distance() - Array(start.values).distance()
        os_log("spread %f , %f ; %f", end.distance(), Array(start.values).distance(), spread)
        
//        let angleSum = end.reduce(Angle()) { angle, touch in
//            let location = touch.location(in: touch.view)
//            let unmoved = CGPoint(x: location.x - move.x, y: location.y - move.y)
//            guard let previous = start[touch] else {
//                return angle
//            }
//
//            let result = atan2(unmoved.y - startCenter.y, unmoved.x - startCenter.x) -
//                            atan2(previous.y - startCenter.y, previous.x - startCenter.x);
//            return Angle(radians: result)
//        }
        
        return MultiTouchDelta(
            spread: spread,
//            twist: Angle(radians: angleSum.radians / Double(end.count)),
            move: move
        )
    }
}

struct MultiTouch {
//    let fromStart: MultiTouchDelta
    let fromLast: MultiTouchDelta
    let origin: CGPoint
    let center: CGPoint
    let touches: Int
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
        let center = center()
        let diff = self.reduce(0.0) {
            return $0 + $1.distance(to: center)
        }
        os_log("point distance calc %f / %d = %f", diff, self.count, diff / Double(self.count))
        return diff / Double(self.count)
    }
}

extension Set<UITouch> {
    func center() -> CGPoint {
        guard self.count > 0 else {
            return CGPoint()
        }
        guard self.count > 1 else { // Save some maths if there's only one
            return self.first!.location(in: self.first!.view)
        }
        let sum = self.reduce(CGPoint(x: 0, y: 0)) {
            let loc = $1.location(in: $1.view)
            return CGPoint(x: $0.x + loc.x, y: $0.y + loc.y)
        }
        return CGPoint(x: sum.x / CGFloat(self.count), y: sum.y / CGFloat(self.count))
    }
    
    func distance() -> CGFloat {
        guard self.count > 1 else { // Save some maths again
            return 0
        }
        let center = center()
        let diff = self.reduce(0.0) {
            let loc = $1.location(in: $1.view)
            let distance = loc.distance(to: center)
            return $0 + distance
        }
        os_log("touch distance calc %f / %d = %f", diff, self.count, diff / Double(self.count))
        return diff / Double(self.count)
    }
}

class NFingerGestureRecognizer: UIGestureRecognizer {

    var touchCallback: (MultiTouch) -> Void
    var origin: CGPoint = CGPoint(x: 0, y: 0)
    var previous: [UITouch:CGPoint]

    init(
        target: Any?,
        touchCallback: @escaping (MultiTouch) -> ()
    ) {
        self.touchCallback = touchCallback
        self.previous = [:]
        super.init(target: target, action: nil)
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent) {
        for touch in touches {
            let location = touch.location(in: touch.view)
            previous[touch] = location
        }
        origin = touches.center()
        touchCallback(MultiTouch(
            fromLast: MultiTouchDelta.zero,
            origin: origin,
            center: origin,
            touches: touches.count,
            type: .Start
        ))
    }

    override func touchesMoved(_ touches: Set<UITouch>, with event: UIEvent) {
        touchCallback(MultiTouch(
            fromLast: MultiTouchDelta.diff(start: previous, end: touches),
            origin: origin,
            center: touches.center(),
            touches: previous.count,
            type: .Move
        ))
        
        for touch in touches {
            let newLocation = touch.location(in: touch.view)
            previous[touch] = newLocation
        }
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent) {
        touchCallback(MultiTouch(
            fromLast: MultiTouchDelta.diff(start: previous, end: touches),
            origin: origin,
            center: touches.center(),
            touches: previous.count,
            type: .End
        ))
        
        for touch in touches {
            previous.removeValue(forKey: touch)
        }
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
