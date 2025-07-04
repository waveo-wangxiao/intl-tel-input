// react-native/src/intl-tel-input/react-native.tsx
import React, { useEffect, forwardRef, useImperativeHandle, useCallback, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
  Platform,
  StyleSheet
} from "react-native";

// src/js/intl-tel-input/data.ts
var rawCountryData = [
  [
    "af",
    // Afghanistan
    "93"
  ],
  [
    "ax",
    // Åland Islands
    "358",
    1
  ],
  [
    "al",
    // Albania
    "355"
  ],
  [
    "dz",
    // Algeria
    "213"
  ],
  [
    "as",
    // American Samoa
    "1",
    5,
    ["684"]
  ],
  [
    "ad",
    // Andorra
    "376"
  ],
  [
    "ao",
    // Angola
    "244"
  ],
  [
    "ai",
    // Anguilla
    "1",
    6,
    ["264"]
  ],
  [
    "ag",
    // Antigua and Barbuda
    "1",
    7,
    ["268"]
  ],
  [
    "ar",
    // Argentina
    "54"
  ],
  [
    "am",
    // Armenia
    "374"
  ],
  [
    "aw",
    // Aruba
    "297"
  ],
  [
    "ac",
    // Ascension Island
    "247"
  ],
  [
    "au",
    // Australia
    "61",
    0,
    null,
    "0"
  ],
  [
    "at",
    // Austria
    "43"
  ],
  [
    "az",
    // Azerbaijan
    "994"
  ],
  [
    "bs",
    // Bahamas
    "1",
    8,
    ["242"]
  ],
  [
    "bh",
    // Bahrain
    "973"
  ],
  [
    "bd",
    // Bangladesh
    "880"
  ],
  [
    "bb",
    // Barbados
    "1",
    9,
    ["246"]
  ],
  [
    "by",
    // Belarus
    "375"
  ],
  [
    "be",
    // Belgium
    "32"
  ],
  [
    "bz",
    // Belize
    "501"
  ],
  [
    "bj",
    // Benin
    "229"
  ],
  [
    "bm",
    // Bermuda
    "1",
    10,
    ["441"]
  ],
  [
    "bt",
    // Bhutan
    "975"
  ],
  [
    "bo",
    // Bolivia
    "591"
  ],
  [
    "ba",
    // Bosnia and Herzegovina
    "387"
  ],
  [
    "bw",
    // Botswana
    "267"
  ],
  [
    "br",
    // Brazil
    "55"
  ],
  [
    "io",
    // British Indian Ocean Territory
    "246"
  ],
  [
    "vg",
    // British Virgin Islands
    "1",
    11,
    ["284"]
  ],
  [
    "bn",
    // Brunei
    "673"
  ],
  [
    "bg",
    // Bulgaria
    "359"
  ],
  [
    "bf",
    // Burkina Faso
    "226"
  ],
  [
    "bi",
    // Burundi
    "257"
  ],
  [
    "kh",
    // Cambodia
    "855"
  ],
  [
    "cm",
    // Cameroon
    "237"
  ],
  [
    "ca",
    // Canada
    "1",
    1,
    ["204", "226", "236", "249", "250", "263", "289", "306", "343", "354", "365", "367", "368", "382", "387", "403", "416", "418", "428", "431", "437", "438", "450", "584", "468", "474", "506", "514", "519", "548", "579", "581", "584", "587", "604", "613", "639", "647", "672", "683", "705", "709", "742", "753", "778", "780", "782", "807", "819", "825", "867", "873", "879", "902", "905"]
  ],
  [
    "cv",
    // Cape Verde
    "238"
  ],
  [
    "bq",
    // Caribbean Netherlands
    "599",
    1,
    ["3", "4", "7"]
  ],
  [
    "ky",
    // Cayman Islands
    "1",
    12,
    ["345"]
  ],
  [
    "cf",
    // Central African Republic
    "236"
  ],
  [
    "td",
    // Chad
    "235"
  ],
  [
    "cl",
    // Chile
    "56"
  ],
  [
    "cn",
    // China
    "86"
  ],
  [
    "cx",
    // Christmas Island
    "61",
    2,
    ["89164"],
    "0"
  ],
  [
    "cc",
    // Cocos (Keeling) Islands
    "61",
    1,
    ["89162"],
    "0"
  ],
  [
    "co",
    // Colombia
    "57"
  ],
  [
    "km",
    // Comoros
    "269"
  ],
  [
    "cg",
    // Congo (Brazzaville)
    "242"
  ],
  [
    "cd",
    // Congo (Kinshasa)
    "243"
  ],
  [
    "ck",
    // Cook Islands
    "682"
  ],
  [
    "cr",
    // Costa Rica
    "506"
  ],
  [
    "ci",
    // Côte d'Ivoire
    "225"
  ],
  [
    "hr",
    // Croatia
    "385"
  ],
  [
    "cu",
    // Cuba
    "53"
  ],
  [
    "cw",
    // Curaçao
    "599",
    0
  ],
  [
    "cy",
    // Cyprus
    "357"
  ],
  [
    "cz",
    // Czech Republic
    "420"
  ],
  [
    "dk",
    // Denmark
    "45"
  ],
  [
    "dj",
    // Djibouti
    "253"
  ],
  [
    "dm",
    // Dominica
    "1",
    13,
    ["767"]
  ],
  [
    "do",
    // Dominican Republic
    "1",
    2,
    ["809", "829", "849"]
  ],
  [
    "ec",
    // Ecuador
    "593"
  ],
  [
    "eg",
    // Egypt
    "20"
  ],
  [
    "sv",
    // El Salvador
    "503"
  ],
  [
    "gq",
    // Equatorial Guinea
    "240"
  ],
  [
    "er",
    // Eritrea
    "291"
  ],
  [
    "ee",
    // Estonia
    "372"
  ],
  [
    "sz",
    // Eswatini
    "268"
  ],
  [
    "et",
    // Ethiopia
    "251"
  ],
  [
    "fk",
    // Falkland Islands (Malvinas)
    "500"
  ],
  [
    "fo",
    // Faroe Islands
    "298"
  ],
  [
    "fj",
    // Fiji
    "679"
  ],
  [
    "fi",
    // Finland
    "358",
    0
  ],
  [
    "fr",
    // France
    "33"
  ],
  [
    "gf",
    // French Guiana
    "594"
  ],
  [
    "pf",
    // French Polynesia
    "689"
  ],
  [
    "ga",
    // Gabon
    "241"
  ],
  [
    "gm",
    // Gambia
    "220"
  ],
  [
    "ge",
    // Georgia
    "995"
  ],
  [
    "de",
    // Germany
    "49"
  ],
  [
    "gh",
    // Ghana
    "233"
  ],
  [
    "gi",
    // Gibraltar
    "350"
  ],
  [
    "gr",
    // Greece
    "30"
  ],
  [
    "gl",
    // Greenland
    "299"
  ],
  [
    "gd",
    // Grenada
    "1",
    14,
    ["473"]
  ],
  [
    "gp",
    // Guadeloupe
    "590",
    0
  ],
  [
    "gu",
    // Guam
    "1",
    15,
    ["671"]
  ],
  [
    "gt",
    // Guatemala
    "502"
  ],
  [
    "gg",
    // Guernsey
    "44",
    1,
    ["1481", "7781", "7839", "7911"],
    "0"
  ],
  [
    "gn",
    // Guinea
    "224"
  ],
  [
    "gw",
    // Guinea-Bissau
    "245"
  ],
  [
    "gy",
    // Guyana
    "592"
  ],
  [
    "ht",
    // Haiti
    "509"
  ],
  [
    "hn",
    // Honduras
    "504"
  ],
  [
    "hk",
    // Hong Kong SAR China
    "852"
  ],
  [
    "hu",
    // Hungary
    "36"
  ],
  [
    "is",
    // Iceland
    "354"
  ],
  [
    "in",
    // India
    "91"
  ],
  [
    "id",
    // Indonesia
    "62"
  ],
  [
    "ir",
    // Iran
    "98"
  ],
  [
    "iq",
    // Iraq
    "964"
  ],
  [
    "ie",
    // Ireland
    "353"
  ],
  [
    "im",
    // Isle of Man
    "44",
    2,
    ["1624", "74576", "7524", "7924", "7624"],
    "0"
  ],
  [
    "il",
    // Israel
    "972"
  ],
  [
    "it",
    // Italy
    "39",
    0
  ],
  [
    "jm",
    // Jamaica
    "1",
    4,
    ["876", "658"]
  ],
  [
    "jp",
    // Japan
    "81"
  ],
  [
    "je",
    // Jersey
    "44",
    3,
    ["1534", "7509", "7700", "7797", "7829", "7937"],
    "0"
  ],
  [
    "jo",
    // Jordan
    "962"
  ],
  [
    "kz",
    // Kazakhstan
    "7",
    1,
    ["33", "7"],
    "8"
  ],
  [
    "ke",
    // Kenya
    "254"
  ],
  [
    "ki",
    // Kiribati
    "686"
  ],
  [
    "xk",
    // Kosovo
    "383"
  ],
  [
    "kw",
    // Kuwait
    "965"
  ],
  [
    "kg",
    // Kyrgyzstan
    "996"
  ],
  [
    "la",
    // Laos
    "856"
  ],
  [
    "lv",
    // Latvia
    "371"
  ],
  [
    "lb",
    // Lebanon
    "961"
  ],
  [
    "ls",
    // Lesotho
    "266"
  ],
  [
    "lr",
    // Liberia
    "231"
  ],
  [
    "ly",
    // Libya
    "218"
  ],
  [
    "li",
    // Liechtenstein
    "423"
  ],
  [
    "lt",
    // Lithuania
    "370"
  ],
  [
    "lu",
    // Luxembourg
    "352"
  ],
  [
    "mo",
    // Macao SAR China
    "853"
  ],
  [
    "mg",
    // Madagascar
    "261"
  ],
  [
    "mw",
    // Malawi
    "265"
  ],
  [
    "my",
    // Malaysia
    "60"
  ],
  [
    "mv",
    // Maldives
    "960"
  ],
  [
    "ml",
    // Mali
    "223"
  ],
  [
    "mt",
    // Malta
    "356"
  ],
  [
    "mh",
    // Marshall Islands
    "692"
  ],
  [
    "mq",
    // Martinique
    "596"
  ],
  [
    "mr",
    // Mauritania
    "222"
  ],
  [
    "mu",
    // Mauritius
    "230"
  ],
  [
    "yt",
    // Mayotte
    "262",
    1,
    ["269", "639"],
    "0"
  ],
  [
    "mx",
    // Mexico
    "52"
  ],
  [
    "fm",
    // Micronesia
    "691"
  ],
  [
    "md",
    // Moldova
    "373"
  ],
  [
    "mc",
    // Monaco
    "377"
  ],
  [
    "mn",
    // Mongolia
    "976"
  ],
  [
    "me",
    // Montenegro
    "382"
  ],
  [
    "ms",
    // Montserrat
    "1",
    16,
    ["664"]
  ],
  [
    "ma",
    // Morocco
    "212",
    0,
    null,
    "0"
  ],
  [
    "mz",
    // Mozambique
    "258"
  ],
  [
    "mm",
    // Myanmar (Burma)
    "95"
  ],
  [
    "na",
    // Namibia
    "264"
  ],
  [
    "nr",
    // Nauru
    "674"
  ],
  [
    "np",
    // Nepal
    "977"
  ],
  [
    "nl",
    // Netherlands
    "31"
  ],
  [
    "nc",
    // New Caledonia
    "687"
  ],
  [
    "nz",
    // New Zealand
    "64"
  ],
  [
    "ni",
    // Nicaragua
    "505"
  ],
  [
    "ne",
    // Niger
    "227"
  ],
  [
    "ng",
    // Nigeria
    "234"
  ],
  [
    "nu",
    // Niue
    "683"
  ],
  [
    "nf",
    // Norfolk Island
    "672"
  ],
  [
    "kp",
    // North Korea
    "850"
  ],
  [
    "mk",
    // North Macedonia
    "389"
  ],
  [
    "mp",
    // Northern Mariana Islands
    "1",
    17,
    ["670"]
  ],
  [
    "no",
    // Norway
    "47",
    0
  ],
  [
    "om",
    // Oman
    "968"
  ],
  [
    "pk",
    // Pakistan
    "92"
  ],
  [
    "pw",
    // Palau
    "680"
  ],
  [
    "ps",
    // Palestinian Territories
    "970"
  ],
  [
    "pa",
    // Panama
    "507"
  ],
  [
    "pg",
    // Papua New Guinea
    "675"
  ],
  [
    "py",
    // Paraguay
    "595"
  ],
  [
    "pe",
    // Peru
    "51"
  ],
  [
    "ph",
    // Philippines
    "63"
  ],
  [
    "pl",
    // Poland
    "48"
  ],
  [
    "pt",
    // Portugal
    "351"
  ],
  [
    "pr",
    // Puerto Rico
    "1",
    3,
    ["787", "939"]
  ],
  [
    "qa",
    // Qatar
    "974"
  ],
  [
    "re",
    // Réunion
    "262",
    0,
    null,
    "0"
  ],
  [
    "ro",
    // Romania
    "40"
  ],
  [
    "ru",
    // Russia
    "7",
    0,
    null,
    "8"
  ],
  [
    "rw",
    // Rwanda
    "250"
  ],
  [
    "ws",
    // Samoa
    "685"
  ],
  [
    "sm",
    // San Marino
    "378"
  ],
  [
    "st",
    // São Tomé & Príncipe
    "239"
  ],
  [
    "sa",
    // Saudi Arabia
    "966"
  ],
  [
    "sn",
    // Senegal
    "221"
  ],
  [
    "rs",
    // Serbia
    "381"
  ],
  [
    "sc",
    // Seychelles
    "248"
  ],
  [
    "sl",
    // Sierra Leone
    "232"
  ],
  [
    "sg",
    // Singapore
    "65"
  ],
  [
    "sx",
    // Sint Maarten
    "1",
    21,
    ["721"]
  ],
  [
    "sk",
    // Slovakia
    "421"
  ],
  [
    "si",
    // Slovenia
    "386"
  ],
  [
    "sb",
    // Solomon Islands
    "677"
  ],
  [
    "so",
    // Somalia
    "252"
  ],
  [
    "za",
    // South Africa
    "27"
  ],
  [
    "kr",
    // South Korea
    "82"
  ],
  [
    "ss",
    // South Sudan
    "211"
  ],
  [
    "es",
    // Spain
    "34"
  ],
  [
    "lk",
    // Sri Lanka
    "94"
  ],
  [
    "bl",
    // St. Barthélemy
    "590",
    1
  ],
  [
    "sh",
    // St. Helena
    "290"
  ],
  [
    "kn",
    // St. Kitts & Nevis
    "1",
    18,
    ["869"]
  ],
  [
    "lc",
    // St. Lucia
    "1",
    19,
    ["758"]
  ],
  [
    "mf",
    // St. Martin
    "590",
    2
  ],
  [
    "pm",
    // St. Pierre & Miquelon
    "508"
  ],
  [
    "vc",
    // St. Vincent & Grenadines
    "1",
    20,
    ["784"]
  ],
  [
    "sd",
    // Sudan
    "249"
  ],
  [
    "sr",
    // Suriname
    "597"
  ],
  [
    "sj",
    // Svalbard & Jan Mayen
    "47",
    1,
    ["79"]
  ],
  [
    "se",
    // Sweden
    "46"
  ],
  [
    "ch",
    // Switzerland
    "41"
  ],
  [
    "sy",
    // Syria
    "963"
  ],
  [
    "tw",
    // Taiwan
    "886"
  ],
  [
    "tj",
    // Tajikistan
    "992"
  ],
  [
    "tz",
    // Tanzania
    "255"
  ],
  [
    "th",
    // Thailand
    "66"
  ],
  [
    "tl",
    // Timor-Leste
    "670"
  ],
  [
    "tg",
    // Togo
    "228"
  ],
  [
    "tk",
    // Tokelau
    "690"
  ],
  [
    "to",
    // Tonga
    "676"
  ],
  [
    "tt",
    // Trinidad & Tobago
    "1",
    22,
    ["868"]
  ],
  [
    "tn",
    // Tunisia
    "216"
  ],
  [
    "tr",
    // Turkey
    "90"
  ],
  [
    "tm",
    // Turkmenistan
    "993"
  ],
  [
    "tc",
    // Turks & Caicos Islands
    "1",
    23,
    ["649"]
  ],
  [
    "tv",
    // Tuvalu
    "688"
  ],
  [
    "ug",
    // Uganda
    "256"
  ],
  [
    "ua",
    // Ukraine
    "380"
  ],
  [
    "ae",
    // United Arab Emirates
    "971"
  ],
  [
    "gb",
    // United Kingdom
    "44",
    0,
    null,
    "0"
  ],
  [
    "us",
    // United States
    "1",
    0
  ],
  [
    "uy",
    // Uruguay
    "598"
  ],
  [
    "vi",
    // U.S. Virgin Islands
    "1",
    24,
    ["340"]
  ],
  [
    "uz",
    // Uzbekistan
    "998"
  ],
  [
    "vu",
    // Vanuatu
    "678"
  ],
  [
    "va",
    // Vatican City
    "39",
    1,
    ["06698"]
  ],
  [
    "ve",
    // Venezuela
    "58"
  ],
  [
    "vn",
    // Vietnam
    "84"
  ],
  [
    "wf",
    // Wallis & Futuna
    "681"
  ],
  [
    "eh",
    // Western Sahara
    "212",
    1,
    ["5288", "5289"],
    "0"
  ],
  [
    "ye",
    // Yemen
    "967"
  ],
  [
    "zm",
    // Zambia
    "260"
  ],
  [
    "zw",
    // Zimbabwe
    "263"
  ]
];
var allCountries = [];
for (let i = 0; i < rawCountryData.length; i++) {
  const c = rawCountryData[i];
  allCountries[i] = {
    name: "",
    // this is now populated in the plugin
    iso2: c[0],
    dialCode: c[1],
    priority: c[2] || 0,
    areaCodes: c[3] || null,
    nodeById: {},
    nationalPrefix: c[4] || null
  };
}
var data_default = allCountries;

// react-native/src/intl-tel-input/react-native.tsx
var getCountryFlag = (iso2) => {
  if (!iso2) return "\u{1F3F3}\uFE0F";
  const codePoints = iso2.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
var formatAsYouType = (value, country) => {
  if (!value || !country) return value;
  const digits = value.replace(/\D/g, "");
  if (country.iso2 === "us" || country.iso2 === "ca") {
    if (digits.length >= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else if (digits.length >= 3) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
  }
  return digits;
};
var IntlTelInput = forwardRef(function IntlTelInput2({
  initialValue = "",
  onChangeNumber = () => {
  },
  onChangeCountry = () => {
  },
  onChangeValidity = () => {
  },
  onChangeErrorCode = () => {
  },
  usePreciseValidation = false,
  // eslint-disable-line @typescript-eslint/no-unused-vars
  initOptions = {},
  inputProps = {},
  disabled = void 0,
  style,
  dropdownStyle,
  flagStyle,
  textStyle
}, ref) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(initialValue);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(data_default);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    let initialCountry = data_default.find((c) => c.iso2 === (initOptions.initialCountry || "us"));
    if (!initialCountry) {
      initialCountry = data_default[0];
    }
    setSelectedCountry(initialCountry);
    onChangeCountry(initialCountry.iso2);
  }, [initOptions.initialCountry, onChangeCountry]);
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCountries(data_default);
    } else {
      const filtered = data_default.filter(
        (country) => country.name.toLowerCase().includes(searchQuery.toLowerCase()) || country.iso2.toLowerCase().includes(searchQuery.toLowerCase()) || country.dialCode.includes(searchQuery)
      );
      setFilteredCountries(filtered);
    }
  }, [searchQuery]);
  useImperativeHandle(ref, () => ({
    getNumber: () => {
      if (!selectedCountry) return phoneNumber;
      return `+${selectedCountry.dialCode}${phoneNumber}`;
    },
    getSelectedCountryData: () => selectedCountry,
    setCountry: (iso2) => {
      const country = data_default.find((c) => c.iso2 === iso2);
      if (country) {
        setSelectedCountry(country);
        onChangeCountry(iso2);
      }
    },
    setNumber: (number) => {
      setPhoneNumber(number);
      onChangeNumber(number);
    },
    isValidNumber: () => {
      return phoneNumber.length >= 7;
    },
    getValidationError: () => {
      if (phoneNumber.length < 7) return 2;
      if (phoneNumber.length > 15) return 3;
      return null;
    }
  }));
  const handlePhoneNumberChange = useCallback((text) => {
    const formattedText = initOptions.formatAsYouType !== false ? formatAsYouType(text, selectedCountry) : text;
    setPhoneNumber(formattedText);
    const fullNumber = selectedCountry ? `+${selectedCountry.dialCode}${text}` : text;
    onChangeNumber(fullNumber);
    const isValid = text.length >= 7;
    onChangeValidity(isValid);
    onChangeErrorCode(isValid ? null : 2);
  }, [selectedCountry, onChangeNumber, onChangeValidity, onChangeErrorCode, initOptions.formatAsYouType]);
  const handleCountrySelect = useCallback((country) => {
    setSelectedCountry(country);
    setIsDropdownVisible(false);
    setSearchQuery("");
    onChangeCountry(country.iso2);
    const fullNumber = `+${country.dialCode}${phoneNumber}`;
    onChangeNumber(fullNumber);
  }, [phoneNumber, onChangeCountry, onChangeNumber]);
  const renderCountryItem = ({ item }) => /* @__PURE__ */ React.createElement(
    TouchableOpacity,
    {
      style: [styles.countryItem, dropdownStyle],
      onPress: () => handleCountrySelect(item)
    },
    /* @__PURE__ */ React.createElement(Text, { style: [styles.flag, flagStyle] }, getCountryFlag(item.iso2)),
    /* @__PURE__ */ React.createElement(Text, { style: [styles.countryName, textStyle] }, item.name),
    /* @__PURE__ */ React.createElement(Text, { style: [styles.dialCode, textStyle] }, "+", item.dialCode)
  );
  return /* @__PURE__ */ React.createElement(View, { style: [styles.container, style] }, /* @__PURE__ */ React.createElement(View, { style: styles.inputContainer }, initOptions.allowDropdown !== false && /* @__PURE__ */ React.createElement(
    TouchableOpacity,
    {
      style: [styles.countrySelector, disabled && styles.disabled],
      onPress: () => !disabled && setIsDropdownVisible(true),
      disabled
    },
    initOptions.showFlags !== false && /* @__PURE__ */ React.createElement(Text, { style: [styles.selectedFlag, flagStyle] }, getCountryFlag(selectedCountry?.iso2 || "")),
    initOptions.separateDialCode && /* @__PURE__ */ React.createElement(Text, { style: [styles.selectedDialCode, textStyle] }, "+", selectedCountry?.dialCode),
    /* @__PURE__ */ React.createElement(Text, { style: styles.dropdownArrow }, "\u25BC")
  ), /* @__PURE__ */ React.createElement(
    TextInput,
    {
      style: [styles.phoneInput, textStyle, disabled && styles.disabled],
      value: phoneNumber,
      onChangeText: handlePhoneNumberChange,
      placeholder: initOptions.autoPlaceholder !== "off" ? "Phone number" : "",
      keyboardType: "phone-pad",
      editable: !disabled,
      ...inputProps
    }
  )), /* @__PURE__ */ React.createElement(
    Modal,
    {
      visible: isDropdownVisible,
      animationType: "slide",
      onRequestClose: () => setIsDropdownVisible(false)
    },
    /* @__PURE__ */ React.createElement(View, { style: styles.modalContainer }, /* @__PURE__ */ React.createElement(View, { style: styles.modalHeader }, /* @__PURE__ */ React.createElement(
      TouchableOpacity,
      {
        style: styles.closeButton,
        onPress: () => setIsDropdownVisible(false)
      },
      /* @__PURE__ */ React.createElement(Text, { style: styles.closeButtonText }, "\u2715")
    ), /* @__PURE__ */ React.createElement(Text, { style: styles.modalTitle }, "Select Country")), initOptions.countrySearch !== false && /* @__PURE__ */ React.createElement(
      TextInput,
      {
        style: styles.searchInput,
        value: searchQuery,
        onChangeText: setSearchQuery,
        placeholder: "Search countries...",
        autoFocus: true
      }
    ), /* @__PURE__ */ React.createElement(
      FlatList,
      {
        data: filteredCountries,
        renderItem: renderCountryItem,
        keyExtractor: (item) => item.iso2,
        style: styles.countryList
      }
    ))
  ));
});
var styles = StyleSheet.create({
  container: {
    flexDirection: "column"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    backgroundColor: "#fff"
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: "#ccc"
  },
  selectedFlag: {
    fontSize: 20,
    marginRight: 8
  },
  selectedDialCode: {
    fontSize: 16,
    marginRight: 4
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666"
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16
  },
  disabled: {
    backgroundColor: "#f5f5f5",
    color: "#999"
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 44 : 0
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  closeButton: {
    padding: 8
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold"
  },
  modalTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold"
  },
  searchInput: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    fontSize: 16
  },
  countryList: {
    flex: 1
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  flag: {
    fontSize: 20,
    marginRight: 12
  },
  countryName: {
    flex: 1,
    fontSize: 16
  },
  dialCode: {
    fontSize: 16,
    color: "#666"
  }
});
var react_native_default = IntlTelInput;
export {
  data_default as allCountries,
  react_native_default as default
};
