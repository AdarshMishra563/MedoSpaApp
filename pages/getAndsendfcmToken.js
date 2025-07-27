import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

export const getAndSendFcmToken = async (jwtToken) => {
  const fcmToken = await messaging().getToken();
  console.log('FCM Token:', fcmToken);

  await axios.post(
    'https://medospabackend.onrender.com/api/save-token',
    { fcmToken },
    {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
  );
};
