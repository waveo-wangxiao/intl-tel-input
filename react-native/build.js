/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { build } = require("esbuild");
const packageJson = require("../package.json");

const mainShared = {
  bundle: true,
  external: ["react", "react-native", "prop-types"],
  logLevel: "info",
  minify: false, //* Don't minify as (1) esbuild minify removes comments that we need to keep e.g. webpack import fix, (2) these files will be imported into other projects that will have their own minification process
  define: { "process.env.VERSION": `"${packageJson.version}"` },
};

//* React Native Component - CommonJS
build({
  ...mainShared,
  entryPoints: ["react-native/src/intl-tel-input/react-native.tsx"],
  format: "cjs",
  outfile: "react-native/build/IntlTelInput.cjs",
});

//* React Native Component - Default (ES Modules)
build({
  ...mainShared,
  entryPoints: ["react-native/src/intl-tel-input/react-native.tsx"],
  format: "esm",
  outfile: "react-native/build/IntlTelInput.js",
});

//* React Native Component With Utils - CommonJS
build({
  ...mainShared,
  entryPoints: ["react-native/src/intl-tel-input/reactNativeWithUtils.tsx"],
  format: "cjs",
  outfile: "react-native/build/IntlTelInputWithUtils.cjs",
});

//* React Native Component With Utils - Default (ES Modules)
build({
  ...mainShared,
  entryPoints: ["react-native/src/intl-tel-input/reactNativeWithUtils.tsx"],
  format: "esm",
  outfile: "react-native/build/IntlTelInputWithUtils.js",
});
