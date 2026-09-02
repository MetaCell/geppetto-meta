import globals from "globals";
import eslintjs from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const sharedGlobals = {
  ...globals.browser,
  ...globals.commonjs,
  ...globals.node,
  ...globals.jest,
};

const sharedRules = {
  "no-tabs": 2,
  "no-empty": 0,
  "no-console": 0,
  curly: 2,
  "no-global-assign": 0,
  "no-constant-condition": 0,
  "no-control-regex": 0,
  "no-redeclare": 0,
  "no-inner-declarations": 0,

  indent: [
    "error",
    2,
    {
      ObjectExpression: "first",
      ArrayExpression: "first",
    },
  ],

  "arrow-spacing": 2,
  "no-unused-vars": 0,
  "keyword-spacing": 2,
  "no-useless-escape": 0,
  "brace-style": 2,
  "multiline-comment-style": [2, "starred-block"],

  "object-curly-newline": [2, { multiline: true }],

  "operator-linebreak": [2, "before"],
  "space-infix-ops": 2,
  "no-multi-spaces": 2,
  "no-unneeded-ternary": 2,
  "no-multiple-empty-lines": 2,
  "spaced-comment": [2, "always"],
  "arrow-parens": [2, "as-needed"],
  "arrow-body-style": [2, "as-needed"],
  "object-curly-spacing": [2, "always"],
  "template-curly-spacing": [2, "never"],
  "space-before-function-paren": [1, "always"],
};

const tsConfig = {
  files: ["**/*.ts", "**/*.tsx"],
  languageOptions: {
    globals: sharedGlobals,
    ecmaVersion: 2023,
    sourceType: "module",
    parser: tseslint.parser,
  },
  plugins: {
    "@typescript-eslint": tseslint.plugin,
    "react-hooks": reactHooks,
  },
  rules: {
    ...sharedRules,
    "no-redeclare": 0,
    "no-undef": 0,
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
};

export default [
  {
    ignores: ["**/*min.js", "dist/*", ".yalc/*", "node_modules/*"],
  },
  eslintjs.configs.recommended,
  tsConfig,
  /*
   * Must come last: eslint-config-prettier (bundled inside prettierRecommended)
   * disables all ESLint formatting rules that would conflict with Prettier, then
   * eslint-plugin-prettier re-reports Prettier violations as ESLint errors so a
   * single `yarn lint` catches both style and logic issues.
   */
  prettierRecommended,
];
