import globals from 'globals'
import eslinjs from '@eslint/js'
import babelParser from '@babel/eslint-parser'
import json from 'eslint-plugin-json'


const languageOptions = {
  globals: {
    ...globals.browser,
    ...globals.commonjs,
    ...globals.node,
    ...globals.jquery,
    ...globals.amd,
    ...globals.mocha,
    ...globals.jasmine,
    ...globals.phantomjs,
    ...globals.worker,
    ...globals.jest,
  },
  ecmaVersion: 2023,
  sourceType: 'module',
}

const jsConfig = {
  languageOptions: {
    ...languageOptions,
    globals: {
      ...languageOptions.globals,
      G: true,
      root: true,
      casper: true,
      message: true,
      endpoint: true,
      GEPPETTO: true,
      "gepetto-client": true,
      Project: true,
      Instances: true,
      IPython: true,
      GEPPETTO_CONFIGURATION: true,
      MozWebSocket: true,
      panelComponent: true,
      Detector: true,
      THREE: true,
      VARS: true,
      Stats: true,
      geometry: true,
      aabbMin: true,
      aabbMax: true,
      bb: true,
      ClipboardModal: true,
      Store: true,
      olark: true,
      google: true,
      path: true,
      CodeMirror: true,
      Connectivity: true,
      π: true,
      τ: true,
      halfπ: true,
      dr: true,
      Model: true,
      Plot1: true,
      PIXI: true,
      stackViewerRequest: true,
      _: true,
      labelsInTV: true,
      Backbone: true,
      registeredEvents: true,
      Handlebars: true,
      ActiveXObject: true,
      jstestdriver: true,
      TestCase: true,
      EMBEDDED: true,
      EMBEDDERURL: true,
      handleRequest: true,
      _gaq: true,
      Canvas1: true,
      clientX: true,
      clientY: true,
    },
    parser: babelParser,
  },
  rules: {
    "no-tabs": 2,
    "no-empty": 0,
    "no-console": 0,
    curly: 2,
    "no-global-assign": 0,
    "no-constant-condition": 0,
    "no-control-regex": 0,
    "no-redeclare": 0,
    "no-inner-declarations": 0,

    indent: ["error", 2, {
      ObjectExpression: "first",
      ArrayExpression: "first",
    }],

    "arrow-spacing": 2,
    "no-unused-vars": 0,
    "keyword-spacing": 2,
    "no-useless-escape": 0,
    "brace-style": 2,
    "multiline-comment-style": [2, "starred-block"],

    "object-curly-newline": [2, { multiline: true, }],

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
  },
}

const jsonConfig = {
  files: ['**/*/json'],
  ...json.configs.recommended
}

export default [
  {
    ignores: ["**/*min.js",
              "geppetto-ui/node_modules/*",
              "geppetto-core/node_modules/*",
              "geppetto-client/node_modules/*"],
  },
  eslinjs.configs.recommended,
  jsConfig,
  jsonConfig
]