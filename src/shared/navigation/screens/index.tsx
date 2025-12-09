import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import Login from '../../../features/auth/login';
import Registration from '../../../features/auth/registration';
import HomeTabStack from '../homeTab';
import Chat from '../../../features/chat';
import Profile from '../../../features/profile';
import { isAuthenticated, getCurrentUser } from '../../db/usersDB';

export type RootStackParamList = {
  Login: { registered?: boolean } | undefined;
  Register: undefined;
  HomeTab: undefined;
  Chat: undefined;
  Profile: undefined;
};

const AppStack = createNativeStackNavigator<RootStackParamList>();

const AuthStack = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('[AutoLogin] Checking authentication status...');

      // Check if user has valid session
      const authenticated = await isAuthenticated();

      if (authenticated) {
        // Verify user still exists in database
        const user = await getCurrentUser();

        if (user) {
          console.log('[AutoLogin] Valid session found for:', user.email);
          setIsLoggedIn(true);
        } else {
          console.log('[AutoLogin] Session invalid, user not found');
          setIsLoggedIn(false);
        }
      } else {
        console.log('[AutoLogin] No valid session found');
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('[AutoLogin] Error checking auth:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show splash screen while checking auth
  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.appName}>💰 Finance Tracker</Text>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        // User is logged in - show main app screens first
        <>
          <AppStack.Screen name="HomeTab" component={HomeTabStack} />
          <AppStack.Screen
            name="Chat"
            component={Chat}
            options={{ headerShown: true, title: 'Chat' }}
          />
          <AppStack.Screen
            name="Profile"
            component={Profile}
            options={{ headerShown: true, title: 'Profile' }}
          />
          <AppStack.Screen name="Login" component={Login} />
          <AppStack.Screen name="Register" component={Registration} />
        </>
      ) : (
        // User is not logged in - show auth screens first
        <>
          <AppStack.Screen name="Login" component={Login} />
          <AppStack.Screen name="Register" component={Registration} />
          {/* <AppStack.Screen name="HomeTab" component={HomeTabStack} />
          <AppStack.Screen
            name="Chat"
            component={Chat}
            options={{ headerShown: true, title: 'Chat' }}
          />
          <AppStack.Screen
            name="Profile"
            component={Profile}
            options={{ headerShown: true, title: 'Profile' }}
          /> */}
        </>
      )}
    </AppStack.Navigator>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 24,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default AuthStack;
