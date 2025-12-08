import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import AuthStack from './shared/navigation/screens';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setupDependencies } from './shared/di/setup';
import { initializeDatabase } from './shared/db/database';

// Initialize dependency injection container
setupDependencies();

const App = () => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        await initializeDatabase();
        setIsDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setDbError(
          'Failed to initialize secure storage. Please restart the app.',
        );
      }
    };

    initDb();
  }, []);

  // Show loading while database initializes
  if (!isDbReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          {dbError ? (
            <Text style={styles.errorText}>{dbError}</Text>
          ) : (
            <>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>
                Initializing secure storage...
              </Text>
            </>
          )}
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default App;
