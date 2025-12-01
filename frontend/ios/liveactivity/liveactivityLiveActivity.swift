//
//  liveactivityLiveActivity.swift
//  liveactivity
//
//  Pager2077 Live Activity Widget - Retro LCD Design
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

// MARK: - Color Constants

extension Color {
    static let lcdGreen = Color(red: 0.545, green: 0.616, blue: 0.498) // #8B9D7F
    static let lcdTextDark = Color(red: 0.102, green: 0.149, blue: 0.094) // #1a2618
    static let lcdBorder = Color(red: 0.42, green: 0.49, blue: 0.37)
}

// MARK: - Retro LCD View

struct RetroLCDView: View {
    let context: ActivityViewContext<PagerActivityAttributes>
    
    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.lcdGreen)
            
            RoundedRectangle(cornerRadius: 8)
                .strokeBorder(Color.lcdBorder, lineWidth: 3)
            
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 4) {
                    Text(String(format: "%02d", context.state.messageIndex) + ":")
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                    Text(context.state.sender.uppercased())
                        .font(.system(size: 13, weight: .bold, design: .monospaced))
                        .lineLimit(1)
                    Spacer()
                    if context.state.isDemo {
                        Text("DEMO")
                            .font(.system(size: 10, weight: .medium, design: .monospaced))
                            .padding(.horizontal, 4)
                            .padding(.vertical, 2)
                            .background(Color.lcdTextDark.opacity(0.15))
                            .cornerRadius(2)
                    }
                }
                
                Text(context.state.message.uppercased())
                    .font(.system(size: 14, weight: .semibold, design: .monospaced))
                    .lineLimit(3)
                    .fixedSize(horizontal: false, vertical: true)
                
                Spacer(minLength: 4)
                
                HStack {
                    Text(context.state.timestamp, style: .time)
                        .font(.system(size: 12, weight: .medium, design: .monospaced))
                    Spacer()
                    Text(context.state.timestamp, format: .dateTime.day(.twoDigits).month(.twoDigits).year())
                        .font(.system(size: 12, weight: .medium, design: .monospaced))
                }
            }
            .foregroundColor(Color.lcdTextDark)
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            
            VStack(spacing: 0) {
                ForEach(0..<40, id: \.self) { i in
                    Rectangle()
                        .fill(Color.black.opacity(i % 2 == 0 ? 0.04 : 0.0))
                        .frame(height: 2)
                }
            }
            .allowsHitTesting(false)
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }
}

// MARK: - Live Activity Widget

struct liveactivityLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PagerActivityAttributes.self) { context in
            RetroLCDView(context: context)
                .activityBackgroundTint(Color.lcdGreen)
            
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 4) {
                        Image(systemName: "antenna.radiowaves.left.and.right")
                            .font(.system(size: 10))
                        Text(context.state.sender.prefix(6).uppercased())
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                    }
                    .foregroundColor(Color.lcdTextDark)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.messageIndex)/\(context.state.totalMessages)")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(Color.lcdTextDark.opacity(0.7))
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.message.uppercased())
                        .font(.system(size: 12, weight: .medium, design: .monospaced))
                        .foregroundColor(Color.lcdTextDark)
                        .lineLimit(2)
                }
            } compactLeading: {
                Image(systemName: "antenna.radiowaves.left.and.right")
                    .font(.system(size: 12))
                    .foregroundColor(Color.lcdGreen)
            } compactTrailing: {
                Text(context.state.sender.prefix(3).uppercased())
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundColor(Color.lcdGreen)
            } minimal: {
                Image(systemName: "antenna.radiowaves.left.and.right")
                    .font(.system(size: 12))
                    .foregroundColor(Color.lcdGreen)
            }
        }
    }
}
