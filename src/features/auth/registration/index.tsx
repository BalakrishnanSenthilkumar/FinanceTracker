import { useState } from 'react';
import {
  Button,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView, TextInput } from '../../../shared/components';
import { registerUser } from '../../../shared/db/usersDB';

const Registration = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Validation functions
  const validateName = (value: string): string | undefined => {
    if (!value.trim()) return 'Name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) return 'Please enter a valid email';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value))
      return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain a number';
    return undefined;
  };

  const validateConfirmPassword = (value: string): string | undefined => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
    };
    setErrors(newErrors);
    return (
      !newErrors.name &&
      !newErrors.email &&
      !newErrors.password &&
      !newErrors.confirmPassword
    );
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const result = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.success) {
        navigation.navigate('Login', { registered: true });
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Registration</Text>

        {errors.general && (
          <Text style={styles.errorText}>{errors.general}</Text>
        )}

        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          error={errors.name}
          containerStyle={{ width: '100%' }}
          style={styles.input}
        />

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

        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          error={errors.confirmPassword}
          containerStyle={{ width: '100%' }}
          style={styles.input}
        />

        <Text style={styles.passwordHint}>
          Password must be at least 8 characters with uppercase, lowercase, and
          a number.
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.buttonContainer}>
            <Button title="Register" onPress={handleRegister} />
          </View>
        )}

        <Button
          title="Back to Login"
          onPress={() => navigation.navigate('Login')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
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
  passwordHint: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default Registration;
