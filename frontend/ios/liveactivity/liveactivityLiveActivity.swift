//
//  liveactivityLiveActivity.swift
//  liveactivity
//
//  Pager2077 Live Activity Widget
//

import ActivityKit
import WidgetKit
import SwiftUI

// MARK: - Activity Attributes (must match main app exactly)

struct PagerActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var sender: String
        var message: String
        var timestamp: Date
        var isDemo: Bool
        var messageIndex: Int
        var totalMessages: Int
        
        init(sender: String, message: String, timestamp: Date = Date(), isDemo: Bool = false, messageIndex: Int = 1, totalMessages: Int = 1) {
            self.sender = sender
            self.message = String(message.prefix(100))
            self.timestamp = timestamp
            self.isDemo = isDemo
            self.messageIndex = messageIndex
            self.totalMessages = totalMessages
        }
    }
    
    var activityType: String = "message"
}

// MARK: - Live Activity Widget

struct liveactivityLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PagerActivityAttributes.self) { context in
            // Lock screen/banner UI - Retro Pager Style
            VStack(alignment: .leading, spacing: 8) {
                // Header
                HStack {
                    Image(systemName: "antenna.radiowaves.left.and.right")
                    Text("PAGER2077")
                        .font(.system(.caption, design: .monospaced))
                        .fontWeight(.bold)
                    Spacer()
                    Text(context.state.timestamp, style: .time)
                        .font(.system(.caption, design: .monospaced))
                }
                .foregroundColor(Color(red: 0.78, green: 0.83, blue: 0.75))
                
                // Sender
                HStack {
                    Text("FROM:")
                        .font(.system(.caption2, design: .monospaced))
                    Text(context.state.sender)
                        .font(.system(.subheadline, design: .monospaced))
                        .fontWeight(.bold)
                }
                .foregroundColor(Color(red: 0.85, green: 0.9, blue: 0.82))
                
                // Message
                Text(context.state.message)
                    .font(.system(.body, design: .monospaced))
                    .foregroundColor(Color(red: 0.85, green: 0.9, blue: 0.82))
                    .lineLimit(3)
                
                // Footer
                HStack {
                    Text("MSG \(context.state.messageIndex)/\(context.state.totalMessages)")
                        .font(.system(.caption2, design: .monospaced))
                    Spacer()
                    if context.state.isDemo {
                        Text("DEMO")
                            .font(.system(.caption2, design: .monospaced))
                    }
                }
                .foregroundColor(Color(red: 0.78, green: 0.83, blue: 0.75).opacity(0.7))
            }
            .padding(16)
            .background(Color(red: 0.1, green: 0.1, blue: 0.1))
            .activityBackgroundTint(Color(red: 0.1, green: 0.1, blue: 0.1))
            
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(context.state.sender)
                        .font(.system(.caption, design: .monospaced))
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.messageIndex)/\(context.state.totalMessages)")
                        .font(.system(.caption2, design: .monospaced))
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.message)
                        .font(.system(.caption, design: .monospaced))
                        .lineLimit(2)
                }
            } compactLeading: {
                Image(systemName: "message.fill")
            } compactTrailing: {
                Text(context.state.sender.prefix(3))
                    .font(.system(.caption2, design: .monospaced))
            } minimal: {
                Image(systemName: "message.fill")
            }
        }
    }
}
