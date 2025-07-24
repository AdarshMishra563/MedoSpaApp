import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import ErrorPopup from './ErrorPopup';

const BookingsScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errorpopup,setErrorPopup]=useState(null);

  const [editForm, setEditForm] = useState({
    appointmentDate: new Date(),
    serviceType: 'home',
    serviceFor: ''
  });
  const token = useSelector(state => state.user.userToken);
const location= useSelector(state => state.user.location);
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
      setBookings(data.bookings);
      filterBookings(data.bookings, activeTab);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = (bookingsList, status) => {
    if (status === 'all') {
      setFilteredBookings(bookingsList);
    } else {
      setFilteredBookings(bookingsList.filter(booking => booking.status === status));
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

  const handleEditBooking = (booking) => {
    setSelectedBooking(booking);
    setEditForm({
      appointmentDate: new Date(booking.appointmentDate),
      serviceType: booking.serviceType,
      serviceFor: booking.serviceFor,
       location: booking.serviceType === 'home' ? booking.location : location
    });
    setShowEditModal(true);
  };

  const handleUpdateBooking = async () => {
    try {
      setProcessing(true);
  const updateData = {
      appointmentDate: editForm.appointmentDate.toISOString(),
      serviceType: editForm.serviceType,
      serviceFor: editForm.serviceFor
    };
     if (editForm.serviceType === 'home') {
      updateData.location = editForm.location || location;
    }


      const response = await fetch(`https://medospabackend.onrender.com/data/book/${selectedBooking._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to update booking');
      
      setErrorPopup("Booking updated successfully")
      setShowEditModal(false);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      Alert.alert('Error', 'Failed to update booking');
    } finally {
      setProcessing(false);
    }
  };

 const onDateChange = (event, selectedDate) => {
  console.log(event,selectedDate)
  setShowDatePicker(false);
  if (selectedDate) {
    setEditForm({ ...editForm, appointmentDate: selectedDate });
    setShowTimePicker(true); 
  }
};

const onTimeChange = (event, selectedTime) => {
  setShowTimePicker(false);
  if (selectedTime) {
    const prevDate = new Date(editForm.appointmentDate || new Date());
    const updatedDate = new Date(prevDate);

    updatedDate.setHours(selectedTime.getHours());
    updatedDate.setMinutes(selectedTime.getMinutes());

    setEditForm({ ...editForm, appointmentDate: updatedDate });
  }
};
  useFocusEffect(
    React.useCallback(() => {
      fetchBookings();
      return () => {};
    }, [token, activeTab])
  );

  useEffect(() => {
    filterBookings(bookings, activeTab);
  }, [activeTab, bookings]);

  const getServiceTypeIcon = (serviceType, serviceFor) => {
    if (serviceType === 'home') return 'home';
    if (serviceType === 'onCall') return 'phone';
    if (serviceFor?.toLowerCase().includes('clinic')) return 'hospital-building';
    return 'medical-bag'; 
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed':
        return { backgroundColor: '#4CAF50', color: 'white' };
      case 'cancelled':
        return { backgroundColor: '#F44336', color: 'white' };
      default:
        return { backgroundColor: '#FFC107', color: 'black' };
    }
  };

 const renderBookingItem = ({ item }) => (
  <View style={[
    styles.bookingCard,
    item.status === 'confirmed' && styles.confirmedCard,
    item.status === 'cancelled' && styles.cancelledCard
  ]}>
    <View style={styles.bookingContent}>
      <View style={styles.headerRow}>
        <View style={styles.serviceInfo}>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, getStatusStyle(item.status)]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.serviceFor}>Booking for: {item.serviceFor}</Text>
          <View style={styles.dateRow}>
            <Icon name="calendar" size={16} color="#555" />
            <Text style={styles.dateText}>
              Meeting at: {new Date(item.appointmentDate).toLocaleDateString()} at {' '}
              {new Date(item.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Icon name="clock-outline" size={16} color="#555" />
            <Text style={styles.dateText}>
              Booked at: {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
         
          {item.serviceType === 'home' && item.location && (
            <View style={styles.dateRow}>
              <Icon name="map-marker" size={16} color="#555" />
              <Text style={styles.dateText}>
                Address: {item.location.address}
              </Text>
            </View>
          )}
        </View>
        
        {item.status === 'active' && (
          <Menu>
            <MenuTrigger>
              <Icon name="dots-vertical" size={24} color="#555" />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption onSelect={() => handleEditBooking(item)}>
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
        )}
      </View>

      <View style={styles.userRow}>
        <View style={{flexDirection:"row"}}>
          {item.picture ? (
            <Image source={{ uri: item.picture }} style={styles.userImage} />
          ) : (
            <Icon name="account-circle" size={40} color="#555" />
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
          </View>
        </View>
        
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
        {errorpopup&& <ErrorPopup message={errorpopup} Color='green' onHide={()=>{setErrorPopup(null)}}/>}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'active' && styles.activeTab
          ]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'active' && styles.activeTabText
          ]}>Active</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'confirmed' && styles.activeTab
          ]}
          onPress={() => setActiveTab('confirmed')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'confirmed' && styles.activeTabText
          ]}>Confirmed</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'cancelled' && styles.activeTab
          ]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'cancelled' && styles.activeTabText
          ]}>Cancelled</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0f1011ff" />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="calendar-remove" size={50} color="#888" />
              <Text style={styles.emptyText}>No {activeTab} bookings found</Text>
            </View>
          }
        />
      )}

     
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Edit Booking</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Appointment Date & Time</Text>
                <TouchableOpacity 
                  style={styles.dateInput} 
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{editForm.appointmentDate.toLocaleString()}</Text>
                  <Icon name="calendar" size={20} color="#555" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={editForm.appointmentDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                )}
                 {showTimePicker && (
        <DateTimePicker
          mode="time"
          value={editForm.appointmentDate}
          display="default"
          onChange={onTimeChange}
        />
      )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Service Type</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity 
                    style={[
                      styles.radioButton,
                      editForm.serviceType === 'home' && styles.radioButtonSelected
                    ]}
                    onPress={() => setEditForm({...editForm, serviceType: 'home'})}
                  >
                    <Text style={[
                      styles.radioText,
                      editForm.serviceType === 'home' && styles.radioTextSelected
                    ]}>
                      Home Service
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.radioButton,
                      editForm.serviceType === 'clinic' && styles.radioButtonSelected
                    ]}
                    onPress={() => setEditForm({...editForm, serviceType: 'clinic'})}
                  >
                    <Text style={[
                      styles.radioText,
                      editForm.serviceType === 'clinic' && styles.radioTextSelected
                    ]}>
                      Clinic Visit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Booking For</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.serviceFor}
                  onChangeText={(text) => setEditForm({...editForm, serviceFor: text})}
                  placeholder="e.g. Dental Checkup, Blood Test"
                />
              </View>

              <View style={styles.modalButtonGroup}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdateBooking}
                  disabled={processing}
                >
                  {processing ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeTab: {
    backgroundColor: '#0f1011ff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  activeTabText: {
    color: '#fff',
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
    borderWidth: 0.4,
    borderColor: '#ddd',
  },
  confirmedCard: {
    borderColor: '#4CAF50',
  },
  cancelledCard: {
    borderColor: '#F44336',
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
  statusBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
    addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addressText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#555',
    flexShrink: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  serviceFor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    width:"70%"
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
    justifyContent: 'space-between'
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
  serviceTypeIcon: {
    padding: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  radioButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    alignItems: 'center',
  },
  radioButtonSelected: {
    backgroundColor: '#0f1011ff',
    borderColor: '#0f1011ff',
  },
  radioText: {
    color: '#555',
  },
  radioTextSelected: {
    color: 'white',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  modalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#0f1011ff',
  },
  cancelButtonText: {
    color: '#555',
  },
  saveButtonText: {
    color: 'white',
  },
});

export default BookingsScreen;