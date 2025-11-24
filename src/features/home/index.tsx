import React, { useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';

interface HomeProps {
  navigation?: any;
}

const Home: React.FC<HomeProps> = ({ navigation }) => {
  useEffect(() => {
    // Log model path on mount (for manual model placement)
    const logPath = async () => {
      try {
        const { logModelPath } = await import('../../utils/getModelPath');
        await logModelPath();
      } catch (error) {
        // Ignore if utility not available
      }
    };
    logPath();
  }, []);

  const handleChatPress = () => {
    navigation?.navigate('Chat');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Finance Tracker</Text>
        <Text style={styles.subtitle}>Manage your finances with AI assistance</Text>
        
        <TouchableOpacity style={styles.chatButton} onPress={handleChatPress}>
          <Text style={styles.chatButtonIcon}>💬</Text>
          <Text style={styles.chatButtonText}>Chat with AI Assistant</Text>
          <Text style={styles.chatButtonSubtext}>Powered by Gemma 3B</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  chatButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatButtonIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  chatButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  chatButtonSubtext: {
    fontSize: 12,
    color: '#E0E0E0',
  },
});

export default Home;
