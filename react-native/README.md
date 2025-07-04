# International Telephone Input for React Native

A React Native component for entering and validating international telephone numbers. Built on top of the popular [intl-tel-input](https://github.com/jackocnr/intl-tel-input) library.

## Features

- 🌍 **244 countries** supported
- 📱 **Mobile-optimized** interface with native components
- 🎨 **Customizable styling** for all components
- 🔍 **Country search** functionality
- 🏳️ **Flag emojis** for country representation
- ✅ **Phone number validation** (with optional utils)
- 📞 **Format as you type** (with utils)
- 🎯 **TypeScript** support
- 🔧 **Highly configurable** options

## Implementation Plan

### 1. Initial Setup (File Structure)
- Create `react-native` directory
- Set up basic configuration files:
  - `tsconfig.json`
  - `build.js`
  - `package.json` entries

### 2. Core Implementation
- Create React Native specific core implementation:
  - `react-native/src/intl-tel-input/core.ts` - Core functionality adapted for React Native
  - Reuse/alias shared files like `data.ts` and `i18n` directory

### 3. Component Implementation
- Create React Native components:
  - `react-native/src/intl-tel-input/react-native.tsx` (main component)
  - `react-native/src/intl-tel-input/reactNativeWithUtils.tsx` (with utils version)

### 4. Feature Implementation
Ensure both components support these core features:

**Data & Configuration**
- Country list initialization and management
- Sorting and filtering countries
- Configuration options (initialCountry, allowDropdown, etc.)

**UI Components**
- Phone input field (TextInput)
- Country selection dropdown (Modal)
- Flag display
- RTL layout support

**Functionality**
- Number formatting as user types
- Placeholder management with example numbers
- Basic validation (standard version)
- Enhanced validation (utils version)
- Country selection and updates

**Methods**
- getNumber, getSelectedCountryData
- setCountry, setNumber
- isValidNumber, getValidationError

**Events/Callbacks**
- onChangeNumber, onChangeCountry
- onChangeValidity, onChangeErrorCode

### 5. Platform-Specific Adaptations
- Replace DOM manipulation with React Native components
- Use React Native's StyleSheet instead of CSS
- Replace browser detection with Platform module
- Adapt event handling for touch interfaces
- Use Modal for dropdown instead of absolute positioning

### 6. Build Configuration
- Update build scripts to include React Native components
- Configure proper exports in package.json

### 7. Documentation
- Complete README.md for React Native component
- Add usage examples and API documentation

### 8. Testing
- Create demo app to test functionality
- Test on both iOS and Android

## Installation

```bash
npm install intl-tel-input
```

**Note:** This package has an optional peer dependency on `react-native >= 0.60.0`. Make sure you have React Native installed in your project.

## Basic Usage

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import IntlTelInput from 'intl-tel-input/react-native';

const MyComponent = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [isValid, setIsValid] = useState(false);

  return (
    <View>
      <IntlTelInput
        onChangeNumber={setPhoneNumber}
        onChangeCountry={setCountry}
        onChangeValidity={setIsValid}
        initOptions={{
          initialCountry: "us",
        }}
      />
    </View>
  );
};
```

## With Utils (Enhanced Validation & Formatting)

For enhanced phone number validation and formatting, use the utils version:

```tsx
import IntlTelInput from 'intl-tel-input/reactNativeWithUtils';

const MyComponent = () => {
  return (
    <IntlTelInput
      onChangeNumber={(number) => console.log('Full number:', number)}
      onChangeCountry={(country) => console.log('Country:', country)}
      onChangeValidity={(valid) => console.log('Is valid:', valid)}
      usePreciseValidation={true}
      initOptions={{
        initialCountry: "us",
        formatAsYouType: true,
      }}
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialValue` | `string` | `""` | Initial phone number value |
| `onChangeNumber` | `(number: string) => void` | `() => {}` | Called when the phone number changes |
| `onChangeCountry` | `(country: string) => void` | `() => {}` | Called when the selected country changes |
| `onChangeValidity` | `(valid: boolean) => void` | `() => {}` | Called when validation status changes |
| `onChangeErrorCode` | `(errorCode: number \| null) => void` | `() => {}` | Called when validation error code changes |
| `usePreciseValidation` | `boolean` | `false` | Use precise validation (requires utils) |
| `initOptions` | `object` | `{}` | Configuration options (see below) |
| `inputProps` | `TextInputProps` | `{}` | Props passed to the TextInput component |
| `disabled` | `boolean` | `undefined` | Whether the input is disabled |
| `style` | `object` | `undefined` | Style for the container |
| `dropdownStyle` | `object` | `undefined` | Style for dropdown items |
| `flagStyle` | `object` | `undefined` | Style for flag emojis |
| `textStyle` | `object` | `undefined` | Style for text elements |

## Init Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `initialCountry` | `string` | `"us"` | Initial country selection |
| `preferredCountries` | `string[]` | `[]` | Countries to show at the top |
| `excludeCountries` | `string[]` | `[]` | Countries to exclude |
| `onlyCountries` | `string[]` | `[]` | Only show these countries |
| `separateDialCode` | `boolean` | `false` | Show dial code separately |
| `nationalMode` | `boolean` | `true` | Format in national mode |
| `autoPlaceholder` | `string` | `"polite"` | Placeholder behavior |
| `formatAsYouType` | `boolean` | `true` | Format number as user types |
| `allowDropdown` | `boolean` | `true` | Allow country dropdown |
| `countrySearch` | `boolean` | `true` | Enable country search |
| `showFlags` | `boolean` | `true` | Show country flag emojis |

## Ref Methods

Access component methods using a ref:

```tsx
import React, { useRef } from 'react';
import IntlTelInput, { IntlTelInputRef } from 'intl-tel-input/react-native';

const MyComponent = () => {
  const phoneInputRef = useRef<IntlTelInputRef>(null);

  const handleSubmit = () => {
    const phoneNumber = phoneInputRef.current?.getNumber();
    const isValid = phoneInputRef.current?.isValidNumber();
    const selectedCountry = phoneInputRef.current?.getSelectedCountryData();
    
    console.log('Phone:', phoneNumber);
    console.log('Valid:', isValid);
    console.log('Country:', selectedCountry);
  };

  return (
    <IntlTelInput
      ref={phoneInputRef}
      initOptions={{ initialCountry: "us" }}
    />
  );
};
```

### Available Methods

- `getNumber()`: Get the full international number
- `getSelectedCountryData()`: Get the selected country object
- `setCountry(iso2)`: Set the selected country
- `setNumber(number)`: Set the phone number
- `isValidNumber()`: Check if number is valid
- `isValidNumberPrecise()`: Precise validation (utils only)
- `getValidationError()`: Get validation error code

## Styling

Customize the appearance with style props:

```tsx
<IntlTelInput
  style={{
    marginVertical: 10,
  }}
  textStyle={{
    fontSize: 16,
    color: '#333',
  }}
  flagStyle={{
    fontSize: 24,
  }}
  dropdownStyle={{
    backgroundColor: '#f8f8f8',
  }}
/>
```

## Platform Considerations

### iOS
- Uses native Modal component for country selection
- Flag emojis render natively
- Keyboard type automatically set to `phone-pad`

### Android
- Modal behavior may vary based on Android version
- Flag emoji support depends on device/OS version
- Consider testing on various devices

## Error Codes

When validation fails, you'll receive error codes:

- `0`: Invalid number
- `1`: Invalid country code  
- `2`: Too short
- `3`: Too long
- `4`: Invalid number

## TypeScript

Full TypeScript support is included:

```tsx
import IntlTelInput, { IntlTelInputRef } from 'intl-tel-input/react-native';
import { Country } from 'intl-tel-input/data';
```

## Differences from Web Version

- Uses React Native components (`TextInput`, `Modal`, `TouchableOpacity`)
- Flag display uses emoji instead of CSS sprites
- No DOM manipulation - pure React Native implementation
- Mobile-optimized UI patterns
- Platform-specific behaviors handled automatically

## Contributing

Issues and pull requests are welcome! Please check the main [intl-tel-input repository](https://github.com/jackocnr/intl-tel-input) for contribution guidelines.

## License

MIT
