import Home from '../../../features/home';
import Profile from '../../../features/profile';
import History from '../../../features/history';
import Chat from '../../../features/chat';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const TabStack = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeTabStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeTabs" component={TabNavigator} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <TabStack.Navigator screenOptions={{ headerShown: false }}>
      <TabStack.Screen name="Home" component={Home} />
      <TabStack.Screen name="Profile" component={Profile} />
      <TabStack.Screen name="History" component={History} />
    </TabStack.Navigator>
  );
};

export default HomeTabStack;
