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
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ messages, selectedIndex }) => {
  return (
    <PagerScreen title="MESSAGES">
      {messages.length === 0 ? (
        <PagerText>NO MESSAGES</PagerText>
      ) : (
        messages.map((msg, index) => (
          <PagerText key={index} selected={index === selectedIndex}>
            {index === selectedIndex ? '>' : ' '} {msg.from}
          </PagerText>
        ))
      )}
    </PagerScreen>
  );
};
