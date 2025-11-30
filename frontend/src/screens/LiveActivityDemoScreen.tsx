import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { PagerScreen, PagerText } from '../components/PagerScreen';
import {
  startDemoActivity,
  updateDemoActivity,
  endActivity,
  endAllActivities,
  areActivitiesEnabled,
  getCurrentActivityId,
} from '../services/liveActivityService';

interface LiveActivityDemoScreenProps {
  selectedIndex: number;
}

export interface LiveActivityDemoScreenHandle {
  handleSelect: () => void;
}

type ActivityState = 'idle' | 'starting' | 'active' | 'updating' | 'ending';

export const LiveActivityDemoScreen = forwardRef<LiveActivityDemoScreenHandle, LiveActivityDemoScreenProps>(({
  selectedIndex,
}, ref) => {
  const [activityState, setActivityState] = useState<ActivityState>('idle');
  const [activityId, setActivityId] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  const demoMessages = [
    'Hey! New voice message!',
    'Check this out...',
    'Are you there?',
    'Important update!',
    'Call me back ASAP',
  ];

  // Check if Live Activities are enabled on mount
  useEffect(() => {
    checkEnabled();
    checkCurrentActivity();
  }, []);

  const checkEnabled = async () => {
    const enabled = await areActivitiesEnabled();
    setIsEnabled(enabled);
  };

  const checkCurrentActivity = async () => {
    const id = await getCurrentActivityId();
    if (id) {
      setActivityId(id);
      setActivityState('active');
    }
  };

  const handleStartActivity = async () => {
    setActivityState('starting');
    setLastError(null);
    
    const result = await startDemoActivity();
    
    if (result.success && result.activityId) {
      setActivityId(result.activityId);
      setActivityState('active');
      console.log('[Demo] Started activity:', result.activityId);
    } else {
      setActivityState('idle');
      setLastError(result.error || 'Failed to start');
      console.log('[Demo] Failed to start:', result.error);
    }
  };

  const handleUpdateActivity = async () => {
    if (!activityId) return;
    
    setActivityState('updating');
    setLastError(null);
    
    const nextIndex = (messageIndex + 1) % demoMessages.length;
    const result = await updateDemoActivity(activityId, demoMessages[nextIndex]);
    
    if (result.success) {
      setMessageIndex(nextIndex);
      setActivityState('active');
      console.log('[Demo] Updated activity');
    } else {
      setActivityState('active');
      setLastError(result.error || 'Failed to update');
      console.log('[Demo] Failed to update:', result.error);
    }
  };

  const handleEndActivity = async () => {
    if (!activityId) return;
    
    setActivityState('ending');
    setLastError(null);
    
    const result = await endActivity(activityId);
    
    if (result.success) {
      setActivityId(null);
      setActivityState('idle');
      setMessageIndex(0);
      console.log('[Demo] Ended activity');
    } else {
      setActivityState('active');
      setLastError(result.error || 'Failed to end');
      console.log('[Demo] Failed to end:', result.error);
    }
  };

  const handleEndAllActivities = async () => {
    setActivityState('ending');
    setLastError(null);
    
    const result = await endAllActivities();
    
    if (result.success) {
      setActivityId(null);
      setActivityState('idle');
      setMessageIndex(0);
      console.log('[Demo] Ended all activities');
    } else {
      setActivityState('idle');
      setLastError(result.error || 'Failed to end all');
    }
  };

  // Handle selection based on selectedIndex
  const handleSelect = () => {
    switch (selectedIndex) {
      case 0:
        if (activityState === 'idle') {
          handleStartActivity();
        }
        break;
      case 1:
        if (activityState === 'active') {
          handleUpdateActivity();
        }
        break;
      case 2:
        if (activityState === 'active') {
          handleEndActivity();
        }
        break;
      case 3:
        handleEndAllActivities();
        break;
    }
  };

  // Expose handleSelect to parent via ref
  useImperativeHandle(ref, () => ({
    handleSelect,
  }));

  // Not iOS
  if (Platform.OS !== 'ios') {
    return (
      <PagerScreen title="LIVE ACTIVITY">
        <PagerText>LIVE ACTIVITIES</PagerText>
        <PagerText>ARE ONLY AVAILABLE</PagerText>
        <PagerText>ON iOS DEVICES</PagerText>
        <View style={styles.spacer} />
        <PagerText>PRESS BACK TO</PagerText>
        <PagerText>RETURN</PagerText>
      </PagerScreen>
    );
  }

  // Checking status
  if (isEnabled === null) {
    return (
      <PagerScreen title="LIVE ACTIVITY">
        <PagerText>CHECKING...</PagerText>
      </PagerScreen>
    );
  }

  // Not enabled
  if (!isEnabled) {
    return (
      <PagerScreen title="LIVE ACTIVITY">
        <PagerText>LIVE ACTIVITIES</PagerText>
        <PagerText>ARE DISABLED</PagerText>
        <View style={styles.spacer} />
        <PagerText>ENABLE IN:</PagerText>
        <PagerText>SETTINGS {'>'} PAGER2077</PagerText>
        <PagerText>{'>'} LIVE ACTIVITIES</PagerText>
      </PagerScreen>
    );
  }

  return (
    <PagerScreen title="LIVE ACTIVITY">
      {/* Status */}
      <PagerText>
        STATUS: {activityState.toUpperCase()}
      </PagerText>
      
      {activityId && (
        <PagerText>
          ID: {activityId.substring(0, 8)}...
        </PagerText>
      )}
      
      <View style={styles.spacer} />
      
      {/* Menu options */}
      <PagerText selected={selectedIndex === 0}>
        {selectedIndex === 0 ? '>' : ' '} START DEMO
      </PagerText>
      <PagerText selected={selectedIndex === 1}>
        {selectedIndex === 1 ? '>' : ' '} UPDATE MSG
      </PagerText>
      <PagerText selected={selectedIndex === 2}>
        {selectedIndex === 2 ? '>' : ' '} END ACTIVITY
      </PagerText>
      <PagerText selected={selectedIndex === 3}>
        {selectedIndex === 3 ? '>' : ' '} END ALL
      </PagerText>
      
      {/* Error display */}
      {lastError && (
        <>
          <View style={styles.spacer} />
          <PagerText>ERR: {lastError}</PagerText>
        </>
      )}
      
      <View style={styles.spacer} />
      <PagerText>PRESS 5 TO SELECT</PagerText>
    </PagerScreen>
  );
});

// Export the action handler for use by parent
export const useLiveActivityDemo = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const handleNavigation = (direction: 'up' | 'down') => {
    if (direction === 'up') {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    } else {
      setSelectedIndex(prev => Math.min(3, prev + 1));
    }
  };
  
  return {
    selectedIndex,
    setSelectedIndex,
    handleNavigation,
  };
};

const styles = StyleSheet.create({
  spacer: {
    height: 8,
  },
});
