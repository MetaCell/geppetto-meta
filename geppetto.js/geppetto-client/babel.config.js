module.exports = {
  "presets": [
    ["@babel/preset-env", {
      "modules": false
    }],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],
  "plugins": [
    "@babel/plugin-transform-regenerator",
    "@babel/plugin-proposal-class-properties",
  ],
}
