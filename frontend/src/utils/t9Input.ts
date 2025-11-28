/**
 * T9 Text Input System - Multi-tap text entry like old phones
 */
import { T9KeyMap } from '../types';

export const T9_MAP: T9KeyMap = {
  '0': [' ', '0'],
  '1': ['1'],
  '2': ['a', 'b', 'c', '2'],
  '3': ['d', 'e', 'f', '3'],
  '4': ['g', 'h', 'i', '4'],
  '5': ['j', 'k', 'l', '5'],
  '6': ['m', 'n', 'o', '6'],
  '7': ['p', 'q', 'r', 's', '7'],
  '8': ['t', 'u', 'v', '8'],
  '9': ['w', 'x', 'y', 'z', '9'],
};

export const T9_TIMEOUT_MS = 1000; // 1 second between key presses

/**
 * T9 Input Handler - Manages multi-tap text entry state
 */
export class T9InputHandler {
  private input: string = '';
  private currentKey: string | null = null;
  private keyPressCount: number = 0;
  private lastKeyPressTime: number = 0;
  private timeoutId: NodeJS.Timeout | null = null;

  /**
   * Handle a number key press (0-9)
   * Returns the updated input string
   */
  handleKeyPress(key: string): string {
    const now = Date.now();
    
    // Clear timeout if exists
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    // Check if same key pressed within timeout
    if (key === this.currentKey && (now - this.lastKeyPressTime) < T9_TIMEOUT_MS) {
      // Cycle to next character
      this.keyPressCount++;
      const chars = T9_MAP[key];
      const charIndex = this.keyPressCount % chars.length;
      
      // Replace last character with new one
      this.input = this.input.slice(0, -1) + chars[charIndex];
    } else {
      // New key or timeout expired - add first character
      this.currentKey = key;
      this.keyPressCount = 0;
      const chars = T9_MAP[key];
      this.input += chars[0];
    }
    
    this.lastKeyPressTime = now;
    
    // Set timeout to finalize character
    this.timeoutId = setTimeout(() => {
      this.currentKey = null;
      this.keyPressCount = 0;
    }, T9_TIMEOUT_MS);
    
    return this.input;
  }

  /**
   * Handle backspace (hash key)
   * Returns the updated input string
   */
  handleBackspace(): string {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.input = this.input.slice(0, -1);
    this.currentKey = null;
    this.keyPressCount = 0;
    
    return this.input;
  }

  /**
   * Get the current input string
   */
  getInput(): string {
    return this.input;
  }

  /**
   * Set the input string (for pre-filling)
   */
  setInput(value: string): void {
    this.input = value;
    this.currentKey = null;
    this.keyPressCount = 0;
  }

  /**
   * Clear all input and state
   */
  clear(): void {
    this.input = '';
    this.currentKey = null;
    this.keyPressCount = 0;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  /**
   * Cleanup timeouts (call when component unmounts)
   */
  cleanup(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
