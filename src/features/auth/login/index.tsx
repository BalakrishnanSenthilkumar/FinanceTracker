import { useState } from 'react';
import {
  Button,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, TextInput } from '../../../shared/components';
import { loginUser } from '../../../shared/db/usersDB';

const Login = ({ navigation, route }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(
    null,
  );

  // Show success message if coming from registration
  const showSuccess = route?.params?.registered;

  // Validation
  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) return 'Please enter a valid email';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password is required';
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await loginUser({ email: email.trim(), password });

      if (result.success) {
        setAttemptsRemaining(null);
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeTab' }],
        });
      } else {
        setErrors({ general: result.error });
        // Show remaining attempts warning
        if (result.attemptsRemaining !== undefined) {
          setAttemptsRemaining(result.attemptsRemaining);
        } else {
          setAttemptsRemaining(null);
        }
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Text style={styles.title}>Welcome To Finance Tracker</Text>

      {showSuccess && (
        <Text style={styles.successText}>Account created! Please sign in.</Text>
      )}

      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

      {attemptsRemaining !== null &&
        attemptsRemaining > 0 &&
        attemptsRemaining < 4 && (
          <Text style={styles.warningText}>
            {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''}{' '}
            remaining
          </Text>
        )}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
        containerStyle={{ width: '100%' }}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        error={errors.password}
        containerStyle={{ width: '100%' }}
        style={styles.input}
      />

      {isLoading ? (
        <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Login" onPress={handleLogin} />
        </View>
      )}

      <Button
        title="Register"
        onPress={() => navigation.navigate('Register')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '100%',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
  warningText: {
    color: '#FF9800',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 12,
  },
});

export default Login;
