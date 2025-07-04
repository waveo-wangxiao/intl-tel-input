import React, { useEffect, forwardRef, useImperativeHandle, useCallback, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  Platform,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { Country } from "./data";

// Import the core library data and utilities
import allCountries from "./data";

// make this available as a named export, so react-native users can access globals
export { allCountries };

type ItiProps = {
  initialValue?: string;
  onChangeNumber?: (number: string) => void;
  onChangeCountry?: (country: string) => void;
  onChangeValidity?: (valid: boolean) => void;
  onChangeErrorCode?: (errorCode: number | null) => void;
  usePreciseValidation?: boolean;
  initOptions?: {
    initialCountry?: string;
    preferredCountries?: string[];
    excludeCountries?: string[];
    onlyCountries?: string[];
    separateDialCode?: boolean;
    nationalMode?: boolean;
    autoPlaceholder?: string;
    placeholderNumberType?: string;
    formatAsYouType?: boolean;
    formatOnDisplay?: boolean;
    allowDropdown?: boolean;
    countrySearch?: boolean;
    hiddenInput?: string;
    localizedCountries?: object;
    showFlags?: boolean;
    i18n?: object;
  };
  inputProps?: TextInputProps;
  disabled?: boolean | undefined;
  style?: object;
  dropdownStyle?: object;
  flagStyle?: object;
  textStyle?: object;
};

export type IntlTelInputRef = {
  getNumber: () => string;
  getSelectedCountryData: () => Country | null;
  setCountry: (iso2: string) => void;
  setNumber: (number: string) => void;
  isValidNumber: () => boolean;
  getValidationError: () => number | null;
};

// Helper function to get country flag emoji
const getCountryFlag = (iso2: string): string => {
  if (!iso2) return "🏳️";

  // Convert ISO2 code to flag emoji
  const codePoints = iso2
    .toUpperCase()
    .split("")
    .map(char => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
};

// Helper function to format phone number as you type
const formatAsYouType = (value: string, country: Country | null): string => {
  // Basic formatting - this would be enhanced with utils
  if (!value || !country) return value;

  // Remove non-digits
  const digits = value.replace(/\D/g, "");

  // Basic formatting based on country
  // This is a simplified version - the full utils would provide proper formatting
  if (country.iso2 === "us" || country.iso2 === "ca") {
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
  }

  return digits;
};

const IntlTelInput = forwardRef<IntlTelInputRef, ItiProps>(function IntlTelInput({
  initialValue = "",
  onChangeNumber = () => {},
  onChangeCountry = () => {},
  onChangeValidity = () => {},
  onChangeErrorCode = () => {},
  usePreciseValidation = false, // eslint-disable-line @typescript-eslint/no-unused-vars
  initOptions = {},
  inputProps = {},
  disabled = undefined,
  style,
  dropdownStyle,
  flagStyle,
  textStyle,
}, ref) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string>(initialValue);
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(allCountries);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Initialize selected country
  useEffect(() => {
    let initialCountry = allCountries.find(c => c.iso2 === (initOptions.initialCountry || "us"));
    if (!initialCountry) {
      initialCountry = allCountries[0]; // fallback to first country
    }
    setSelectedCountry(initialCountry);
    onChangeCountry(initialCountry.iso2);
  }, [initOptions.initialCountry, onChangeCountry]);

  // Filter countries based on search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCountries(allCountries);
    } else {
      const filtered = allCountries.filter(country =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.iso2.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.dialCode.includes(searchQuery),
      );
      setFilteredCountries(filtered);
    }
  }, [searchQuery]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getNumber: () => {
      if (!selectedCountry) return phoneNumber;
      return `+${selectedCountry.dialCode}${phoneNumber}`;
    },
    getSelectedCountryData: () => selectedCountry,
    setCountry: (iso2: string) => {
      const country = allCountries.find(c => c.iso2 === iso2);
      if (country) {
        setSelectedCountry(country);
        onChangeCountry(iso2);
      }
    },
    setNumber: (number: string) => {
      setPhoneNumber(number);
      onChangeNumber(number);
    },
    isValidNumber: () => {
      // Basic validation - would be enhanced with utils
      return phoneNumber.length >= 7; // simplified validation
    },
    getValidationError: () => {
      // Basic error codes - would be enhanced with utils
      if (phoneNumber.length < 7) return 2; // TOO_SHORT
      if (phoneNumber.length > 15) return 3; // TOO_LONG
      return null;
    },
  }));

  const handlePhoneNumberChange = useCallback((text: string) => {
    const formattedText = initOptions.formatAsYouType !== false
      ? formatAsYouType(text, selectedCountry)
      : text;

    setPhoneNumber(formattedText);

    // Trigger callbacks
    const fullNumber = selectedCountry ? `+${selectedCountry.dialCode}${text}` : text;
    onChangeNumber(fullNumber);

    // Basic validation
    const isValid = text.length >= 7;
    onChangeValidity(isValid);
    onChangeErrorCode(isValid ? null : 2);
  }, [selectedCountry, onChangeNumber, onChangeValidity, onChangeErrorCode, initOptions.formatAsYouType]);

  const handleCountrySelect = useCallback((country: Country) => {
    setSelectedCountry(country);
    setIsDropdownVisible(false);
    setSearchQuery("");
    onChangeCountry(country.iso2);

    // Re-validate with new country
    const fullNumber = `+${country.dialCode}${phoneNumber}`;
    onChangeNumber(fullNumber);
  }, [phoneNumber, onChangeCountry, onChangeNumber]);

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[styles.countryItem, dropdownStyle]}
      onPress={() => handleCountrySelect(item)}
    >
      <Text style={[styles.flag, flagStyle]}>{getCountryFlag(item.iso2)}</Text>
      <Text style={[styles.countryName, textStyle]}>{item.name}</Text>
      <Text style={[styles.dialCode, textStyle]}>+{item.dialCode}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        {initOptions.allowDropdown !== false && (
          <TouchableOpacity
            style={[styles.countrySelector, disabled && styles.disabled]}
            onPress={() => !disabled && setIsDropdownVisible(true)}
            disabled={disabled}
          >
            {initOptions.showFlags !== false && (
              <Text style={[styles.selectedFlag, flagStyle]}>
                {getCountryFlag(selectedCountry?.iso2 || "")}
              </Text>
            )}
            {initOptions.separateDialCode && (
              <Text style={[styles.selectedDialCode, textStyle]}>
                +{selectedCountry?.dialCode}
              </Text>
            )}
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={[styles.phoneInput, textStyle, disabled && styles.disabled]}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          placeholder={initOptions.autoPlaceholder !== "off" ? "Phone number" : ""}
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
            <Text style={styles.modalTitle}>Select Country</Text>
          </View>

          {initOptions.countrySearch !== false && (
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search countries..."
              autoFocus
            />
          )}

          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.iso2}
            style={styles.countryList}
          />
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: "#ccc",
  },
  selectedFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  selectedDialCode: {
    fontSize: 16,
    marginRight: 4,
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  disabled: {
    backgroundColor: "#f5f5f5",
    color: "#999",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 44 : 0,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  searchInput: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    fontSize: 16,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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
    color: "#666",
  },
});

export default IntlTelInput;
