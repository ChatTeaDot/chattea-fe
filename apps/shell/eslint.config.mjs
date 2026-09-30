import expo from "eslint-config-expo/flat.js";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  ...expo,
  {
    ignores: ["dist/**", "@mf-types/**"],
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "import/no-unresolved": ["error", { ignore: ["^chattea_web/"] }],
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
