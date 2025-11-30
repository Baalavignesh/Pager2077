//
//  liveactivityLiveActivity.swift
//  liveactivity
//
//  Pager2077 Live Activity Widget - Classic Pager Design
//

import ActivityKit
import WidgetKit
import SwiftUI

// MARK: - Activity Attributes

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

// MARK: - Colors

extension Color {
    static let lcdGreen = Color(red: 0.55, green: 0.62, blue: 0.50)
    static let lcdText = Color(red: 0.15, green: 0.20, blue: 0.12)
    static let pagerBlack = Color(red: 0.10, green: 0.10, blue: 0.10)
    static let buttonBase = Color(red: 0.20, green: 0.20, blue: 0.20)
    static let btnYellow = Color(red: 0.95, green: 0.75, blue: 0.15)
    static let btnRed = Color(red: 0.80, green: 0.22, blue: 0.22)
    static let btnGreen = Color(red: 0.15, green: 0.60, blue: 0.40)
}

// MARK: - Classic Pager View

struct ClassicPagerView: View {
    let context: ActivityViewContext<PagerActivityAttributes>
    
    var body: some View {
        VStack(spacing: 0) {
            // Brand name
            Text("PAGER2077")
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(Color(red: 0.65, green: 0.55, blue: 0.35))
                .tracking(2)
                .padding(.top, 8)
                .padding(.bottom, 6)
            
            // LCD Screen
            ZStack {
                // Black bezel
                RoundedRectangle(cornerRadius: 6)
                    .fill(Color.black)
                
                // LCD
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.lcdGreen)
                    .padding(4)
                
                // Content
                VStack(alignment: .leading, spacing: 2) {
                    Text(String(format: "%02d", context.state.messageIndex) + ": " + context.state.sender.uppercased())
                        .font(.system(size: 12, weight: .semibold, design: .monospaced))
                        .lineLimit(1)
                    
                    Text(context.state.message.uppercased())
                        .font(.system(size: 12, weight: .medium, design: .monospaced))
                        .lineLimit(2)
                    
                    Spacer(minLength: 2)
                    
                    HStack {
                        Text(context.state.timestamp, style: .time)
                            .font(.system(size: 11, weight: .medium, design: .monospaced))
                        Spacer()
                        Text(context.state.timestamp, format: .dateTime.day(.twoDigits).month(.twoDigits).year())
                            .font(.system(size: 11, weight: .medium, design: .monospaced))
                    }
                }
                .foregroundColor(Color.lcdText)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
            }
            .padding(.horizontal, 12)
            .frame(height: 80)
            
            // Buttons row - bigger buttons
            HStack(spacing: 12) {
                // Yellow left arrow
                PagerButton(iconColor: .btnYellow, icon: "arrowtriangle.left.fill")
                
                // Yellow right arrow
                PagerButton(iconColor: .btnYellow, icon: "arrowtriangle.right.fill")
                
                // Red triangle
                PagerButton(iconColor: .btnRed, icon: "arrowtriangle.up.fill")
                
                Spacer()
                
                // Green power - wider
                PagerButton(iconColor: .btnGreen, icon: "power", isWide: true)
            }
            .padding(.horizontal, 14)
            .padding(.top, 8)
            .padding(.bottom, 12)
        }
    }
}

// MARK: - Pager Button

struct PagerButton: View {
    let iconColor: Color
    let icon: String
    var isWide: Bool = false
    
    var body: some View {
        ZStack {
            // Button shape - oval/capsule
            Capsule()
                .fill(Color.buttonBase)
                .frame(width: isWide ? 50 : 40, height: 28)
                .overlay(
                    Capsule()
                        .stroke(Color.black.opacity(0.5), lineWidth: 1)
                )
                .shadow(color: .black.opacity(0.4), radius: 1, y: 1)
            
            // Icon
            Image(systemName: icon)
                .font(.system(size: isWide ? 14 : 10, weight: .bold))
                .foregroundColor(iconColor)
        }
    }
}

// MARK: - Live Activity Widget

struct liveactivityLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PagerActivityAttributes.self) { context in
            ClassicPagerView(context: context)
                .activityBackgroundTint(Color.pagerBlack)
            
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
