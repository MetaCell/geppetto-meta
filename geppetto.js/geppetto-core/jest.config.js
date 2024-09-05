const sharedConfig = require("../jest.config.js");

module.exports = {
  ...sharedConfig,
  testEnvironment: "jsdom",
  transform: { "^.+\\.(js|jsx|ts|tsx)?$": ["babel-jest", { configFile: './babel.jest.config.js' }], }
};
