import Home from '../../../features/home';
import Profile from '../../../features/profile';
import History from '../../../features/history';
import AIChatScreen from '../../../features/ai-assistant';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const TabStack = createBottomTabNavigator();

const HomeTabStack = () => {
  return (
    <TabStack.Navigator screenOptions={{ headerShown: false }}>
      <TabStack.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => null,
        }}
      />
      <TabStack.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{
          tabBarLabel: 'AI Chat',
          tabBarIcon: () => null,
        }}
      />
      <TabStack.Screen
        name="History"
        component={History}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: () => null,
        }}
      />
      <TabStack.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => null,
        }}
      />
    </TabStack.Navigator>
  );
};
export default HomeTabStack;
