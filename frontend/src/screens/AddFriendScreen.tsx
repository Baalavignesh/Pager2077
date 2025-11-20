import React from 'react';
import { PagerScreen, PagerText } from '../components/PagerScreen';

interface AddFriendScreenProps {
  hexCode: string;
  selectedDigit: number;
  selectedOption: number;
  methodIndex: number;
  pasteError: boolean;
}

export const AddFriendScreen: React.FC<AddFriendScreenProps> = ({ 
  hexCode, 
  selectedDigit,
  selectedOption,
  methodIndex,
  pasteError
}) => {
  return (
    <PagerScreen title="ADD FRIEND">
      {selectedOption === -1 ? (
        <>
          <PagerText>SELECT INPUT METHOD:</PagerText>
          <PagerText> </PagerText>
          <PagerText selected={methodIndex === 0}>
            {methodIndex === 0 ? '>' : ' '} PASTE FROM CLIPBOARD
          </PagerText>
          <PagerText selected={methodIndex === 1}>
            {methodIndex === 1 ? '>' : ' '} MANUAL ENTRY
          </PagerText>
          <PagerText> </PagerText>
          {pasteError && (
            <>
              <PagerText>ERROR: INVALID HEX</PagerText>
              <PagerText>TRY AGAIN</PagerText>
              <PagerText> </PagerText>
            </>
          )}
          <PagerText>▲/▼ SELECT METHOD</PagerText>
          <PagerText>SELECT: CHOOSE</PagerText>
          <PagerText>MENU: CANCEL</PagerText>
        </>
      ) : (
        <>
          <PagerText>ENTER HEX CODE:</PagerText>
          <PagerText> </PagerText>
          
          {/* Hex code display with cursor */}
          <PagerText style={{ textAlign: 'center' }}>
            {hexCode.split('').map((char, index) => {
              if (index === selectedDigit) {
                return `[${char}]`;
              }
              return char;
            }).join('')}
          </PagerText>

          <PagerText> </PagerText>
          <PagerText>▲/▼ CHANGE DIGIT</PagerText>
          <PagerText>SELECT: NEXT/SEND</PagerText>
          <PagerText>BACK: PREVIOUS</PagerText>
          <PagerText>MENU: CANCEL</PagerText>
        </>
      )}
    </PagerScreen>
  );
};
