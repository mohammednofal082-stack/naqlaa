module.exports = function (api) {
  api.cache(true);
  // Force the Expo Router babel transform in this monorepo.
  // babel-preset-expo only auto-enables it when `require.resolve('expo-router')`
  // works from the hoisted root, but expo-router lives under apps/mobile.
  const { expoRouterBabelPlugin } = require("babel-preset-expo/build/expo-router-plugin");
  return {
    presets: ["babel-preset-expo"],
    plugins: [expoRouterBabelPlugin],
  };
};
