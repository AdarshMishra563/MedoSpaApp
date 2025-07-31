import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'https://medospabackend.onrender.com/api';

const BookingItem = ({ booking, onAccept, onCancel, onDateChange, isEditable }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(new Date(booking.appointmentDate));

  const isNewAndUrgent = booking.status === 'active' && (Date.now() - new Date(booking.createdAt)) / 3600000 < 2;

  const handleDateChange = (_, selectedDate) => {
    const currentDate = selectedDate || appointmentDate;
    setShowDatePicker(false);
    setAppointmentDate(currentDate);
    onDateChange(currentDate);
  };

  const handleTimeChange = (_, selectedTime) => {
    const newDate = new Date(appointmentDate);
    newDate.setHours(selectedTime.getHours());
    newDate.setMinutes(selectedTime.getMinutes());
    setShowTimePicker(false);
    setAppointmentDate(newDate);
    onDateChange(newDate);
  };

  const openGoogleMaps = () => {
    if (booking?.location?.address) {
      const query = encodeURIComponent(booking.location.address);
      const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
      Linking.openURL(url);
    }
  };

  return (
    <View style={[styles.bookingItem, isNewAndUrgent && styles.urgentBorder]}>
      <Text style={styles.header}>{booking.status === 'active' ? 'New Booking' : booking.status}</Text>
      
      <Text>Name: {booking.name}</Text>
      <Text>Phone: {booking.phoneNumber}</Text>
      
      <Text>Service For: {booking.serviceFor}</Text>

      {booking.service?.name && <Text>Service: {booking.service.name}</Text>}

      <Text>Appointment: {appointmentDate.toLocaleString()}</Text>
      <Text>Service At: {booking.serviceType}</Text>

      {booking.location?.address && (
        <Text>Address: {booking.location.address}</Text>
      )}

      {booking.serviceType === 'home' && booking.location?.address && (
        <TouchableOpacity onPress={openGoogleMaps}>
          <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>See Address</Text>
        </TouchableOpacity>
      )}

      {booking.landmark && <Text>Landmark: {booking.landmark}</Text>}
      {booking.buildingInfo && <Text>Building Info: {booking.buildingInfo}</Text>}

      {isEditable && (
        <>
          <View style={styles.dateControls}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}><Text>Change Date</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTimePicker(true)}><Text>Change Time</Text></TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={appointmentDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              mode="time"
              value={appointmentDate}
              display="default"
              onChange={handleTimeChange}
            />
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={onAccept}><Text style={styles.accept}>Accept</Text></TouchableOpacity>
            <TouchableOpacity onPress={onCancel}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const BookingsList = ({ statusFilter }) => {
  const [bookings, setBookings] = useState([]);
  const token = useSelector(state => state.user.userToken);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer=setInterval(()=>{fetchBookings();},20000);
    return ()=>clearInterval(timer)
  }, [statusFilter]);

  const notifyUser = async (booking, status, appointmentDate) => {
    try {
      const title = status === 'confirmed' ? 'Booking Confirmed' : " Booking Cancelled";
      const message = status==='confirmed'?`Your appointment is scheduled for ${new Date(appointmentDate).toLocaleString()}`:"Booking cancelled due to some reasons";
      await axios.post(`${API_URL}/createNotification`, {
        userId: booking.user,
        message,
        appointmentDate,
        title,
      });
    } catch (e) {
      console.warn('Notification failed', e);
    }
  };

  const handleUpdate = async (id, status, date = null) => {
    try {
      const booking = bookings.find(b => b._id === id);
      const updatedDate = date || booking.appointmentDate;
      const body = {
        userId: booking.userId,
        message: booking.message,
        appointmentDate: updatedDate,
        title: booking.title,
        status,
      };
      if (status === 'confirmed' || status === 'cancelled') {
        delete body.message;
        delete body.title;
      }
      await axios.put(`${API_URL}/admin/bookings/${id}`, body, { headers: { Authorization: `Bearer ${token}` } });
      await notifyUser(booking, status, updatedDate);
      Alert.alert(`Booking ${status}`);
      fetchBookings();
    } catch (e) {
      Alert.alert('Error updating booking');
    }
  };

  const now = new Date();
  const filtered = bookings.filter(b => {
    const appt = new Date(b.appointmentDate);
    const diffHours = (now - appt) / 3600000;
    const isPastAppt = (now - appt) > 10 * 60000;

    switch (statusFilter) {
      case 'active': return b.status === 'active';
      case 'confirmed': return b.status === 'confirmed';
      case 'cancelled': return b.status === 'cancelled' && diffHours < 12;
      case 'completed': return b.status !== 'cancelled' && isPastAppt;
      default: return false;
    }
  });

  return (
    <FlatList
      data={filtered}
      keyExtractor={item => item._id}
      renderItem={({ item }) => (
        <BookingItem
          booking={item}
          isEditable={statusFilter === 'active'}
          onDateChange={date => handleUpdate(item._id, item.status, date)}
          onAccept={() => handleUpdate(item._id, 'confirmed')}
          onCancel={() => handleUpdate(item._id, 'cancelled')}
        />
      )}
    />
  );
};

const AdminBookingsScreen = () => {
  const [activeTab, setActiveTab] = useState('active');
  const tabs = [
    { label: 'New Bookings', value: 'active' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Ongoing', value: 'completed' },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tabButton, activeTab === tab.value && styles.activeTab]}
            onPress={() => setActiveTab(tab.value)}
          >
            <Text style={activeTab === tab.value ? styles.activeTabText : styles.tabText}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <BookingsList statusFilter={activeTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bookingItem: {
    padding: 12,
    margin: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    backgroundColor: '#fff'
  },
  urgentBorder: {
    borderColor: 'red',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4
  },
  dateControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10
  },
  accept: {
    color: 'green'
  },
  cancel: {
    color: 'red'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff'
  },
  tabText: {
    color: '#333'
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: 'bold'
  }
});

export default AdminBookingsScreen;
