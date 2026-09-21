const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
// expo-sqlite's web worker loads wa-sqlite as a binary asset.
config.resolver.assetExts.push("wasm");

module.exports = config;
