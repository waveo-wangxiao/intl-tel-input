//* THIS FILE IS AUTO-GENERATED. DO NOT EDIT.
import intlTelInput from "./intlTelInputWithUtils";
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

  // Initialize Iti instance and get processed countries from it
  useEffect(() => {
    if (!itiInstanceRef.current) {
      itiInstanceRef.current = new Iti(initOptions);

      // Get processed countries from Iti instance
      const countries = itiInstanceRef.current.getCountries();
      setProcessedCountries(countries);

      // Get initial selected country from Iti instance
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
    }
  }, [initOptions, onChangeCountry]);

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

  // Handle phone number change
  const handlePhoneNumberChange = useCallback((text: string) => {
    setPhoneNumber(text);
    onChangeNumber(text);

    // Update Iti instance with current input value
    if (itiInstanceRef.current) {
      itiInstanceRef.current.setInputValue(text);

      const isValid = usePreciseValidation
        ? itiInstanceRef.current.isValidNumberPrecise()
        : itiInstanceRef.current.isValidNumber();
      const errorCode = itiInstanceRef.current.getValidationError();

      onChangeValidity(isValid ?? false);
      onChangeErrorCode(isValid ? null : errorCode);
    } else {
      // Fallback to basic validation
      const isValid = text.length > 0;
      onChangeValidity(isValid);
      onChangeErrorCode(isValid ? null : 0);
    }
  }, [onChangeNumber, onChangeValidity, onChangeErrorCode, usePreciseValidation]);

  // Handle country selection
  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setIsDropdownVisible(false);
    setSearchQuery("");
    onChangeCountry(country.iso2);

    // Update Iti instance with new country
    if (itiInstanceRef.current) {
      itiInstanceRef.current.setCountry(country.iso2);
    }
  }, [onChangeCountry]);

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
      setPhoneNumber(number);
      onChangeNumber(number);
      // Update Iti instance with new number
      if (itiInstanceRef.current) {
        itiInstanceRef.current.setInputValue(number);
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
  }), [selectedCountry, phoneNumber, processedCountries, onChangeCountry, onChangeNumber]);

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
