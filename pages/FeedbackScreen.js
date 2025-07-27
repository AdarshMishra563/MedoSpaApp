import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

const FeedbackScreen = () => {
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = useSelector(state => state.user.userToken);

  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      return showFeedback('error', 'Please enter a message.');
    }

    setLoading(true);
    try {
      await axios.post(
        'https://medospabackend.onrender.com/api/send-message-email',
        { message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showFeedback('success', '✅ Message sent successfully. You will receive an immediate response.');
      setMessage('');
    } catch (error) {
      console.error('Feedback send error:', error);
      showFeedback('error', '❌ Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Feedback</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Write your message here..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send</Text>
          )}
        </TouchableOpacity>

        {feedback && (
          <Text
            style={[
              styles.feedbackText,
              feedback.type === 'success'
                ? styles.successText
                : styles.errorText,
            ]}
          >
            {feedback.text}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

export default FeedbackScreen;

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: height * 0.25,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  feedbackText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  successText: {
    color: 'green',
  },
  errorText: {
    color: 'red',
  },
});
