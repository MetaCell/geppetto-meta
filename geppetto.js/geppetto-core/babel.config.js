module.exports = {
  "presets": [
    ["@babel/preset-env", { "modules": false }],
  ],
  "plugins": [
    "@babel/plugin-transform-regenerator",
    "@babel/plugin-proposal-class-properties",
  ],
}
