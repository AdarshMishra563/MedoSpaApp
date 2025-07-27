import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useSelector } from 'react-redux';

const NotificationBell = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state?.user?.userToken);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'https://medospabackend.onrender.com/api/getAllNotification'; 

  const fetchUnreadCount = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const now = new Date();
      const unread = res.data.filter(n => {
        if (!n.seen) return true;
        if (n.seenAt) {
          const seenDate = new Date(n.seenAt);
          const diffMs = now - seenDate;
          const diffMinutes = diffMs / (1000 * 60);
          return diffMinutes < .01;
        }
        return false;
      });

      setCount(unread.length);
    } catch (err) {
      console.error('🔔 Error fetching unread count:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 20000);
    return () => clearInterval(interval);
  }, []);

  const goToNotifications = () => {
    setCount(0); 
    navigation.navigate('NotificationPage');
  };

  return (
    <TouchableOpacity onPress={goToNotifications} style={styles.container}>
      <Icon name="notifications-outline" size={24} color="gray" />
      {!loading && count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationBell;

const styles = StyleSheet.create({
  container: {
    padding: 0,top:2.9
  },
  badge: {
    position: 'absolute',
    right: -1,
    bottom:-0.4,
    backgroundColor: 'red',
    borderRadius: 7,
    paddingHorizontal: 2,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
