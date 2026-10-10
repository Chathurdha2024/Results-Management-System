import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../screens/LoginScreen';
import { authApi } from '../api';
import { toast } from '../toast';

// Mock only authApi.login (the network call). The real apiErrorMessage from
// ../api is kept so the screen's error handling is tested as it really works.
jest.mock('../api', () => {
  const actual = jest.requireActual('../api');
  return { ...actual, authApi: { login: jest.fn() } };
});

jest.mock('../toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// RNTL v13+: render is async (React 19 concurrent rendering)
const renderScreen = async () => {
  const navigation = { replace: jest.fn() };
  const utils = await render(<LoginScreen navigation={navigation} />);
  return { navigation, ...utils };
};

// RNTL v13+: fireEvent must be awaited under React 19 concurrent rendering
const fillCredentials = async (getByPlaceholderText, regNo, password) => {
  await fireEvent.changeText(getByPlaceholderText('EG/XXXX/XXXX'), regNo);
  await fireEvent.changeText(getByPlaceholderText('••••••••'), password);
};

describe('LoginScreen (component tests)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('M-C01: renders title, subtitle, both inputs and the sign-in button', async () => {
    const { getByText, getByPlaceholderText } = await renderScreen();

    expect(getByText('Ruhuna EngRMS')).toBeTruthy();
    expect(getByText('Student Portal')).toBeTruthy();
    expect(getByPlaceholderText('EG/XXXX/XXXX')).toBeTruthy();
    expect(getByPlaceholderText('••••••••')).toBeTruthy();
    expect(getByText('Sign in securely')).toBeTruthy();
  });

  it('M-C02: sign-in button is disabled while fields are empty and does not call the API', async () => {
    const { getByText } = await renderScreen();

    await fireEvent.press(getByText('Sign in securely'));
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('M-C03: successful login stores the token and navigates to Dashboard', async () => {
    authApi.login.mockResolvedValue({ data: { token: 'tok123', isFirstLogin: false } });

    const { getByPlaceholderText, getByText, navigation } = await renderScreen();
    await fillCredentials(getByPlaceholderText, 'EG/2020/123', 'secret1');
    await fireEvent.press(getByText('Sign in securely'));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('Dashboard'));
    expect(authApi.login).toHaveBeenCalledWith('EG/2020/123', 'secret1');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('studentToken', 'tok123');
    expect(toast.success).toHaveBeenCalledWith('Logged in securely as Student');
  });

  it('M-C04: first-time login navigates to ChangePassword instead', async () => {
    authApi.login.mockResolvedValue({ data: { token: 'tok456', isFirstLogin: true } });

    const { getByPlaceholderText, getByText, navigation } = await renderScreen();
    await fillCredentials(getByPlaceholderText, 'EG/2020/999', 'secret1');
    await fireEvent.press(getByText('Sign in securely'));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith('ChangePassword'));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('studentToken', 'tok456');
  });

  it('M-C05: wrong credentials show the backend error and do not navigate', async () => {
    authApi.login.mockRejectedValue({
      response: { data: { error: 'Invalid registration number or password' } },
    });

    const { getByPlaceholderText, getByText, navigation } = await renderScreen();
    await fillCredentials(getByPlaceholderText, 'EG/2020/000', 'wrongpass');
    await fireEvent.press(getByText('Sign in securely'));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Invalid registration number or password')
    );
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('M-C06: unreachable backend shows the "cannot reach server" message, not "invalid credentials"', async () => {
    authApi.login.mockRejectedValue(new Error('Network Error'));

    const { getByPlaceholderText, getByText } = await renderScreen();
    await fillCredentials(getByPlaceholderText, 'EG/2020/123', 'secret1');
    await fireEvent.press(getByText('Sign in securely'));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.error.mock.calls[0][0]).toContain('Cannot reach the server');
  });
});
