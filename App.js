import React, { useEffect, useState } from 'react';
import { Alert, View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const SERVER_URL = 'http://192.168.1.218:4000';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        console.log('Push token:', token);
      }
    });
  }, []);

  const handleSendPush = async () => {
    if (!expoPushToken || !userName) {
      Alert.alert('Missing info');
      return;
    }

    // First: Register this device's name + token with server
    try {
      await fetch(`${SERVER_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName, token: expoPushToken }),
      });
      console.log(`✅ Registered ${userName}`);
    } catch (err) {
      console.error('❌ Failed to register user:', err);
      Alert.alert('Failed to register with server');
      return;
    }

    // Then: Send to the other user
    const toName = userName === 'userA' ? 'userB' : 'userA';
    try {
      const response = await fetch(`${SERVER_URL}/send-to-name`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toName,
          title: 'Attention',
          body: 'Hey! I love and Miss You.',
        }),
      });

      const data = await response.json();
      console.log('📨 Notification response:', data);
      Alert.alert('HEY', 'Give Me Attention, please. I Love You!');
    } catch (err) {
      console.error('❌ Error sending push:', err);
      Alert.alert('Failed to send notification');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter Your Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Here plz"
        value={userName}
        onChangeText={setUserName}
        placeholderTextColor="#666"
      />

      <Pressable
        style={[styles.button, { opacity: userName ? 1 : 0.5 }]}
        onPress={handleSendPush}
        disabled={!userName}
      >
        <Text style={styles.buttonText}>Press for Attention</Text>
      </Pressable>
    </View>
  );
}

async function registerForPushNotificationsAsync() {
  try {
    if (!Device.isDevice) {
      Alert.alert('Push notifications only work on physical devices.');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission not granted for notifications.');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (err) {
    console.error('Error getting push token:', err);
    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ee3cc7ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#000000ff',
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    padding: 10,
    borderColor: '#007AFF',
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
    color: '#007AFF',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ffda03',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#333',
  },
  buttonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
