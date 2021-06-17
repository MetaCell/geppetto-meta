module.exports = {
  verbose: true,
  testRegex: "(__test__/Test.*|(\\.|/)(test|spec))\\.[jt]sx?$",
  moduleNameMapper: { 
    "^@metacell/geppetto-meta-client(.*)$": "<rootDir>/geppetto-client/js$1",
    "^@metacell/geppetto-meta-core(.*)$": "<rootDir>/geppetto-core/src$1",
    "^@metacell/geppetto-meta-ui(.*)$": "<rootDir>/geppetto-ui/src$1" 
  },
  transform: { "^.+\\.(js|jsx|ts|tsx)?$": "babel-jest" },
  transformIgnorePatterns: [
    "node_modules/(?!(@metacell|bezier-js|three)/)",
  ],
  modulePathIgnorePatterns: ["utilities"]
};