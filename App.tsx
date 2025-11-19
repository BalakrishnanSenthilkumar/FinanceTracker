import { View, Text } from 'react-native';
import React from 'react';

const App = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'black' }}>
        Hello World
      </Text>
    </View>
  );
};

export default App;
