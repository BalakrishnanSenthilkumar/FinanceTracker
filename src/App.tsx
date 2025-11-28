import React from 'react';
import { StatusBar } from 'react-native';
import AuthStack from './shared/navigation/screens';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { setupDependencies } from './shared/di/setup';

// Initialize dependency injection container
setupDependencies();

const App = () => {
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

export default App;
