import Home from '../../../features/home';
import Profile from '../../../features/profile';
import History from '../../../features/history';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const TabStack = createBottomTabNavigator();

const HomeTabStack = () => {
  return (
    <TabStack.Navigator screenOptions={{ headerShown: false }}>
      <TabStack.Screen name="Home" component={Home} />
      <TabStack.Screen name="Profile" component={Profile} />
      <TabStack.Screen name="History" component={History} />
    </TabStack.Navigator>
  );
};
export default HomeTabStack;
