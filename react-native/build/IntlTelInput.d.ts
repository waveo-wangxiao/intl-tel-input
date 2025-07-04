declare module "intl-tel-input/data" {
    export type Country = {
        name: string;
        iso2: string;
        dialCode: string;
        priority: number;
        areaCodes: string[] | null;
        nodeById: object;
        nationalPrefix: string | null;
    };
    const allCountries: Country[];
    export default allCountries;
}

declare module "intl-tel-input/react-native" {
    import { Country } from "intl-tel-input/data";
    import React from "react";
    import { TextInputProps } from "react-native";
    
    export { allCountries } from "intl-tel-input/data";
    
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
    
    const IntlTelInput: React.ForwardRefExoticComponent<ItiProps & React.RefAttributes<IntlTelInputRef>>;
    export default IntlTelInput;
}

declare module "intl-tel-input/reactNativeWithUtils" {
    import { Country } from "intl-tel-input/data";
    import React from "react";
    import { TextInputProps } from "react-native";
    
    export { allCountries, utils } from "intl-tel-input/react-native";
    
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
        isValidNumberPrecise: () => boolean;
        getValidationError: () => number | null;
    };
    
    const IntlTelInput: React.ForwardRefExoticComponent<ItiProps & React.RefAttributes<IntlTelInputRef>>;
    export default IntlTelInput;
}
