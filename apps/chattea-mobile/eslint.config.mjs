import expo from "eslint-config-expo/flat.js";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  ...expo,
  {
    ignores: [".expo/**", "dist/**", "ios/**", "android/**", ".rnstorybook/storybook.requires.ts"],
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
