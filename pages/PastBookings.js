import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import ErrorPopup from './ErrorPopup';
import { SafeAreaView } from 'react-native-safe-area-context';

const PastBookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [errorpopup, setErrorPopup] = useState(null);
  const token = useSelector(state => state.user.userToken);

  const getServiceIcon = (serviceType) => {
    switch(serviceType) {
      case 'home': 
        return { name: 'home', color: '#4A90E2' };
      case 'clinic':
        return { name: 'hospital-building', color: '#E74C3C' };
      case 'onCall':
        return { name: 'phone', color: '#2ECC71' };
      default:
        return { name: 'medical-bag', color: '#9B59B6' };
    }
  };

  const fetchPastBookings = async () => {
    try {
      if (!token) return;
      
      setLoading(true);
      const response = await fetch('https://medospabackend.onrender.com/data/book', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      // Filter for completed bookings or past appointments
      const pastBookings = data.bookings.filter(booking => {
        const isCompleted = booking.status === 'completed';
        const isPastDate = new Date(booking.appointmentDate) < new Date();
        return isCompleted || isPastDate;
      });
      
      setBookings(pastBookings);
    } catch (error) {
      console.error('Error fetching past bookings:', error);
      setErrorPopup('Failed to fetch past bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      setDeletingId(bookingId);
      const response = await fetch(`https://medospabackend.onrender.com/data/book/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete booking');
      
      setErrorPopup('Booking deleted successfully');
      fetchPastBookings(); 
    } catch (error) {
      console.error('Error deleting booking:', error);
      setErrorPopup('Failed to delete booking');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchPastBookings();
  }, [token]);

  const renderBookingItem = ({ item }) => {
    const serviceIcon = getServiceIcon(item.serviceType);
    
    return (
      <View style={[
        styles.bookingCard,
        item.status === 'completed' && styles.completedCard
      ]}>
        <View style={styles.bookingHeader}>
          <View style={styles.serviceHeader}>
            <Icon 
              name={serviceIcon.name} 
              size={24} 
              color={serviceIcon.color} 
              style={styles.serviceIcon}
            />
            <Text style={styles.serviceFor}>{item.serviceFor}</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => handleDeleteBooking(item._id)}
            disabled={deletingId === item._id}
          >
            {deletingId === item._id ? (
              <ActivityIndicator size="small" color="#F44336" />
            ) : (
              <Icon name="delete" size={24} color="#F44336" />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color="#555" />
            <Text style={styles.detailText}>
              {new Date(item.appointmentDate).toLocaleDateString()} at {' '}
              {new Date(item.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="account" size={16} color="#555" />
            <Text style={styles.detailText}>{item.name}</Text>
          </View>

          {item.serviceType === 'home' && item.location && (
            <View style={styles.detailRow}>
              <Icon name="map-marker" size={16} color="#555" />
              <View style={styles.addressContainer}>
                <Text style={styles.detailText}>Home Service at:</Text>
                <Text style={styles.addressText}>{item.location.address}</Text>
              </View>
            </View>
          )}

          {item.serviceType === 'clinic' && (
            <View style={styles.detailRow}>
              <Icon name="hospital-marker" size={16} color="#555" />
              <Text style={styles.detailText}>Clinic Visit</Text>
            </View>
          )}

          {item.serviceType === 'onCall' && (
            <View style={styles.detailRow}>
              <Icon name="phone" size={16} color="#555" />
              <Text style={styles.detailText}>Doctor On Call</Text>
            </View>
          )}

          <View style={[styles.statusBadge, item.status === 'completed' && styles.completedBadge]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Past Bookings</Text>
      {errorpopup && <ErrorPopup message={errorpopup} Color={errorpopup.includes('Failed') ? 'red' : 'green'} onHide={() => setErrorPopup(null)} />}

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
              <Text style={styles.emptyText}>No past bookings found</Text>
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
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    marginRight: 10,
  },
  serviceFor: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  bookingDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#555',
    flexShrink: 1,
  },
  addressContainer: {
    flex: 1,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFC107',
    marginTop: 8,
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
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
});

export default PastBookingsScreen;