// gemma
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../../../features/auth/login';
import Registration from '../../../features/auth/registration';
import HomeTabStack from '../homeTab';
import { NavigationContainer } from '@react-navigation/native';

const AppStack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Login" component={Login} />
      <AppStack.Screen name="Register" component={Registration} />
      <AppStack.Screen name="HomeTab" component={HomeTabStack} />
    </AppStack.Navigator>
  );
};

export default AuthStack;
