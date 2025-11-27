import React from 'react';
import AuthStack from './shared/navigation/screens';
import { NavigationContainer } from '@react-navigation/native';
import { setupDependencies } from './shared/di/setup';

// Initialize dependency injection container
setupDependencies();

const App = () => {
  return (
    <NavigationContainer>
      <AuthStack />
    </NavigationContainer>
  );
};

export default App;
