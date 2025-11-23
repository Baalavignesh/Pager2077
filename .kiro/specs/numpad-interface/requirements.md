# Requirements Document

## Introduction

Replace the circular control wheel interface in PagerBody with a classic phone numpad-style interface. The numpad will provide navigation controls using number keys (2/4/6/8), dedicated action buttons at the top, and maintain the retro pager aesthetic with a flat, minimalist black-and-white design.

## Glossary

- **NumPad Component**: The new custom-built numpad interface component that replaces ControlWheel
- **PagerBody**: The bottom half container component that houses the navigation interface
- **Navigation Keys**: Number keys 2, 4, 6, 8 used for directional navigation
- **Action Buttons**: Top row buttons for Select, Back, and future Record/Stop functionality
- **Center Button**: The middle button (5 position) used for Home/Menu navigation

## Requirements

### Requirement 1

**User Story:** As a user, I want to navigate the pager interface using a familiar phone numpad layout, so that I can intuitively control the device like a classic mobile phone.

#### Acceptance Criteria

1. WHEN THE NumPad Component renders, THE NumPad Component SHALL display a 4x3 grid of buttons with numbers 1-9, *, 0, and # in standard phone keypad layout
2. THE NumPad Component SHALL display letter labels beneath each number (abc, def, ghi, jkl, mno, pqrs, tuv, wxyz) matching standard phone keypad conventions
3. THE NumPad Component SHALL use flat, rounded rectangular buttons with white background and black text
4. THE NumPad Component SHALL maintain consistent spacing between all buttons in the grid
5. THE NumPad Component SHALL render within the existing PagerBody container, replacing the ControlWheel component

### Requirement 2

**User Story:** As a user, I want to use number keys for navigation, so that I can move through menus and lists efficiently.

#### Acceptance Criteria

1. WHEN the user presses button 2, THE NumPad Component SHALL trigger the onNavigateUp callback
2. WHEN the user presses button 8, THE NumPad Component SHALL trigger the onNavigateDown callback
3. WHEN the user presses button 4, THE NumPad Component SHALL trigger the onNavigateLeft callback
4. WHEN the user presses button 6, THE NumPad Component SHALL trigger the onNavigateRight callback
5. WHEN the user presses button 5, THE NumPad Component SHALL trigger the onMenu callback for Home/Menu navigation

### Requirement 3

**User Story:** As a user, I want dedicated action buttons at the top of the numpad, so that I can quickly select items or go back without using number keys.

#### Acceptance Criteria

1. THE NumPad Component SHALL display a top row with three buttons above the number grid
2. THE NumPad Component SHALL render the top-left button with a minus symbol (-) that triggers the onBack callback when pressed
3. THE NumPad Component SHALL render the top-center button with a rounded square symbol that triggers the onMenu callback when pressed
4. THE NumPad Component SHALL render the top-right button with a minus symbol (-) that triggers the onSelect callback when pressed
5. THE NumPad Component SHALL style top row buttons consistently with the number buttons (flat, white background, black symbols)

### Requirement 4

**User Story:** As a user, I want placeholder buttons for future recording functionality, so that the interface is prepared for voice recording features.

#### Acceptance Criteria

1. THE NumPad Component SHALL display two additional buttons in the second row between the top action buttons and number grid
2. THE NumPad Component SHALL render the left placeholder button with a curved line symbol (∩) for future Record functionality
3. THE NumPad Component SHALL render the right placeholder button with a minus symbol (-) for future Stop functionality
4. THE NumPad Component SHALL disable the placeholder buttons (no press interaction) until recording functionality is implemented
5. THE NumPad Component SHALL style placeholder buttons with reduced opacity to indicate disabled state

### Requirement 5

**User Story:** As a developer, I want the NumPad component to integrate seamlessly with existing navigation callbacks, so that all screens continue to function without modification.

#### Acceptance Criteria

1. THE NumPad Component SHALL accept onSelect, onBack, onNavigateUp, onNavigateDown, and onMenu callback props matching the ControlWheel interface
2. THE NumPad Component SHALL accept an additional onNavigateLeft callback prop for future horizontal navigation
3. THE NumPad Component SHALL accept an additional onNavigateRight callback prop for future horizontal navigation
4. WHEN PagerBody renders, THE PagerBody SHALL pass all navigation callbacks to NumPad Component
5. THE NumPad Component SHALL maintain the same TypeScript interface structure as ControlWheel for drop-in replacement

### Requirement 6

**User Story:** As a user, I want the numpad to have a clean, minimalist appearance, so that it matches the retro pager aesthetic without visual clutter.

#### Acceptance Criteria

1. THE NumPad Component SHALL use white (#FFFFFF) background color for all buttons
2. THE NumPad Component SHALL use black (#000000) text color for all numbers, letters, and symbols
3. THE NumPad Component SHALL apply subtle rounded corners (borderRadius: 8-12px) to all buttons
4. THE NumPad Component SHALL use subtle shadows or borders to create depth without heavy gradients
5. WHEN a button is pressed, THE NumPad Component SHALL provide visual feedback with opacity change or subtle scale animation

### Requirement 7

**User Story:** As a user, I want the numpad buttons to be appropriately sized for touch interaction, so that I can accurately press the intended button.

#### Acceptance Criteria

1. THE NumPad Component SHALL render each button with minimum dimensions of 44x44 pixels for accessibility
2. THE NumPad Component SHALL maintain consistent button sizes across all rows
3. THE NumPad Component SHALL scale the entire numpad proportionally to fit within the PagerBody container
4. THE NumPad Component SHALL maintain adequate spacing (8-12px) between buttons to prevent accidental presses
5. THE NumPad Component SHALL center the numpad grid within the available PagerBody space
