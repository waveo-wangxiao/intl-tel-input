# Core intl-tel-input.ts Analysis

## Overview
This document provides a comprehensive analysis of the core `src/js/intl-tel-input.ts` file, identifying all features, functions, and capabilities that need to be considered for React Native implementation.

## Core Architecture

The main plugin is implemented as the `Iti` class with the following key components:

```typescript
export class Iti {
  // Core properties
  id: number;
  promise: Promise<[unknown, unknown]>;
  private telInput: HTMLInputElement;
  private options: AllOptions;
  private selectedCountryData: SelectedCountryData;
  private countries: Country[];
  // ... 25+ additional private properties
}
```

## 1. Configuration Options (AllOptions Interface)

### Core Display Options
- `allowDropdown: boolean` - Enable/disable country dropdown
- `showFlags: boolean` - Show/hide country flags
- `separateDialCode: boolean` - Display dial code separately from input
- `containerClass: string` - Custom CSS class for container
- `fixDropdownWidth: boolean` - Fix dropdown width to input width

### Formatting & Validation
- `formatAsYouType: boolean` - Real-time number formatting
- `formatOnDisplay: boolean` - Format on initialization/setNumber
- `nationalMode: boolean` - National vs international formatting
- `strictMode: boolean` - Restrict input to valid characters only
- `autoPlaceholder: string` - Auto-generate placeholder numbers ("polite", "aggressive", "off")
- `customPlaceholder: function` - Custom placeholder function
- `placeholderNumberType: NumberType` - Type of number for placeholder (MOBILE, FIXED_LINE, etc.)
- `validationNumberTypes: NumberType[]` - Number types for validation

### Country Selection
- `initialCountry: string` - Default country selection (ISO2 code or "auto")
- `onlyCountries: string[]` - Restrict to specific countries
- `excludeCountries: string[]` - Exclude specific countries
- `countryOrder: string[]` - Custom country ordering
- `geoIpLookup: function` - Auto-detect country via IP lookup

### UI/UX Features
- `countrySearch: boolean` - Search functionality in dropdown
- `useFullscreenPopup: boolean` - Mobile-friendly fullscreen dropdown
- `dropdownContainer: HTMLElement` - Custom dropdown container
- `i18n: I18n` - Internationalization strings

### Advanced Features
- `hiddenInput: function` - Generate hidden form inputs
- `loadUtils: UtilsLoader` - Utils script loader function

## 2. Public Methods (API)

### Core Number Operations
- `getNumber(format?: number): string` - Get formatted number
- `setNumber(number: string): void` - Set input value and update country
- `getExtension(): string` - Extract extension from number
- `getNumberType(): number` - Get number type (mobile/landline/etc.)

### Validation
- `isValidNumber(): boolean | null` - Basic validation
- `isValidNumberPrecise(): boolean | null` - Precise validation
- `getValidationError(): number` - Get specific validation error code

### Country Management
- `getSelectedCountryData(): SelectedCountryData` - Get current country data
- `setCountry(iso2: string): void` - Set selected country
- `setPlaceholderNumberType(type: NumberType): void` - Update placeholder type

### Instance Management
- `destroy(): void` - Clean up instance and remove listeners
- `setDisabled(disabled: boolean): void` - Enable/disable input
- `handleAutoCountry(): void` - Handle geo IP lookup result
- `handleUtils(): void` - Handle utils script loading

## 3. Core Features & Functionality

### A. Country Data Processing
- Processes 240+ countries with dial codes, area codes, priorities
- Handles country filtering (onlyCountries/excludeCountries)
- Supports custom country ordering
- Manages dial code to ISO2 mapping with area code support
- Translates country names based on i18n options

### B. Input Formatting & Validation
- Real-time format-as-you-type with cursor position management
- Strict mode character validation
- National vs international number formatting
- Extension handling (e.g., "ext. 1234")
- Alpha character validation for extensions
- Maximum length enforcement based on country

### C. Dropdown Interface
- Country list with flags, names, and dial codes
- Search functionality with string normalization
- Keyboard navigation (arrow keys, enter, escape)
- Hidden search when countrySearch disabled
- Accessibility support (ARIA attributes)
- Mouse/touch interaction handling

### D. Mobile & Responsive
- Fullscreen popup for mobile devices
- Android-specific input handling
- RTL (right-to-left) language support
- Touch-friendly interactions
- Responsive dropdown positioning

### E. Advanced Input Handling
- Automatic country detection from number
- Dial code extraction and replacement
- Cursor position preservation during formatting
- Cut/paste event handling
- Form integration with hidden inputs
- Plus key handling for separate dial code mode

## 4. DOM-Specific Features (React Native Exclusions)

These features rely heavily on DOM and would need React Native alternatives:

### DOM Manipulation
- `createEl()` - DOM element creation
- Country dropdown rendering with HTML structure
- Flag display via CSS classes
- Input padding adjustment
- Dropdown positioning and styling

### Browser APIs
- `document.createElement()`
- `getBoundingClientRect()`
- Event listeners (click, keydown, scroll, input)
- Form integration and submission handling
- Window/document references
- CSS class manipulation

### CSS Dependencies
- Flag sprites and CSS classes (iti__flag, iti__[country-code])
- Dropdown styling and positioning
- Container layout management
- Responsive design classes

## 5. Utils Integration

The library integrates with libphonenumber-js utils for:

### Formatting
- `formatNumber(number, iso2, format)` - Format to specific format
- `formatNumberAsYouType(number, iso2)` - Real-time formatting
- `getCoreNumber(number, iso2)` - Extract core digits

### Validation
- `isValidNumber(number, iso2, numberTypes)` - Validate number
- `isPossibleNumber(number, iso2, numberTypes)` - Check if possible
- `getValidationError(number, iso2)` - Get specific error

### Information
- `getExampleNumber(iso2, nationalMode, numberType)` - Get example number
- `getExtension(number, iso2)` - Extract extension
- `getNumberType(number, iso2)` - Determine number type

## 6. Event System

### Custom Events
- `countrychange` - Fired when country selection changes
- `open:countrydropdown` - Fired when dropdown opens
- Input events with custom detail properties

### Internal Event Handling
- Input/keydown event processing with format-as-you-type
- Dropdown interaction events (click, mouseover, keyboard)
- Form submission handling for hidden inputs
- Window scroll/resize events for dropdown positioning

## 7. Internationalization

### Features
- Country name translations via i18n object
- UI text localization (search placeholder, accessibility text)
- Accessibility text for screen readers
- Support for multiple languages and RTL

### Default Strings
- Search placeholder
- Country list aria label
- Selected country aria label
- Search results announcements

## 8. React Native Implementation Considerations

### What Can Be Reused
- All country data processing logic
- Number formatting and validation logic
- Utils integration
- Core business logic and algorithms
- Public API methods (with adaptations)

### What Needs React Native Alternatives
- **UI Components**: Replace DOM dropdown with React Native picker/modal
- **Input Handling**: Adapt to TextInput component
- **Styling**: Replace CSS with React Native styles
- **Event System**: Use React Native event handling
- **Positioning**: Use React Native layout instead of DOM positioning

### Architecture Recommendations
1. **Core Logic Separation**: Extract DOM-independent logic into shared modules
2. **Platform-Specific UI**: Implement React Native-specific components
3. **API Compatibility**: Maintain same public method signatures
4. **Utils Integration**: Preserve libphonenumber-js integration
5. **Feature Parity**: Implement all core features with platform-appropriate UX

## 9. Key Implementation Challenges

### High Priority
- Country selection UI (dropdown alternative)
- Format-as-you-type with cursor management
- Flag display system
- Search functionality

### Medium Priority
- Accessibility support
- RTL language support
- Mobile-optimized interactions
- Form integration

### Low Priority
- Advanced positioning options
- Custom container support
- Complex event delegation

---

This analysis serves as the foundation for implementing React Native support while maintaining feature parity and API compatibility with the existing React and Vue implementations.
