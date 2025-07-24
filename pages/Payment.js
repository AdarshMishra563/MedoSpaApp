import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';

const UpiPayment = () => {
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);

  const BUSINESS_UPI_ID = '6393137253@ybl'; 
  const RECEIVER_NAME = 'MedoSpa';

  const upiAppUrl = ({ upiId, name, amount, note }) => {
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
      name
    )}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  const handlePayment = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter amount');
      return;
    }

    const url = upiAppUrl({
      upiId: BUSINESS_UPI_ID,
      name: RECEIVER_NAME,
      amount,
      note: 'Payment for services',
    });

    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Error', 'No UPI app found. Please install one.');
      return;
    }

    setPaymentStatus('Pending...');

    Linking.openURL(url);
  };

  useEffect(() => {
    const handleUrl = (event) => {
      const response = event.url;

      const queryString = response.split('?')[1];
      const params = new URLSearchParams(queryString);
      const status = params.get('Status');

      if (status) {
        setPaymentStatus(status.toUpperCase());
      } else {
        setPaymentStatus('Unknown');
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Amount (INR)</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="100"
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Pay with UPI" onPress={handlePayment} />

      {paymentStatus && (
        <Text style={styles.status}>Payment Status: {paymentStatus}</Text>
      )}
    </View>
  );
};

export default UpiPayment;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  status: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'blue',
  },
});
