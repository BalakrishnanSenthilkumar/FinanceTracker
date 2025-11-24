const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: [
      ...getDefaultConfig(__dirname).resolver.assetExts,
      'tflite', // Add TFLite model files as assets
      'bin', // Add binary files
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
