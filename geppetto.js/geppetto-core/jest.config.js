const sharedConfig = require("../jest.config.js");

module.exports = {
  ...sharedConfig,
  testEnvironment: "jsdom",
};
