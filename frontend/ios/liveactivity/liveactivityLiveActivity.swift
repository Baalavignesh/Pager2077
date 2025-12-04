//
//  liveactivityLiveActivity.swift
//  liveactivity
//
//  Created by Baalavignesh Arunachalam on 12/4/25.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct liveactivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var emoji: String
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
}

struct liveactivityLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: liveactivityAttributes.self) { context in
            // Lock screen/banner UI goes here
            VStack {
                Text("Hello \(context.state.emoji)")
            }
            .activityBackgroundTint(Color.cyan)
            .activitySystemActionForegroundColor(Color.black)

        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI goes here.  Compose the expanded UI through
                // various regions, like leading/trailing/center/bottom
                DynamicIslandExpandedRegion(.leading) {
                    Text("Leading")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("Trailing")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("Bottom \(context.state.emoji)")
                    // more content
                }
            } compactLeading: {
                Text("L")
            } compactTrailing: {
                Text("T \(context.state.emoji)")
            } minimal: {
                Text(context.state.emoji)
            }
            .widgetURL(URL(string: "http://www.apple.com"))
            .keylineTint(Color.red)
        }
    }
}

extension liveactivityAttributes {
    fileprivate static var preview: liveactivityAttributes {
        liveactivityAttributes(name: "World")
    }
}

extension liveactivityAttributes.ContentState {
    fileprivate static var smiley: liveactivityAttributes.ContentState {
        liveactivityAttributes.ContentState(emoji: "😀")
     }
     
     fileprivate static var starEyes: liveactivityAttributes.ContentState {
         liveactivityAttributes.ContentState(emoji: "🤩")
     }
}

#Preview("Notification", as: .content, using: liveactivityAttributes.preview) {
   liveactivityLiveActivity()
} contentStates: {
    liveactivityAttributes.ContentState.smiley
    liveactivityAttributes.ContentState.starEyes
}
