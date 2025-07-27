import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

const NotificationScreen = () => {
  const token = useSelector(state => state?.user?.userToken);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'https://medospabackend.onrender.com/api'; 

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/getAllNotification`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationsAsSeen = async () => {
    try {
      const unseenIds = notifications.filter(n => !n.seen).map(n => n._id);
      if (unseenIds.length > 0) {
        await axios.patch(
          `${API_BASE}/mark-seen`,
          { ids: unseenIds },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (err) {
      console.error('Mark as seen error:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const allIds = notifications.map(n => n._id);
      if (allIds.length === 0) return;
      await axios.delete(`${API_BASE}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids: allIds },
      });
      setNotifications([]);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      markNotificationsAsSeen();
    }
  }, [notifications]);

  const getMinutesDiff = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    return Math.floor((now - past) / (1000 * 60));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderItem = ({ item }) => {
    const isNew =
      !item.seen || (item.seenAt && getMinutesDiff(item.seenAt) < 2);

    return (
      <View style={styles.item}>
        {isNew && <View style={styles.dot} />}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.message}</Text>
          <Text style={styles.time}>
            Meeting at: {formatDate(item.appointmentDate)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (<SafeAreaView style={{flex:1}}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Notifications</Text>
        <TouchableOpacity onPress={clearAllNotifications}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>
      {notifications.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          renderItem={renderItem}
        />
      )}
    </View></SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: { fontSize: 20, fontWeight: 'bold' },
  clearText: { color: 'red' },
  item: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginRight: 10,
  },
  textContainer: { flex: 1 },
  title: { fontWeight: 'bold', fontSize: 16 },
  time: { fontSize: 12, color: '#555' },
});
