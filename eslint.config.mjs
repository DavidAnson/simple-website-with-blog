import js from "@eslint/js";
import unicorn from "eslint-plugin-unicorn";

/* eslint-disable array-element-newline */

export default [
  js.configs.all,
  unicorn.configs["flat/all"],
  {
    "languageOptions": {
      "ecmaVersion": 2021,
      "globals": {
        "console": "readonly",
        "document": "readonly",
        "DOMParser": "readonly",
        "fetch": "readonly",
        "Intl": "readonly",
        "location": "readonly",
        "require": "readonly",
        "URL": "readonly",
        "URLSearchParams": "readonly"
      },
      "sourceType": "commonjs"
    },
    "linterOptions": {
      "reportUnusedDisableDirectives": true
    },
    "rules": {
      "array-element-newline": [ "error", { "ArrayExpression": "always", "ArrayPattern": "never" } ],
      "indent": [ "error", 2 ],
      "init-declarations": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-params": "off",
      "max-statements": "off",
      "multiline-comment-style": [ "error", "separate-lines" ],
      "multiline-ternary": [ "error", "always-multiline" ],
      "new-cap": [ "error", { "capIsNew": false } ],
      "no-confusing-arrow": [ "error", { "allowParens": true } ],
      "no-extra-parens": [ "error", "functions" ],
      "no-magic-numbers": "off",
      "no-plusplus": "off",
      "no-ternary": "off",
      "object-curly-newline": [ "error", { "ObjectExpression": { "consistent": true }, "ObjectPattern": { "consistent": true }, "ImportDeclaration": "never", "ExportDeclaration": "never" } ],
      "one-var": [ "error", "never" ],
      "padded-blocks": [ "error", "never" ],
      "prefer-named-capture-group": "off",
      "sort-keys": "off",

      "unicorn/no-array-callback-reference": "off",
      "unicorn/no-null": "off",
      "unicorn/no-unreadable-array-destructuring": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prefer-query-selector": "off",
      "unicorn/prefer-string-raw": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/prevent-abbreviations": "off"
    }
  },
  {
    "files": [
      "**/*.jsx"
    ],
    "languageOptions": {
      "parserOptions": {
        "ecmaFeatures": {
          "jsx": true
        }
      }
    }
  },
  {
    "files": [
      "**/*.mjs"
    ],
    "languageOptions": {
      "sourceType": "module"
    }
  }
];
