//
//  liveactivityLiveActivity.swift
//  liveactivity
//
//  Pager2077 Live Activity Widget - Retro Pager Device Design
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
    // LCD Colors
    static let lcdGreen = Color(red: 0.545, green: 0.616, blue: 0.498) // #8B9D7F
    static let lcdTextDark = Color(red: 0.102, green: 0.149, blue: 0.094) // #1a2618
    static let lcdBorder = Color(red: 0.42, green: 0.49, blue: 0.37)
    
    // Pager Frame Colors (metallic dark grey)
    static let pagerFrameOuter = Color(red: 0.12, green: 0.12, blue: 0.14) // #1f1f24
    static let pagerFrameMiddle = Color(red: 0.22, green: 0.22, blue: 0.25) // #383840
    static let pagerFrameInner = Color(red: 0.16, green: 0.16, blue: 0.18) // #29292e
    static let pagerFrameHighlight = Color(red: 0.35, green: 0.35, blue: 0.38) // #595961
    static let pagerFrameShadow = Color(red: 0.08, green: 0.08, blue: 0.10) // #141419
    
    // Screen bezel (darker inset)
    static let screenBezel = Color(red: 0.06, green: 0.06, blue: 0.08) // #0f0f14
}

// MARK: - LCD Screen View

struct LCDScreenView: View {
    let sender: String
    let message: String
    let timestamp: Date
    let isDemo: Bool
    let messageIndex: Int
    let totalMessages: Int
    
    var body: some View {
        ZStack {
            // LCD background
            RoundedRectangle(cornerRadius: 4)
                .fill(Color.lcdGreen)
            
            // LCD border
            RoundedRectangle(cornerRadius: 4)
                .strokeBorder(Color.lcdBorder, lineWidth: 1.5)
            
            // Content
            VStack(alignment: .leading, spacing: 3) {
                // Header row
                HStack(spacing: 3) {
                    Text("FROM:")
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                    Text(sender.uppercased())
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .lineLimit(1)
                    Spacer()
                    if isDemo {
                        Text("DEMO")
                            .font(.system(size: 8, weight: .medium, design: .monospaced))
                            .padding(.horizontal, 3)
                            .padding(.vertical, 1)
                            .background(Color.lcdTextDark.opacity(0.15))
                            .cornerRadius(2)
                    }
                }
                
                // Message
                Text(message.uppercased())
                    .font(.system(size: 12, weight: .semibold, design: .monospaced))
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
                
                Spacer(minLength: 2)
                
                // Footer row
                HStack {
                    Text(timestamp, style: .time)
                        .font(.system(size: 10, weight: .medium, design: .monospaced))
                    Spacer()
                    Text(timestamp, format: .dateTime.day(.twoDigits).month(.twoDigits).year())
                        .font(.system(size: 10, weight: .medium, design: .monospaced))
                }
            }
            .foregroundColor(Color.lcdTextDark)
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            
            // Scanlines overlay
            VStack(spacing: 0) {
                ForEach(0..<30, id: \.self) { i in
                    Rectangle()
                        .fill(Color.black.opacity(i % 2 == 0 ? 0.03 : 0.0))
                        .frame(height: 2)
                }
            }
            .allowsHitTesting(false)
            .clipShape(RoundedRectangle(cornerRadius: 4))
        }
    }
}

// MARK: - Pager Device View (Full Device Frame)

struct PagerDeviceView: View {
    let context: ActivityViewContext<PagerActivityAttributes>
    
    var body: some View {
        ZStack {
            // Outer frame with gradient (metallic effect)
            RoundedRectangle(cornerRadius: 16)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.pagerFrameHighlight,
                            Color.pagerFrameMiddle,
                            Color.pagerFrameOuter,
                            Color.pagerFrameShadow
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
            
            // Inner frame layer
            RoundedRectangle(cornerRadius: 14)
                .fill(
                    LinearGradient(
                        colors: [
                            Color.pagerFrameOuter,
                            Color.pagerFrameInner,
                            Color.pagerFrameOuter
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .padding(2)
            
            // Screen bezel (dark inset area)
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.screenBezel)
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
            
            // LCD Screen
            LCDScreenView(
                sender: context.state.sender,
                message: context.state.message,
                timestamp: context.state.timestamp,
                isDemo: context.state.isDemo,
                messageIndex: context.state.messageIndex,
                totalMessages: context.state.totalMessages
            )
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            
            // Top decorative elements (speaker grille dots)
            VStack {
                HStack(spacing: 3) {
                    ForEach(0..<5, id: \.self) { _ in
                        Circle()
                            .fill(Color.pagerFrameShadow)
                            .frame(width: 3, height: 3)
                    }
                }
                .padding(.top, 3)
                Spacer()
            }
            
            // Side accent line (left)
            HStack {
                RoundedRectangle(cornerRadius: 1)
                    .fill(Color.pagerFrameHighlight.opacity(0.5))
                    .frame(width: 2)
                    .padding(.vertical, 20)
                    .padding(.leading, 3)
                Spacer()
            }
            
            // Brand text at bottom
            VStack {
                Spacer()
                Text("PAGER2077")
                    .font(.system(size: 7, weight: .bold, design: .monospaced))
                    .foregroundColor(Color.pagerFrameHighlight.opacity(0.6))
                    .padding(.bottom, 2)
            }
        }
    }
}

// MARK: - Retro LCD View (Legacy - for backward compatibility)

struct RetroLCDView: View {
    let context: ActivityViewContext<PagerActivityAttributes>
    
    var body: some View {
        PagerDeviceView(context: context)
    }
}

// MARK: - Live Activity Widget

struct liveactivityLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PagerActivityAttributes.self) { context in
            PagerDeviceView(context: context)
                .activityBackgroundTint(Color.pagerFrameOuter)
            
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    HStack(spacing: 4) {
                        Image(systemName: "antenna.radiowaves.left.and.right")
                            .font(.system(size: 10))
                        Text(context.state.sender.prefix(6).uppercased())
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                    }
                    .foregroundColor(Color.lcdGreen)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.messageIndex)/\(context.state.totalMessages)")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(Color.lcdGreen.opacity(0.7))
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text(context.state.message.uppercased())
                        .font(.system(size: 12, weight: .medium, design: .monospaced))
                        .foregroundColor(Color.lcdGreen)
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
