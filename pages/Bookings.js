import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const BookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const token = useSelector(state => state.user.userToken);

  const fetchBookings = async () => {
    try {
      if (!token) return;
      
      setLoading(true);
      const response = await fetch('https://medospabackend.onrender.com/data/book', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setBookings(data.bookings.filter(booking => booking.status === 'active'));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setProcessing(true);
      const response = await fetch(`https://medospabackend.onrender.com/data/book/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) throw new Error('Failed to cancel booking');
      
     
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      setProcessing(true);
      const response = await fetch(`https://medospabackend.onrender.com/data/book/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete booking');
      
     
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      Alert.alert('Error', 'Failed to delete booking');
    } finally {
      setProcessing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchBookings();
      return () => {};
    }, [token])
  );
 const getServiceTypeIcon = (serviceType, serviceFor) => {
    if (serviceType === 'home') return 'home';
    if (serviceType === 'onCall') return 'phone';
    if (serviceFor?.toLowerCase().includes('clinic')) return 'hospital-building';
    return 'medical-bag'; 
  };
  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={[styles.statusBar, { backgroundColor: item.status === 'active' ? '#4CAF50' : '#F44336' }]} />
      
      <View style={styles.bookingContent}>
        <View style={styles.headerRow}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceFor}>Booking for: {item.serviceFor}</Text>
            <View style={styles.dateRow}>
              <Icon name="calendar" size={16} color="#555" />
              <Text style={styles.dateText}>
                {new Date(item.appointmentDate).toLocaleDateString()} at {' '}
                {new Date(item.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </View>
            <View style={styles.dateRow}>
              <Icon name="clock-outline" size={16} color="#555" />
              <Text style={styles.dateText}>
                Booked at: {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
          </View>
          
          <Menu>
            <MenuTrigger>
              <Icon name="dots-vertical" size={24} color="#555" />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={() => setSelectedBooking(item)}>
                <Text style={styles.menuText}>Edit</Text>
              </MenuOption>
              <MenuOption onSelect={() => handleCancelBooking(item._id)}>
                <Text style={styles.menuText}>Cancel</Text>
              </MenuOption>
              <MenuOption onSelect={() => handleDeleteBooking(item._id)}>
                <Text style={[styles.menuText, { color: 'red' }]}>Delete</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>

        <View style={styles.userRow}>
         <View style={{flexDirection:"row"}}> {item.picture ? (
            <Image source={{ uri: item.picture }} style={styles.userImage} />
          ) : (
            <Icon name="account-circle" size={40} color="#555" />
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
          </View></View>
          
          
          <View style={styles.serviceTypeIcon}>
            <Icon 
              name={getServiceTypeIcon(item.serviceType, item.serviceFor)} 
              size={24} 
              color="#555" 
            />
          </View>
        </View>
      </View>
      
      {processing && selectedBooking?._id === item._id && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Your Bookings</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f1011ff" />
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="calendar-remove" size={50} color="#888" />
              <Text style={styles.emptyText}>No active bookings found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333',
    textAlign: 'center',
  },
  bookingCard: {
    backgroundColor: '#e1dfdfff',
    borderRadius: 10,
    marginBottom: 16,
    width: '98%',
    alignSelf: 'center',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusBar: {
    height: 0,
    width: '100%',
  },
  bookingContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceFor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#555',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent:"space-between"
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  phoneNumber: {
    fontSize: 14,
    color: '#666',
  },
  menuText: {
    padding: 10,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BookingsScreen;