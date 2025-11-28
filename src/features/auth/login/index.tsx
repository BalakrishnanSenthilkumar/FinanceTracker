import { Button, Text, View } from 'react-native';
import { SafeAreaView, TextInput } from '../../../shared/components';
import { loadLlamaModelInfo } from 'llama.rn';
import { useEffect } from 'react';

const Login = ({ navigation }: any) => {
  const modelPath = 'models/qwen2-0_5b-instruct-q5_k_m.gguf';
  // console.log('Model Info:', await loadLlamaModelInfo(modelPath))
  const modelInfo = async () => {
    const modelInfo = await loadLlamaModelInfo(modelPath);
    console.log('Model Info:', modelInfo);
  };

  useEffect(() => {
    try {
      modelInfo();
    } catch (error) {
      console.log('Error:', error);
    }
  }, []);
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <Text>Welcome To Finance Tracker</Text>
      <TextInput
        placeholder="Email"
        containerStyle={{ width: '100%', alignItems: 'center' }}
        style={{
          width: '80%',
          // height: 40,
          borderWidth: 1,
          borderColor: 'lightgray',
          borderRadius: 5,
          paddingHorizontal: 10,
        }}
      />
      <Button title="Home" onPress={() => navigation.navigate('HomeTab')} />
      <Button
        title="Register"
        onPress={() => navigation.navigate('Register')}
      />
    </SafeAreaView>
  );
};

export default Login;
