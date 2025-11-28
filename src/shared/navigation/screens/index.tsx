import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../../../features/auth/login';
import Registration from '../../../features/auth/registration';
import HomeTabStack from '../homeTab';
import Chat from '../../../features/chat';
import Profile from '../../../features/profile';

const AppStack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Login" component={Login} />
      <AppStack.Screen name="Register" component={Registration} />
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
    </AppStack.Navigator>
  );
};

export default AuthStack;
