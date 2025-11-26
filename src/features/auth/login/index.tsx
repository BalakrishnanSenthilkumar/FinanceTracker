import { Button, Text, View } from 'react-native';
import { loadLlamaModelInfo } from 'llama.rn';
import { useEffect } from 'react';
// import model from '../../../core/assets/models/qwen2-0_5b-instruct-q5_k_m.gguf'

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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Login</Text>
      <Button title="Home" onPress={() => navigation.navigate('HomeTab')} />
      <Button
        title="Register"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
};

export default Login;
