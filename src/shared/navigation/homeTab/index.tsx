import React, { useState } from 'react';
import Home from '../../../features/home';
import History from '../../../features/history';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddTransactionModal from '../../../features/home/components/AddTransactionModal';
import { scale, verticalScale, moderateScale } from '../../utils/scaling';
import { HomeIcon, HistoryIcon } from '../../components/icons';

const TabStack = createBottomTabNavigator();

const HomeTabStack = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TabStack.Navigator
        screenOptions={{
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: moderateScale(12),
          },
        }}
        tabBar={props => (
          <CustomTabBar {...props} onAddPress={() => setModalVisible(true)} />
        )}
      >
        <TabStack.Screen
          name="Home"
          component={Home}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: ({ focused }) => (
              <HomeIcon
                size={moderateScale(24)}
                color={focused ? '#007AFF' : '#999'}
              />
            ),
          }}
        />
        <TabStack.Screen
          name="Add"
          component={View}
          options={{
            tabBarLabel: '',
            tabBarButton: () => null,
          }}
        />
        <TabStack.Screen
          name="History"
          component={History}
          options={{
            tabBarLabel: 'History',
            tabBarIcon: ({ focused }) => (
              <HistoryIcon
                size={moderateScale(24)}
                color={focused ? '#007AFF' : '#999'}
              />
            ),
          }}
        />
      </TabStack.Navigator>
      <AddTransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const CustomTabBar = ({ state, descriptors, navigation, onAddPress }: any) => {
  const { bottom } = useSafeAreaInsets();
  const bottomPadding = Math.max(bottom, verticalScale(8));

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: bottomPadding,
          height: verticalScale(60) + bottomPadding - verticalScale(8), // Adjust height to include safe area bottom
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        if (route.name === 'Add') {
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.addButton}
              onPress={onAddPress}
            >
              <View style={styles.addButtonInner}>
                <Text style={styles.addButtonText}>+</Text>
              </View>
            </TouchableOpacity>
          );
        }

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
          >
            {options.tabBarIcon && options.tabBarIcon({ focused: isFocused })}
            <Text
              style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: verticalScale(8),
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: moderateScale(12),
    color: '#999',
  },
  tabLabelFocused: {
    color: '#007AFF',
    fontWeight: '600',
  },
  addButton: {
    width: scale(60),
    height: verticalScale(60),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(-30),
  },
  addButtonInner: {
    width: scale(56),
    height: verticalScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(3.84),
  },
  addButtonText: {
    fontSize: moderateScale(32),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default HomeTabStack;
