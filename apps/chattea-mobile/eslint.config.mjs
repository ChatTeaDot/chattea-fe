import expo from "eslint-config-expo/flat.js";
import reactNativeA11y from "eslint-plugin-react-native-a11y";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  ...expo,
  {
    ignores: [".expo/**", "dist/**", "ios/**", "android/**", ".rnstorybook/storybook.requires.ts"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-native-a11y": reactNativeA11y,
    },
    rules: {
      ...reactNativeA11y.configs.all.rules,
      "react-native-a11y/has-accessibility-hint": "off",
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration",
          message: "Use arrow function expressions",
        },
      ],
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
    },
  },
];
