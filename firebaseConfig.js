import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const configureGoogle = () => {
  GoogleSignin.configure({
    webClientId: '323015390490-en5pnrvqe8kjr17kffkact7oq0p5jirv.apps.googleusercontent.com', // from Firebase Console
  });
};
