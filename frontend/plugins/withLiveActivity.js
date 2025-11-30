/**
 * Expo Config Plugin for Live Activity Support
 * 
 * This plugin copies LiveActivityBridge files to the iOS project during prebuild
 * and adds them to the Xcode project.
 */

const { withXcodeProject, withDangerousMod, IOSConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// LiveActivityBridge.swift content
const LIVE_ACTIVITY_BRIDGE_SWIFT = `//
//  LiveActivityBridge.swift
//  Pager2077
//
//  Native module to bridge React Native with iOS Live Activity (ActivityKit)
//

import Foundation
import ActivityKit

// MARK: - Activity Attributes (must match Widget Extension exactly)

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

// MARK: - Native Bridge

@objc(LiveActivityBridge)
class LiveActivityBridge: NSObject {
    
    private var currentActivity: Activity<PagerActivityAttributes>?
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    func areActivitiesEnabled(_ resolve: @escaping RCTPromiseResolveBlock,
                              reject: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 16.1, *) {
            let enabled = ActivityAuthorizationInfo().areActivitiesEnabled
            print("[LiveActivityBridge] areActivitiesEnabled: \\(enabled)")
            resolve(enabled)
        } else {
            print("[LiveActivityBridge] iOS version < 16.1, Live Activities not supported")
            resolve(false)
        }
    }
    
    @objc
    func startActivity(_ content: NSDictionary,
                       resolve: @escaping RCTPromiseResolveBlock,
                       reject: @escaping RCTPromiseRejectBlock) {
        
        guard #available(iOS 16.1, *) else {
            resolve(["success": false, "error": "Live Activities require iOS 16.1 or later"])
            return
        }
        
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            resolve(["success": false, "error": "Live Activities are not enabled"])
            return
        }
        
        guard let sender = content["sender"] as? String,
              let message = content["message"] as? String else {
            resolve(["success": false, "error": "Invalid content: sender and message are required"])
            return
        }
        
        let timestamp = content["timestamp"] as? Double ?? Date().timeIntervalSince1970 * 1000
        let isDemo = content["isDemo"] as? Bool ?? false
        let messageIndex = content["messageIndex"] as? Int ?? 1
        let totalMessages = content["totalMessages"] as? Int ?? 1
        
        let attributes = PagerActivityAttributes()
        let contentState = PagerActivityAttributes.ContentState(
            sender: sender,
            message: message,
            timestamp: Date(timeIntervalSince1970: timestamp / 1000),
            isDemo: isDemo,
            messageIndex: messageIndex,
            totalMessages: totalMessages
        )
        
        do {
            if let existingActivity = currentActivity {
                Task {
                    await existingActivity.end(dismissalPolicy: .immediate)
                }
            }
            
            let activity = try Activity.request(
                attributes: attributes,
                content: .init(state: contentState, staleDate: nil),
                pushType: nil
            )
            
            currentActivity = activity
            
            print("[LiveActivityBridge] Started activity: \\(activity.id)")
            resolve(["success": true, "activityId": activity.id])
            
        } catch {
            print("[LiveActivityBridge] Failed to start activity: \\(error)")
            resolve(["success": false, "error": error.localizedDescription])
        }
    }
    
    @objc
    func updateActivity(_ activityId: String,
                        content: NSDictionary,
                        resolve: @escaping RCTPromiseResolveBlock,
                        reject: @escaping RCTPromiseRejectBlock) {
        
        guard #available(iOS 16.1, *) else {
            resolve(["success": false, "error": "Live Activities require iOS 16.1 or later"])
            return
        }
        
        guard let sender = content["sender"] as? String,
              let message = content["message"] as? String else {
            resolve(["success": false, "error": "Invalid content"])
            return
        }
        
        let timestamp = content["timestamp"] as? Double ?? Date().timeIntervalSince1970 * 1000
        let isDemo = content["isDemo"] as? Bool ?? false
        let messageIndex = content["messageIndex"] as? Int ?? 1
        let totalMessages = content["totalMessages"] as? Int ?? 1
        
        let activities = Activity<PagerActivityAttributes>.activities
        guard let activity = activities.first(where: { $0.id == activityId }) else {
            resolve(["success": false, "error": "Activity not found"])
            return
        }
        
        let newState = PagerActivityAttributes.ContentState(
            sender: sender,
            message: message,
            timestamp: Date(timeIntervalSince1970: timestamp / 1000),
            isDemo: isDemo,
            messageIndex: messageIndex,
            totalMessages: totalMessages
        )
        
        Task {
            await activity.update(using: newState)
            print("[LiveActivityBridge] Updated activity: \\(activityId)")
            resolve(["success": true, "activityId": activityId])
        }
    }
    
    @objc
    func endActivity(_ activityId: String,
                     resolve: @escaping RCTPromiseResolveBlock,
                     reject: @escaping RCTPromiseRejectBlock) {
        
        guard #available(iOS 16.1, *) else {
            resolve(["success": false, "error": "Live Activities require iOS 16.1 or later"])
            return
        }
        
        let activities = Activity<PagerActivityAttributes>.activities
        guard let activity = activities.first(where: { $0.id == activityId }) else {
            resolve(["success": false, "error": "Activity not found"])
            return
        }
        
        Task {
            await activity.end(dismissalPolicy: .immediate)
            if currentActivity?.id == activityId {
                currentActivity = nil
            }
            print("[LiveActivityBridge] Ended activity: \\(activityId)")
            resolve(["success": true, "activityId": activityId])
        }
    }
    
    @objc
    func endAllActivities(_ resolve: @escaping RCTPromiseResolveBlock,
                          reject: @escaping RCTPromiseRejectBlock) {
        
        guard #available(iOS 16.1, *) else {
            resolve(["success": false, "error": "Live Activities require iOS 16.1 or later"])
            return
        }
        
        Task {
            for activity in Activity<PagerActivityAttributes>.activities {
                await activity.end(dismissalPolicy: .immediate)
            }
            currentActivity = nil
            print("[LiveActivityBridge] Ended all activities")
            resolve(["success": true])
        }
    }
    
    @objc
    func getCurrentActivityId(_ resolve: @escaping RCTPromiseResolveBlock,
                              reject: @escaping RCTPromiseRejectBlock) {
        
        guard #available(iOS 16.1, *) else {
            resolve(nil)
            return
        }
        
        if let activity = Activity<PagerActivityAttributes>.activities.first {
            resolve(activity.id)
        } else {
            resolve(nil)
        }
    }
}
`;

// Widget Extension Live Activity file content
const WIDGET_LIVE_ACTIVITY_SWIFT = `//
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
                    Text("MSG \\(context.state.messageIndex)/\\(context.state.totalMessages)")
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
                    Text("\\(context.state.messageIndex)/\\(context.state.totalMessages)")
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
`;

// Bridging header content
const BRIDGING_HEADER = `//
// Use this file to import your target's public headers that you would like to expose to Swift.
//

#import <React/RCTBridgeModule.h>
`;

// LiveActivityBridge.m content
const LIVE_ACTIVITY_BRIDGE_M = `//
//  LiveActivityBridge.m
//  Pager2077
//
//  Objective-C bridge to expose LiveActivityBridge to React Native
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(LiveActivityBridge, NSObject)

RCT_EXTERN_METHOD(areActivitiesEnabled:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startActivity:(NSDictionary *)content
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(updateActivity:(NSString *)activityId
                  content:(NSDictionary *)content
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(endActivity:(NSString *)activityId
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(endAllActivities:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCurrentActivityId:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
`;

/**
 * Add files to Xcode project
 */
const withLiveActivityXcode = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectName = config.modRequest.projectName || 'Pager2077';
    const projectRoot = config.modRequest.projectRoot;
    const iosPath = path.join(projectRoot, 'ios', projectName);

    // Ensure directory exists
    if (!fs.existsSync(iosPath)) {
      fs.mkdirSync(iosPath, { recursive: true });
    }

    // Write Swift file
    const swiftPath = path.join(iosPath, 'LiveActivityBridge.swift');
    fs.writeFileSync(swiftPath, LIVE_ACTIVITY_BRIDGE_SWIFT);
    console.log(`[withLiveActivity] Created ${swiftPath}`);

    // Write Objective-C file  
    const mPath = path.join(iosPath, 'LiveActivityBridge.m');
    fs.writeFileSync(mPath, LIVE_ACTIVITY_BRIDGE_M);
    console.log(`[withLiveActivity] Created ${mPath}`);

    // Update bridging header to include React Native imports
    const bridgingHeaderPath = path.join(iosPath, `${projectName}-Bridging-Header.h`);
    fs.writeFileSync(bridgingHeaderPath, BRIDGING_HEADER);
    console.log(`[withLiveActivity] Updated ${bridgingHeaderPath}`);

    // Write Widget Extension Live Activity file
    const widgetExtensionPath = path.join(projectRoot, 'ios', 'liveactivity');
    if (fs.existsSync(widgetExtensionPath)) {
      const widgetLiveActivityPath = path.join(widgetExtensionPath, 'liveactivityLiveActivity.swift');
      fs.writeFileSync(widgetLiveActivityPath, WIDGET_LIVE_ACTIVITY_SWIFT);
      console.log(`[withLiveActivity] Updated ${widgetLiveActivityPath}`);
    } else {
      console.log('[withLiveActivity] Widget extension folder not found, skipping widget file update');
    }

    // Add files to Xcode project
    const targetUuid = xcodeProject.getFirstTarget().uuid;
    
    // Add Swift file
    xcodeProject.addSourceFile(
      `${projectName}/LiveActivityBridge.swift`,
      { target: targetUuid },
      xcodeProject.getFirstProject().firstProject.mainGroup
    );
    
    // Add Objective-C file
    xcodeProject.addSourceFile(
      `${projectName}/LiveActivityBridge.m`,
      { target: targetUuid },
      xcodeProject.getFirstProject().firstProject.mainGroup
    );

    console.log('[withLiveActivity] Added files to Xcode project');

    return config;
  });
};

/**
 * Main plugin export
 */
module.exports = function withLiveActivity(config) {
  return withLiveActivityXcode(config);
};
