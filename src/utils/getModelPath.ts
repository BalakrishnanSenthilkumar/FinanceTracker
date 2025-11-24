// Utility to get the model path for manual model placement
// Run this in your app to find where to place the model file

import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

/**
 * Get the path where the model should be stored
 * Use this to know where to place manually downloaded models
 */
export const getModelStoragePath = (): string => {
  const downloadDir =
    Platform.OS === 'ios'
      ? RNFS.DocumentDirectoryPath
      : RNFS.DocumentDirectoryPath;
  return `${downloadDir}/gemma-3n-E4B-it-int4.task`;
};

/**
 * Log the model path to console
 * Call this function to see where to place your model
 */
export const logModelPath = async (): Promise<void> => {
  const path = getModelStoragePath();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📁 Model Storage Path');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Platform: ${Platform.OS}`);
  console.log(`Documents Directory: ${RNFS.DocumentDirectoryPath}`);
  console.log(`Model Path: ${path}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 To use manual model:');
  console.log(`   1. Download: gemma-3n-E4B-it-int4.task`);
  console.log(`   2. Place at: ${path}`);
  console.log(`   3. Restart app`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Check if model already exists
  try {
    const exists = await RNFS.exists(path);
    if (exists) {
      const stat = await RNFS.stat(path);
      console.log(`✅ Model found! Size: ${(stat.size / 1024 / 1024 / 1024).toFixed(2)} GB`);
    } else {
      console.log('❌ Model not found. Place model file at the path above.');
    }
  } catch (error) {
    console.log('⚠️  Could not check if model exists');
  }
};


