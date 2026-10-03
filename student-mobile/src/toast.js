import { ToastAndroid, Platform, Alert } from 'react-native';

// Minimal toast stand-in for react-hot-toast used in the web portal.
const show = (message, isError) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert(isError ? 'Error' : 'Success', message);
  }
};

export const toast = {
  success: (message) => show(message, false),
  error: (message) => show(message, true),
};
