import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface Message {
  from: string;
  text: string;
  time: string;
}

interface MessagesScreenProps {
  messages: Message[];
  selectedIndex: number;
  displayNameMap?: Record<string, string>;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ 
  messages, 
  selectedIndex,
  displayNameMap = {}
}) => {
  return (
    <PagerScreen title="MESSAGES">
      {messages.length === 0 ? (
        <PagerText>NO MESSAGES</PagerText>
      ) : (
        messages.map((msg, index) => {
          const displayName = displayNameMap[msg.from] || msg.from;
          return (
            <PagerText key={index} selected={index === selectedIndex}>
              {index === selectedIndex ? '>' : ' '} {displayName}
            </PagerText>
          );
        })
      )}
    </PagerScreen>
  );
};
