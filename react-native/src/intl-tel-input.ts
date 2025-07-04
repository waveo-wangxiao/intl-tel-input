import allCountries, { Country } from "./intl-tel-input/data";
import { I18n } from "./intl-tel-input/i18n/types";
import defaultEnglishStrings from "../../src/js/intl-tel-input/i18n/en";

//* Populate the country names in the default language - useful if you want to use static getCountryData to populate another country dropdown etc.
for (let i = 0; i < allCountries.length; i++) {
  allCountries[i].name = defaultEnglishStrings[allCountries[i].iso2];
}

type UtilsLoader = () => Promise<{default: ItiUtils}>;

interface IntlTelInputInterface {
  autoCountry?: string;
  defaults: AllOptions;
  getCountryData: () => Country[];
  attachUtils: (source: UtilsLoader) => Promise<unknown> | null;
  startedLoadingAutoCountry: boolean;
  startedLoadingUtilsScript: boolean;
  version: string | undefined;
  utils?: ItiUtils;
}

type ItiUtils = {
  formatNumber(number: string, iso2: string | undefined, format?: number): string;
  formatNumberAsYouType(number: string, iso2: string | undefined): string;
  getCoreNumber(number: string, iso2: string | undefined): string;
  getExampleNumber(iso2: string | undefined, nationalMode: boolean, numberType: number, useE164?: boolean): string;
  getExtension(number: string, iso2: string | undefined): string;
  getNumberType(number: string, iso2: string | undefined): number;
  getValidationError(number: string, iso2: string | undefined): number;
  isPossibleNumber(number: string, iso2: string | undefined, numberType?: NumberType[] | null): boolean;
  isValidNumber(number: string, iso2: string | undefined, numberType?: NumberType[] | null): boolean;
  numberFormat: { NATIONAL: number, INTERNATIONAL: number, E164: number, RFC3966: number };
  numberType: object;
};

type NumberType =
  "FIXED_LINE_OR_MOBILE"
  | "FIXED_LINE"
  | "MOBILE"
  | "PAGER"
  | "PERSONAL_NUMBER"
  | "PREMIUM_RATE"
  | "SHARED_COST"
  | "TOLL_FREE"
  | "UAN"
  | "UNKNOWN"
  | "VOICEMAIL"
  | "VOIP";

//* Can't just use the Country type, as during the empty state (globe icon), this is set to an empty object for convenience.
type SelectedCountryData = {
  name?: string,
  iso2?: string,
  dialCode?: string,
  areaCodes?: string[],
  nationalPrefix?: string,
};

interface AllOptions {
  allowDropdown: boolean;
  autoPlaceholder: string;
  containerClass: string;
  countryOrder: string[];
  countrySearch: boolean;
  customPlaceholder: ((selectedCountryPlaceholder: string, selectedCountryData: object) => string) | null;
  excludeCountries: string[];
  fixDropdownWidth: boolean;
  formatAsYouType: boolean;
  formatOnDisplay: boolean;
  geoIpLookup: ((success: (iso2: string) => void, failure: () => void) => void) | null;
  hiddenInput: ((telInputName: string) => {phone: string, country?: string}) | null;
  i18n: I18n,
  initialCountry: string;
  loadUtils: UtilsLoader;
  nationalMode: boolean;
  onlyCountries: string[];
  placeholderNumberType: NumberType;
  showFlags: boolean;
  separateDialCode: boolean;
  strictMode: boolean;
  useFullscreenPopup: boolean;
  validationNumberTypes: NumberType[] | null;
}

//* Export this as useful in react component too.
export type SomeOptions = Partial<AllOptions>;

//* These vars persist through all instances of the plugin.
let id = 0;
const defaults: AllOptions = {
  //* Whether or not to allow the dropdown.
  allowDropdown: true,
  //* Add a placeholder in the input with an example number for the selected country.
  autoPlaceholder: "polite",
  //* Modify the parentClass.
  containerClass: "",
  //* The order of the countries in the dropdown. Defaults to alphabetical.
  countryOrder: [],
  //* Add a country search input at the top of the dropdown.
  countrySearch: true,
  //* Modify the auto placeholder.
  customPlaceholder: null,
  //* Don't display these countries.
  excludeCountries: [],
  //* Fix the dropdown width to the input width (rather than being as wide as the longest country name).
  fixDropdownWidth: true,
  //* Format the number as the user types
  formatAsYouType: true,
  //* Format the input value during initialisation and on setNumber.
  formatOnDisplay: true,
  //* geoIp lookup function.
  geoIpLookup: null,
  //* Inject a hidden input with the name returned from this function, and on submit, populate it with the result of getNumber.
  hiddenInput: null,
  //* Internationalise the plugin text e.g. search input placeholder, country names.
  i18n: {},
  //* Initial country.
  initialCountry: "",
  //* A function to load the utils script.
  loadUtils: null,
  //* National vs international formatting for numbers e.g. placeholders and displaying existing numbers.
  nationalMode: true,
  //* Display only these countries.
  onlyCountries: [],
  //* Number type to use for placeholders.
  placeholderNumberType: "MOBILE",
  //* Show flags - for both the selected country, and in the country dropdown
  showFlags: true,
  //* Display the international dial code next to the selected flag.
  separateDialCode: false,
  //* Only allow certain chars e.g. a plus followed by numeric digits, and cap at max valid length.
  strictMode: false,
  //* Use full screen popup instead of dropdown for country list.
  useFullscreenPopup: false, // React Native will handle this differently
  //* The number type to enforce during validation.
  validationNumberTypes: ["MOBILE"],
};

//* https://en.wikipedia.org/wiki/List_of_North_American_Numbering_Plan_area_codes#Non-geographic_area_codes
const regionlessNanpNumbers = [
  "800", "822", "833", "844", "855", "866", "877", "880", "881", "882", "883", "884", "885", "886", "887", "888", "889",
];

//* Extract the numeric digits from the given string.
const getNumeric = (s: string): string => s.replace(/\D/g, "");

//* Normalise string: turns "Réunion" into "Reunion".
//* from https://stackoverflow.com/a/37511463
const normaliseString = (s: string = ""): string =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

//* Check if the given number is a regionless NANP number (expects the number to contain an international dial code)
const isRegionlessNanp = (number: string): boolean => {
  const numeric = getNumeric(number);
  if (numeric.charAt(0) === "1") {
    const areaCode = numeric.substring(1, 4);
    return regionlessNanpNumbers.includes(areaCode);
  }
  return false;
};

//* This is our plugin class that we will create an instance of
// eslint-disable-next-line no-unused-vars
export class Iti {
  //* Public properties
  id: number;
  promise: Promise<[unknown, unknown]>;

  //* Private properties
  private options: AllOptions;
  private selectedCountryData: SelectedCountryData;
  private countries: Country[];
  private dialCodeMaxLen: number;
  private dialCodeToIso2Map: { [key: string]: string[] };
  private dialCodes: { [key: string]: boolean };
  private maxCoreNumberLength: number | null;
  private defaultCountry: string;

  private resolveAutoCountryPromise: (value?: unknown) => void;
  private rejectAutoCountryPromise: (reason?: unknown) => void;
  private resolveUtilsScriptPromise: (value?: unknown) => void;
  private rejectUtilsScriptPromise: (reason?: unknown) => void;

  constructor(customOptions: SomeOptions = {}) {
    this.id = id++;

    //* Process specified options / defaults.
    this.options = Object.assign({}, defaults, customOptions);

    //* these promises get resolved when their individual requests complete
    //* this way the dev can do something like iti.promise.then(...) to know when all requests are complete.
    const autoCountryPromise = new Promise((resolve, reject) => {
      this.resolveAutoCountryPromise = resolve;
      this.rejectAutoCountryPromise = reject;
    });
    const utilsScriptPromise = new Promise((resolve, reject) => {
      this.resolveUtilsScriptPromise = resolve;
      this.rejectUtilsScriptPromise = reject;
    });
    this.promise = Promise.all([autoCountryPromise, utilsScriptPromise]);

    //* In various situations there could be no country selected initially, but we need to be able
    //* to assume this variable exists.
    this.selectedCountryData = {};
    this.dialCodeToIso2Map = {};
    this.dialCodes = {};
    this.maxCoreNumberLength = null;
    this.defaultCountry = "";

    //* Process all the data: onlyCountries, excludeCountries, countryOrder etc.
    this._processCountryData();

    //* Utils script, and auto country.
    this._initRequests();
  }

  //********************
  //*  PRIVATE METHODS
  //********************

  //* Prepare all of the country data, including onlyCountries, excludeCountries, countryOrder options.
  private _processCountryData(): void {
    //* Process onlyCountries or excludeCountries array if present.
    this._processAllCountries();

    //* Generate this.dialCodes and this.dialCodeToIso2Map.
    this._processDialCodes();

    //* Translate country names according to i18n option.
    this._translateCountryNames();

    //* Sort countries by countryOrder option (if present), then name.
    this._sortCountries();
  }

  //* Process onlyCountries or excludeCountries array if present.
  private _processAllCountries(): void {
    const { onlyCountries, excludeCountries } = this.options;
    if (onlyCountries.length) {
      const lowerCaseOnlyCountries = onlyCountries.map((country) =>
        country.toLowerCase(),
      );
      this.countries = allCountries.filter(
        (country) => lowerCaseOnlyCountries.includes(country.iso2),
      );
    } else if (excludeCountries.length) {
      const lowerCaseExcludeCountries = excludeCountries.map(
        (country) => country.toLowerCase(),
      );
      this.countries = allCountries.filter(
        (country) => !lowerCaseExcludeCountries.includes(country.iso2),
      );
    } else {
      this.countries = allCountries;
    }
  }

  //* Translate Countries by object literal provided on config.
  private _translateCountryNames(): void {
    for (let i = 0; i < this.countries.length; i++) {
      const iso2 = this.countries[i].iso2.toLowerCase();
      if (this.options.i18n.hasOwnProperty(iso2)) {
        this.countries[i].name = this.options.i18n[iso2];
      }
    }
  }

  //* Sort countries by countryOrder option (if present), then name.
  private _sortCountries() {
    if (this.options.countryOrder) {
      this.options.countryOrder = this.options.countryOrder.map((country) => country.toLowerCase());
    }
    this.countries.sort((a: Country, b: Country): number => {
      //* Primary sort: countryOrder option.
      const { countryOrder } = this.options;
      if (countryOrder) {
        const aIndex = countryOrder.indexOf(a.iso2);
        const bIndex = countryOrder.indexOf(b.iso2);
        const aIndexExists = aIndex > -1;
        const bIndexExists = bIndex > -1;
        if (aIndexExists || bIndexExists) {
          if (aIndexExists && bIndexExists) {
            return aIndex - bIndex;
          }
          return aIndexExists ? -1 : 1;
        }
      }

      //* Secondary sort: country name.
      return a.name.localeCompare(b.name);
    });
  }

  //* Add a dial code to this.dialCodeToIso2Map.
  private _addToDialCodeMap(iso2: string, dialCode: string, priority?: number): void {
    //* Update dialCodeMaxLen.
    if (dialCode.length > this.dialCodeMaxLen) {
      this.dialCodeMaxLen = dialCode.length;
    }
    //* If this entry doesn't already exist, then create it.
    if (!this.dialCodeToIso2Map.hasOwnProperty(dialCode)) {
      this.dialCodeToIso2Map[dialCode] = [];
    }
    //* Bail if we already have this country for this dialCode.
    for (let i = 0; i < this.dialCodeToIso2Map[dialCode].length; i++) {
      if (this.dialCodeToIso2Map[dialCode][i] === iso2) {
        return;
      }
    }
    //* Check for undefined as 0 is falsy.
    const index =
      priority !== undefined ? priority : this.dialCodeToIso2Map[dialCode].length;
    this.dialCodeToIso2Map[dialCode][index] = iso2;
  }

  //* Generate this.dialCodes and this.dialCodeToIso2Map.
  private _processDialCodes(): void {
    //* Here we store just dial codes, where the key is the dial code, and the value is true
    //* e.g. { 1: true, 7: true, 20: true, ... }.
    this.dialCodes = {};
    this.dialCodeMaxLen = 0;

    //* Here we map dialCodes (inc both dialCode and dialCode+areaCode) to iso2 codes e.g.
    /*
     * {
     *   1: [ 'us', 'ca', ... ],    # all NANP countries (with dial code "1")
     *   12: [ 'us', 'ca', ... ],   # subset of NANP countries (that have area codes starting with "2")
     *   120: [ 'us', 'ca' ],       # just US and Canada (that have area codes starting "20")
     *   1204: [ 'ca' ],            # only Canada (that has a "204" area code)
     *   ...
     *  }
     */
    this.dialCodeToIso2Map = {};

    //* First: add dial codes.
    for (let i = 0; i < this.countries.length; i++) {
      const c = this.countries[i];
      if (!this.dialCodes[c.dialCode]) {
        this.dialCodes[c.dialCode] = true;
      }
      this._addToDialCodeMap(c.iso2, c.dialCode, c.priority);
    }

    //* Next: add area codes.
    //* This is a second loop over countries, to make sure we have all of the "root" countries
    //* already in the map, so that we can access them, as each time we add an area code substring
    //* to the map, we also need to include the "root" country's code, as that also matches.
    for (let i = 0; i < this.countries.length; i++) {
      const c = this.countries[i];
      //* Area codes
      if (c.areaCodes) {
        const rootIso2Code = this.dialCodeToIso2Map[c.dialCode][0];
        //* For each area code.
        for (let j = 0; j < c.areaCodes.length; j++) {
          const areaCode = c.areaCodes[j];
          //* For each digit in the area code to add all partial matches as well.
          for (let k = 1; k < areaCode.length; k++) {
            const partialAreaCode = areaCode.substring(0, k);
            const partialDialCode = c.dialCode + partialAreaCode;
            //* Start with the root country, as that also matches this partial dial code.
            this._addToDialCodeMap(rootIso2Code, partialDialCode);
            this._addToDialCodeMap(c.iso2, partialDialCode);
          }
          //* Add the full area code.
          this._addToDialCodeMap(c.iso2, c.dialCode + areaCode);
        }
      }
    }
  }

  //* Init many requests: utils script / geo ip lookup.
  private _initRequests(): void {
    // eslint-disable-next-line prefer-const
    let { loadUtils, initialCountry, geoIpLookup } = this.options;

    //* If the user has specified the path to the utils script, fetch it on window.load, else resolve.
    if (loadUtils && !intlTelInput.utils) {
      //* For React Native, we can load utils immediately since there's no window.load event
      intlTelInput.attachUtils(loadUtils)?.catch(() => {});
    } else {
      this.resolveUtilsScriptPromise();
    }

    //* Don't bother with IP lookup if we already have a selected country.
    const isAutoCountry = initialCountry === "auto" && geoIpLookup;
    if (isAutoCountry && !this.selectedCountryData.iso2) {
      this._loadAutoCountry();
    } else {
      this.resolveAutoCountryPromise();
    }
  }

  //* Perform the geo ip lookup.
  private _loadAutoCountry(): void {
    //* 3 options:
    //* 1) Already loaded (we're done)
    //* 2) Not already started loading (start)
    //* 3) Already started loading (do nothing - just wait for loading callback to fire)
    if (intlTelInput.autoCountry) {
      this.handleAutoCountry();
    } else if (!intlTelInput.startedLoadingAutoCountry) {
      //* Don't do this twice!
      intlTelInput.startedLoadingAutoCountry = true;

      if (typeof this.options.geoIpLookup === "function") {
        this.options.geoIpLookup(
          (iso2 = "") => {
            const iso2Lower = iso2.toLowerCase();
            const isValidIso2 = iso2Lower && this._getCountryData(iso2Lower, true);
            if (isValidIso2) {
              intlTelInput.autoCountry = iso2Lower;
              //* Tell all instances the auto country is ready.
              setTimeout(() => {
                // In React Native, we don't have multiple instances like DOM version
                this.handleAutoCountry();
              });
            } else {
              this._setInitialState(true);
              this.rejectAutoCountryPromise();
            }
          },
          () => {
            this._setInitialState(true);
            this.rejectAutoCountryPromise();
          },
        );
      }
    }
  }

  //* Get country data by iso2 code.
  private _getCountryData(iso2: string, allowFail: boolean): Country | null {
    for (let i = 0; i < this.countries.length; i++) {
      if (this.countries[i].iso2 === iso2) {
        return this.countries[i];
      }
    }
    if (allowFail) {
      return null;
    }
    throw new Error(`No country data for '${iso2}'`);
  }

  //* Set the initial state of the input value and the selected country by:
  //* 1. Extracting a dial code from the given number
  //* 2. Using explicit initialCountry
  private _setInitialState(overrideAutoCountry: boolean = false): void {
    const { initialCountry, geoIpLookup } = this.options;
    const isAutoCountry = initialCountry === "auto" && geoIpLookup;

    if (!isAutoCountry || overrideAutoCountry) {
      const lowerInitialCountry = initialCountry ? initialCountry.toLowerCase() : "";
      const isValidInitialCountry = lowerInitialCountry && this._getCountryData(lowerInitialCountry, true);
      //* See if we should select a country.
      if (isValidInitialCountry) {
        this._setCountry(lowerInitialCountry);
      } else {
        //* Display the empty state (globe icon).
        this._setCountry();
      }
    }
  }

  //* Update the selected country, and update the input val accordingly.
  private _setCountry(iso2?: string): boolean {
    const prevCountry = this.selectedCountryData;
    const { showFlags, separateDialCode } = this.options;

    //* Do this first as it will throw an error and stop if iso2 is invalid.
    this.selectedCountryData = iso2
      ? this._getCountryData(iso2, false) || {}
      : {};
    //* Update the defaultCountry - we only need the iso2 from now on, so just store that.
    if (this.selectedCountryData.iso2) {
      this.defaultCountry = this.selectedCountryData.iso2;
    }

    //* Return if the country has changed or not.
    return prevCountry.iso2 !== iso2;
  }

  //* This is called when the geoip call returns.
  handleAutoCountry(): void {
    if (this.options.initialCountry === "auto" && intlTelInput.autoCountry) {
      //* We must set this even if there is an initial val in the input: in case the initial val is
      //* invalid and they delete it - they should see their auto country.
      this.defaultCountry = intlTelInput.autoCountry;
      const hasSelectedCountryOrGlobe = this.selectedCountryData.iso2;
      //* If no country/globe currently selected, then update the country.
      if (!hasSelectedCountryOrGlobe) {
        this.setCountry(this.defaultCountry);
      }
      this.resolveAutoCountryPromise();
    }
  }

  //* This is called when the utils request completes.
  handleUtils(): void {
    //* If the request was successful
    if (intlTelInput.utils) {
      this.resolveUtilsScriptPromise();
    } else {
      this.rejectUtilsScriptPromise();
    }
  }

  //********************
  //*  PUBLIC METHODS
  //********************

  //* Get the extension from the current number.
  getExtension(): string {
    if (intlTelInput.utils) {
      return intlTelInput.utils.getExtension(
        this._getFullNumber(),
        this.selectedCountryData.iso2,
      );
    }
    return "";
  }

  //* Format the number to the given format.
  getNumber(format?: number): string {
    if (intlTelInput.utils) {
      const { iso2 } = this.selectedCountryData;
      return intlTelInput.utils.formatNumber(
        this._getFullNumber(),
        iso2,
        format,
      );
    }
    return this._getFullNumber();
  }

  //* Get the type of the entered number e.g. landline/mobile.
  getNumberType(): number {
    if (intlTelInput.utils) {
      return intlTelInput.utils.getNumberType(
        this._getFullNumber(),
        this.selectedCountryData.iso2,
      );
    }
    return -99;
  }

  //* Get the country data for the currently selected country.
  getSelectedCountryData(): SelectedCountryData {
    return this.selectedCountryData;
  }

  //* Get the processed countries list (after filtering and sorting).
  getCountries(): Country[] {
    return this.countries;
  }

  //* Get the current options.
  getOptions(): AllOptions {
    return this.options;
  }

  //* Get the validation error.
  getValidationError(): number {
    if (intlTelInput.utils) {
      const { iso2 } = this.selectedCountryData;
      return intlTelInput.utils.getValidationError(this._getFullNumber(), iso2);
    }
    return -99;
  }

  //* Validate the input val
  isValidNumber(): boolean | null {
    //* If there isn't a valid country selected, then it's not a valid number.
    if (!this.selectedCountryData.iso2) {
      return false;
    }
    const val = this._getFullNumber();
    return intlTelInput.utils
      ? intlTelInput.utils.isValidNumber(val, this.selectedCountryData.iso2, this.options.validationNumberTypes)
      : null;
  }

  //* Validate the input val (precise)
  isValidNumberPrecise(): boolean | null {
    //* If there isn't a valid country selected, then it's not a valid number.
    if (!this.selectedCountryData.iso2) {
      return false;
    }
    const val = this._getFullNumber();
    return intlTelInput.utils
      ? intlTelInput.utils.isValidNumber(val, this.selectedCountryData.iso2, this.options.validationNumberTypes)
      : null;
  }

  //* Update the selected country, and update the input val accordingly.
  setCountry(iso2: string): void {
    const iso2Lower = iso2?.toLowerCase();
    const currentCountry = this.selectedCountryData.iso2;
    //* There is a country change IF: either there is a new country and it's different to the current one, OR there is no new country (i.e. globe state) and there is a current country
    const isCountryChange = (iso2 && (iso2Lower !== currentCountry) || (!iso2 && currentCountry));
    if (isCountryChange) {
      this._setCountry(iso2Lower);
    }
  }

  //* Current input value - to be set by React Native component
  private currentInputValue: string = "";

  //* Set the current input value (called by React Native component)
  setInputValue(value: string): void {
    this.currentInputValue = value;
  }

  //* Helper method to get full number
  private _getFullNumber(): string {
    return this.currentInputValue;
  }
}

//* Load the utils script.
const attachUtils = (
  source: UtilsLoader,
): Promise<unknown> | null => {
  if (!source || typeof source !== "function") {
    return Promise.reject(new TypeError("The loader function passed to attachUtils must be a function."));
  }

  let loadCall;
  if (typeof source === "function") {
    try {
      loadCall = Promise.resolve(source());
    } catch (error) {
      return Promise.reject(error);
    }
  } else {
    return Promise.reject(new TypeError("The loader function passed to attachUtils must be a function."));
  }

  return loadCall
    .then((module) => {
      const utils = module?.default;
      if (!utils || typeof utils !== "object") {
        throw new TypeError("The loader function passed to attachUtils did not resolve to a module object with utils as its default export.");
      }

      //* Set the utils object on the global intlTelInput object.
      intlTelInput.utils = utils;

      //* Resolve all instances' utils promises.
      // In React Native, we don't have multiple instances like DOM version
      return utils;
    })
    .catch((error) => {
      throw error;
    });
};

//* Convenience wrapper.
const intlTelInput: IntlTelInputInterface = Object.assign(
  {},
  {
    defaults,
    //* Get the country data object.
    getCountryData: (): Country[] => allCountries,
    attachUtils,
    startedLoadingUtilsScript: false,
    startedLoadingAutoCountry: false,
    version: process.env.VERSION,
  });

export default intlTelInput;

//* Export types and classes for React Native component usage
export { Country, SelectedCountryData, NumberType, ItiUtils, AllOptions };
