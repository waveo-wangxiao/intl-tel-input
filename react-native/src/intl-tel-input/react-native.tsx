import intlTelInput from "../intl-tel-input";
//* Keep the TS imports separate, as the above line gets substituted in the reactNativeWithUtils build process.
import { Iti, SomeOptions, Country } from "../intl-tel-input";
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import {
  View,
  TextInput,
  Modal,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  TextInputProps
} from "react-native";

// make this available as a named export, so react-native users can access globals like intlTelInput.utils
export { intlTelInput };

// Convert ISO2 country code to flag emoji
const getCountryFlag = (iso2: string): string => {
  if (!iso2 || iso2.length !== 2) return "🏳️";

  // Convert ISO2 to flag emoji using Unicode regional indicator symbols
  const codePoints = iso2.toUpperCase().split('').map(char =>
    0x1F1E6 + char.charCodeAt(0) - 'A'.charCodeAt(0)
  );
  return String.fromCodePoint(...codePoints);
};

type ItiProps = {
  initialValue?: string;
  onChangeNumber?: (number: string) => void;
  onChangeCountry?: (country: string) => void;
  onChangeValidity?: (valid: boolean) => void;
  onChangeErrorCode?: (errorCode: number | null) => void;
  usePreciseValidation?: boolean;
  initOptions?: SomeOptions;
  inputProps?: TextInputProps;
  disabled?: boolean;
  style?: object;
  dropdownStyle?: object;
  flagStyle?: object;
  textStyle?: object;
};

export interface IntlTelInputRef {
  getNumber: () => string;
  getSelectedCountryData: () => any; // Can be Country or SelectedCountryData
  setCountry: (iso2: string) => void;
  setNumber: (number: string) => void;
  isValidNumber: () => boolean;
  isValidNumberPrecise?: () => boolean;
  getValidationError: () => number | null;
  getExtension: () => string;
  getNumberType: () => number;
  setPlaceholderNumberType: (type: string) => void;
  getInstance: () => Iti | null; // For compatibility with React implementation
  destroy: () => void; // Cleanup method
}

const IntlTelInput = forwardRef<IntlTelInputRef, ItiProps>(({
  initialValue = "",
  onChangeNumber = () => {},
  onChangeCountry = () => {},
  onChangeValidity = () => {},
  onChangeErrorCode = () => {},
  usePreciseValidation = false,
  initOptions = {},
  inputProps = {},
  disabled = false,
  style,
  dropdownStyle,
  flagStyle,
  textStyle,
}, ref) => {
  const [phoneNumber, setPhoneNumber] = useState(initialValue);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholder, setPlaceholder] = useState("");

  const textInputRef = useRef<TextInput>(null);
  const itiInstanceRef = useRef<Iti | null>(null);
  const [processedCountries, setProcessedCountries] = useState<Country[]>([]);

  // Get search placeholder from i18n options
  const getSearchPlaceholder = useCallback(() => {
    if (itiInstanceRef.current) {
      const options = itiInstanceRef.current.getOptions();
      return options.i18n?.searchPlaceholder || "Search countries...";
    }
    return "Search countries...";
  }, []);

  // Update placeholder when country changes
  const updatePlaceholder = useCallback(() => {
    if (itiInstanceRef.current) {
      // Set whether there was an initial placeholder (for polite mode)
      const hasInitialPlaceholder = Boolean(inputProps?.placeholder);
      itiInstanceRef.current.setHadInitialPlaceholder(hasInitialPlaceholder);

      // Get the placeholder using the same logic as the main implementation
      const placeholderText = itiInstanceRef.current.getPlaceholder();
      setPlaceholder(placeholderText || inputProps?.placeholder || "Phone number");
    } else {
      setPlaceholder(inputProps?.placeholder || "Phone number");
    }
  }, [inputProps?.placeholder]);

  // Update function similar to React implementation
  const update = useCallback((): void => {
    if (itiInstanceRef.current) {
      const num = itiInstanceRef.current.getNumber() || "";
      const countryIso = itiInstanceRef.current.getSelectedCountryData().iso2 || "";

      // Update phone number state
      setPhoneNumber(num);
      onChangeNumber(num);
      onChangeCountry(countryIso);

      // Update selected country state
      if (countryIso) {
        const country = processedCountries.find(c => c.iso2 === countryIso);
        if (country) {
          setSelectedCountry(country);
        }
      }

      // Validate the number
      const isValid = usePreciseValidation
        ? itiInstanceRef.current.isValidNumberPrecise()
        : itiInstanceRef.current.isValidNumber();

      if (isValid) {
        onChangeValidity(true);
        onChangeErrorCode(null);
      } else {
        const errorCode = itiInstanceRef.current.getValidationError();
        onChangeValidity(false);
        onChangeErrorCode(errorCode);
      }
    }
  }, [onChangeCountry, onChangeErrorCode, onChangeNumber, onChangeValidity, usePreciseValidation, processedCountries]);

  // Initialize Iti instance and get processed countries from it
  useEffect(() => {
    if (!itiInstanceRef.current) {
      itiInstanceRef.current = new Iti(initOptions);

      // Get processed countries from Iti instance
      const countries = itiInstanceRef.current.getCountries();
      setProcessedCountries(countries);

      // If there's an initial value, try to detect country from it
      if (initialValue) {
        itiInstanceRef.current.setInputValue(initialValue);
        itiInstanceRef.current.updateCountryFromNumber(initialValue);

        // Apply format-as-you-type to initial value if enabled
        let formattedValue = initialValue;
        if (initOptions.formatAsYouType !== false) {
          formattedValue = itiInstanceRef.current.formatNumberAsYouType();
        }
        setPhoneNumber(formattedValue);
      }

      // Get selected country from Iti instance (after potential country detection)
      const selectedCountryData = itiInstanceRef.current.getSelectedCountryData();
      if (selectedCountryData.iso2) {
        const country = countries.find(c => c.iso2 === selectedCountryData.iso2);
        if (country) {
          setSelectedCountry(country);
          onChangeCountry(country.iso2);
        }
      } else {
        // If no initial country is set, use the first country from the processed list
        const firstCountry = countries[0];
        if (firstCountry) {
          setSelectedCountry(firstCountry);
          onChangeCountry(firstCountry.iso2);
          itiInstanceRef.current.setCountry(firstCountry.iso2);
        }
      }

      // When plugin initialization has finished (e.g. loaded utils script), update all the state values
      itiInstanceRef.current.promise.then(update).catch(() => {
        // Handle initialization errors gracefully
      });
    }
  }, [initOptions, onChangeCountry, initialValue, update]);

  // Update placeholder when selected country changes
  useEffect(() => {
    updatePlaceholder();
  }, [selectedCountry, updatePlaceholder]);

  // Update placeholder when utils are loaded
  useEffect(() => {
    if (itiInstanceRef.current) {
      itiInstanceRef.current.promise.then(() => {
        updatePlaceholder();
      }).catch(() => {
        // Utils failed to load, keep current placeholder
      });
    }
  }, [updatePlaceholder]);

  // Handle disabled state changes (like React implementation)
  useEffect(() => {
    // React Native doesn't have a setDisabled method on Iti, but we handle it in the UI
    // This effect is here for consistency with React implementation patterns
  }, [disabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (itiInstanceRef.current) {
        itiInstanceRef.current.destroy();
        itiInstanceRef.current = null;
      }
    };
  }, []);

  // Filter countries for search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCountries(processedCountries);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = processedCountries.filter(country =>
        country.name.toLowerCase().includes(query) ||
        country.iso2.toLowerCase().includes(query) ||
        country.dialCode.includes(query)
      );
      setFilteredCountries(filtered);
    }
  }, [searchQuery, processedCountries]);

  // Handle phone number change with format-as-you-type
  const handlePhoneNumberChange = useCallback((text: string) => {
    if (itiInstanceRef.current) {
      // Update Iti instance with current input value
      itiInstanceRef.current.setInputValue(text);

      // Check if country should be updated from the number
      const countryChanged = itiInstanceRef.current.updateCountryFromNumber(text);

      // Apply format-as-you-type if enabled
      let formattedText = text;
      if (initOptions.formatAsYouType !== false) {
        formattedText = itiInstanceRef.current.formatNumberAsYouType();
      }

      // Update the phone number state
      setPhoneNumber(formattedText);

      // If country changed, trigger full update (like React implementation)
      if (countryChanged) {
        update();
      } else {
        // Just update number and validation
        onChangeNumber(formattedText);

        const isValid = usePreciseValidation
          ? itiInstanceRef.current.isValidNumberPrecise()
          : itiInstanceRef.current.isValidNumber();
        const errorCode = itiInstanceRef.current.getValidationError();

        onChangeValidity(isValid ?? false);
        onChangeErrorCode(isValid ? null : errorCode);
      }
    } else {
      // Fallback when no Iti instance
      setPhoneNumber(text);
      onChangeNumber(text);
      const isValid = text.length > 0;
      onChangeValidity(isValid);
      onChangeErrorCode(isValid ? null : 0);
    }
  }, [onChangeNumber, onChangeValidity, onChangeErrorCode, usePreciseValidation, initOptions.formatAsYouType, update]);

  // Handle country selection
  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setIsDropdownVisible(false);
    setSearchQuery("");

    // Update Iti instance with new country
    if (itiInstanceRef.current) {
      itiInstanceRef.current.setCountry(country.iso2);
      // Trigger update to sync all state (similar to React implementation)
      update();
    } else {
      // Fallback
      onChangeCountry(country.iso2);
    }
  }, [onChangeCountry, update]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    getNumber: () => {
      if (itiInstanceRef.current) {
        return itiInstanceRef.current.getNumber();
      }
      // Fallback
      if (selectedCountry && phoneNumber) {
        return `+${selectedCountry.dialCode}${phoneNumber}`;
      }
      return phoneNumber;
    },
    getSelectedCountryData: () => {
      if (itiInstanceRef.current) {
        return itiInstanceRef.current.getSelectedCountryData();
      }
      return selectedCountry;
    },
    setCountry: (iso2: string) => {
      const country = processedCountries.find(c => c.iso2 === iso2.toLowerCase());
      if (country) {
        setSelectedCountry(country);
        onChangeCountry(country.iso2);
        if (itiInstanceRef.current) {
          itiInstanceRef.current.setCountry(iso2);
        }
      }
    },
    setNumber: (number: string) => {
      if (itiInstanceRef.current) {
        // Use the proper setNumber method which handles country detection
        itiInstanceRef.current.setNumber(number);

        // Trigger full update to sync all state (like React implementation)
        update();
      } else {
        // Fallback
        setPhoneNumber(number);
        onChangeNumber(number);
      }
    },
    isValidNumber: () => {
      if (itiInstanceRef.current) {
        return itiInstanceRef.current.isValidNumber() ?? false;
      }
      // Fallback validation
      return phoneNumber.length > 0;
    },
    isValidNumberPrecise: () => {
      if (itiInstanceRef.current) {
        return itiInstanceRef.current.isValidNumberPrecise() ?? false;
      }
      // Fallback validation
      return phoneNumber.length > 0;
    },
    getValidationError: () => {
      if (itiInstanceRef.current) {
        return itiInstanceRef.current.getValidationError();
      }
      // Fallback error codes
      return phoneNumber.length > 0 ? null : 0;
    },
    getExtension: () => {
      if (itiInstanceRef.current) {
        return itiInstanceRef.current.getExtension();
      }
      return "";
    },
    getNumberType: () => {
      if (itiInstanceRef.current) {
        return itiInstanceRef.current.getNumberType();
      }
      return -99;
    },
    setPlaceholderNumberType: (type: string) => {
      if (itiInstanceRef.current) {
        itiInstanceRef.current.setPlaceholderNumberType(type as any);
        updatePlaceholder();
      }
    },
    getInstance: () => {
      return itiInstanceRef.current;
    },
    destroy: () => {
      if (itiInstanceRef.current) {
        itiInstanceRef.current.destroy();
        itiInstanceRef.current = null;
      }
    },
  }), [selectedCountry, phoneNumber, processedCountries, onChangeCountry, onChangeNumber, updatePlaceholder, update]);

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[styles.countryItem, dropdownStyle]}
      onPress={() => handleCountrySelect(item)}
    >
      {(initOptions.showFlags !== false) && (
        <Text style={[styles.flag, flagStyle]}>
          {getCountryFlag(item.iso2)}
        </Text>
      )}
      <Text style={[styles.countryName, textStyle]}>{item.name}</Text>
      <Text style={[styles.dialCode, textStyle]}>+{item.dialCode}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        {(initOptions.allowDropdown !== false) && (
          <TouchableOpacity
            style={styles.countrySelector}
            onPress={() => setIsDropdownVisible(true)}
            disabled={disabled}
          >
            {(initOptions.showFlags !== false) && selectedCountry && (
              <Text style={[styles.selectedFlag, flagStyle]}>
                {getCountryFlag(selectedCountry.iso2)}
              </Text>
            )}
            {initOptions.separateDialCode && selectedCountry && (
              <Text style={[styles.selectedDialCode, textStyle]}>
                +{selectedCountry.dialCode}
              </Text>
            )}
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        )}

        <TextInput
          ref={textInputRef}
          style={[styles.textInput, textStyle]}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          placeholder={placeholder || "Phone number"}
          keyboardType="phone-pad"
          editable={!disabled}
          {...inputProps}
        />
      </View>

      <Modal
        visible={isDropdownVisible}
        animationType="slide"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsDropdownVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {(initOptions.countrySearch !== false) && (
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={getSearchPlaceholder()}
              autoFocus
            />
          )}

          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item: Country) => item.iso2}
            style={styles.countryList}
          />
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  selectedFlag: {
    fontSize: 20,
    marginRight: 4,
  },
  selectedDialCode: {
    marginRight: 4,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchInput: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    fontSize: 16,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  flag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
  },
  dialCode: {
    fontSize: 16,
    color: '#666',
  },
});

export default IntlTelInput;
