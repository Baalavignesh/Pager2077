//
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
            print("[LiveActivityBridge] areActivitiesEnabled: \(enabled)")
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
            
            print("[LiveActivityBridge] Started activity: \(activity.id)")
            resolve(["success": true, "activityId": activity.id])
            
        } catch {
            print("[LiveActivityBridge] Failed to start activity: \(error)")
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
            print("[LiveActivityBridge] Updated activity: \(activityId)")
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
            print("[LiveActivityBridge] Ended activity: \(activityId)")
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
    
    @objc
    func getPushToken(_ resolve: @escaping RCTPromiseResolveBlock,
                      reject: @escaping RCTPromiseRejectBlock) {
        
        print("[LiveActivityBridge] getPushToken: Starting token retrieval...")
        
        // Push tokens for Live Activities require iOS 17.2+
        // Requirements: 2.4 - Gracefully handle iOS < 17.2
        guard #available(iOS 17.2, *) else {
            print("[LiveActivityBridge] getPushToken: iOS version < 17.2, push-to-start tokens not supported")
            print("[LiveActivityBridge] getPushToken: Push-to-start requires iOS 17.2 or later")
            resolve(nil)
            return
        }
        
        // Check if Live Activities are enabled
        let authInfo = ActivityAuthorizationInfo()
        print("[LiveActivityBridge] getPushToken: Activities enabled: \(authInfo.areActivitiesEnabled)")
        print("[LiveActivityBridge] getPushToken: Frequent push enabled: \(authInfo.frequentPushesEnabled)")
        
        guard authInfo.areActivitiesEnabled else {
            print("[LiveActivityBridge] getPushToken: Live Activities not enabled on this device")
            print("[LiveActivityBridge] getPushToken: User may need to enable Live Activities in Settings")
            resolve(nil)
            return
        }
        
        // Use a flag to track if we've already resolved
        var hasResolved = false
        let resolveOnce: (Any?) -> Void = { value in
            guard !hasResolved else {
                print("[LiveActivityBridge] getPushToken: Already resolved, ignoring duplicate")
                return
            }
            hasResolved = true
            if let token = value as? String {
                print("[LiveActivityBridge] getPushToken: Resolving with token (length: \(token.count))")
            } else {
                print("[LiveActivityBridge] getPushToken: Resolving with nil")
            }
            resolve(value)
        }
        
        Task {
            // Set a timeout - if no token received within 10 seconds, return nil
            // Requirements: 2.4 - Increased timeout from 5s to 10s for better reliability
            let timeoutTask = Task {
                try? await Task.sleep(nanoseconds: 10_000_000_000) // 10 seconds
                if !hasResolved {
                    print("[LiveActivityBridge] getPushToken: Timeout after 10 seconds waiting for push token")
                    print("[LiveActivityBridge] getPushToken: This may happen on first launch or after reinstall")
                    print("[LiveActivityBridge] getPushToken: Token should be available on next app launch")
                    resolveOnce(nil)
                }
            }
            
            print("[LiveActivityBridge] getPushToken: Waiting for pushToStartTokenUpdates...")
            
            // Try to get the push-to-start token
            for await tokenData in Activity<PagerActivityAttributes>.pushToStartTokenUpdates {
                timeoutTask.cancel()
                let tokenString = tokenData.map { String(format: "%02x", $0) }.joined()
                print("[LiveActivityBridge] getPushToken: Received push-to-start token")
                print("[LiveActivityBridge] getPushToken: Token preview: \(tokenString.prefix(20))...")
                print("[LiveActivityBridge] getPushToken: Token length: \(tokenString.count) characters")
                resolveOnce(tokenString)
                return
            }
            
            // If we get here, the async sequence completed without emitting a token
            timeoutTask.cancel()
            print("[LiveActivityBridge] getPushToken: pushToStartTokenUpdates completed without emitting token")
            print("[LiveActivityBridge] getPushToken: This is unexpected - token should be available")
            resolveOnce(nil)
        }
    }
}
