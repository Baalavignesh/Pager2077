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
}
