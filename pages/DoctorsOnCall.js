import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, StatusBar, Linking, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import ErrorPopup from './ErrorPopup';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from './useCart';

const services = [
  {
    id: "doc_001",
    name: "Doctor",
    description: "At-home or virtual consultation with a certified physician for diagnosis and treatment.",
    price: 150,
    duration: "30 mins",
    imageSource: { uri: "https://up.yimg.com/ib/th/id/OIP.9rrAZRwOTYOFGa7La3bFTgHaE8?pid=Api&rs=1&c=1&qlt=95&w=168&h=112" } // Replace with actual image URL
  },
  {
    id: "nurse_001",
    name: "Nurse",
    description: "Professional nursing care for injections, wound dressing, and post-operative care at home.",
    price: 80,
    duration: "45 mins",
   imageSource: { uri: "https://up.yimg.com/ib/th/id/OIP.9rrAZRwOTYOFGa7La3bFTgHaE8?pid=Api&rs=1&c=1&qlt=95&w=168&h=112" } 
  },
  {
    id: "physio_001",
    name: "Physiotherapist",
    description: "Customized physiotherapy for pain relief, mobility improvement, and rehabilitation.",
    price: 120,
    duration: "60 mins",
    imageSource: { uri: "https://up.yimg.com/ib/th/id/OIP.9rrAZRwOTYOFGa7La3bFTgHaE8?pid=Api&rs=1&c=1&qlt=95&w=168&h=112" } 
  },
  {
    id: "massage_001",
    name: "Medical Massage Therapist",
    description: "Medical-grade massage for stress relief, muscle recovery, and chronic pain management.",
    price: 100,
    duration: "45 mins",
    imageSource: { uri: "https://up.yimg.com/ib/th/id/OIP.9rrAZRwOTYOFGa7La3bFTgHaE8?pid=Api&rs=1&c=1&qlt=95&w=168&h=112" } 
  }
];
const HomeServicesScreen = () => {
  const navigation = useNavigation();
     const [errorPopup,setErrorPopup]=useState(null);
  const { userInfo, userToken } = useSelector((state) => state.user);
  const [selectedService, setSelectedService] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(userInfo?.phoneNumber || '');
  const [editingPhone, setEditingPhone] = useState(!userInfo?.phoneNumber);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isHomeService, setIsHomeService] = useState(false);
const [errorpopup,seterroerpopup]=useState(null)
  const handleCallNow = () => {
    const phoneNumber = '+919220783636';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setAppointmentDate(selectedDate);
    }
  };

  const validateFields = () => {
    const errors = {};
    if (!phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    if (!selectedService) errors.service = 'Please select a service';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBookService = async () => {
    if (!validateFields()) return;
    
    setIsSubmitting(true);
    
    const payload = {
      name: userInfo?.name || '',
      phoneNumber: phoneNumber.trim(),
      picture: userInfo?.picture,
      appointmentDate: appointmentDate.toISOString(),
      serviceType: "onCall",
      serviceFor: selectedService+" on Call",
      location: {
        address: userInfo?.location?.address || '',
        coords: userInfo?.location?.coords || { lat: 0, lng: 0 },
      },
    };

    try {
      const response = await fetch('https://medospabackend.onrender.com/data/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          setFieldErrors(result.errors);
        } else {
          Alert.alert('Error', result.response?.data?.message || 'Something went wrong');
        }
        return;
      }
      console.log(result)

    seterroerpopup("Successfully Booked")
      setSelectedService(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ServiceButtonGroup = ({ serviceType }) => {

 const {addToCart}=useCart();
    const icons = {
      'Doctor': 'doctor',
      'Nurse': 'nursing',
      'Physiotherapist': 'arm-flex',
      'Medical Massage Therapist': 'massage'
    };
 const handleAddToCart = async (item) => {
    const service = services.find(service => service.name === item);
console.log(service)
    try {
     addToCart({
      id: service.id,
      name: service.name +" on Call",
      description: service.description,
      price: service.price,
      duration: service.duration,
      imageSource: service.imageSource 
    });
    setErrorPopup("Added to Treatment Bag");
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    }
  };
    return (
      <View style={styles.serviceContainer}>
        <Text style={styles.serviceTitle}>Call a {serviceType}</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCallNow}
          >
            <Icon name="phone" size={24} color="#007AFF" />
            <Text style={styles.buttonText}>Call Now</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>{handleAddToCart(serviceType)}} style={styles.actionButton}>
            <Icon name="medical-bag" size={24} color="#007AFF" />
            <Text style={styles.buttonText}>Treatment Bag</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setSelectedService(serviceType)}
          >
            <Icon name="calendar-clock" size={24} color="#007AFF" />
            <Text style={styles.buttonText}>Schedule</Text>
          </TouchableOpacity>
        </View>

        {selectedService === serviceType && (
          <View style={styles.bookingForm}>
            <View style={styles.phoneNumberContainer}>
              <Text style={styles.label}>Phone Number:</Text>
              <View style={styles.phoneInputContainer}>
                <TextInput
                  style={styles.phoneInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholder="Enter phone number"
                  editable={editingPhone}
                />
                <TouchableOpacity onPress={() => setEditingPhone(!editingPhone)}>
                  <Icon name={editingPhone ? 'check' : 'pencil'} size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
              {fieldErrors.phoneNumber && (
                <Text style={styles.errorText}>{fieldErrors.phoneNumber}</Text>
              )}
            </View>

            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {appointmentDate.toLocaleDateString()}
              </Text>
              <Icon name="calendar" size={20} color="#007AFF" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={appointmentDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            

            <TouchableOpacity
              style={styles.bookButton}
              onPress={handleBookService}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.bookButtonText}>Book Appointment</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex:1,backgroundColor:"#f6f5f5ff"}}>
     { errorPopup && <ErrorPopup message='Added to Treatment Bag' Color='green' onHide={()=>{setErrorPopup(null)}}/>}
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f5f5ff" />
      {errorpopup && <ErrorPopup message={errorpopup} Color="green" onHide={() => seterroerpopup(null)} />}
      <View style={styles.header}>
        <Image
          source={require('./1752603563232.jpg')}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>MedoSpa</Text>
        <Text style={styles.headerSubtitle}>Health services at your doorstep</Text>
      </View>
{errorpopup && <ErrorPopup message={errorpopup} Color="green" onHide={() => seterroerpopup(null)} />}
      <ScrollView style={styles.scrollContainer}>
        <ServiceButtonGroup serviceType="Doctor" />
        <ServiceButtonGroup serviceType="Nurse" />
        <ServiceButtonGroup serviceType="Physiotherapist" />
        <ServiceButtonGroup  serviceType="Medical Massage Therapist" />

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.stepContainer}>
            <Icon name="phone-in-talk" size={24} color="#007AFF" style={styles.stepIcon} />
            <View>
              <Text style={styles.stepText}>1. Choose your service and call now for immediate assistance</Text>
              <Text style={styles.stepDetail}>Our emergency line connects you directly to our dispatch center</Text>
            </View>
          </View>
          <View style={styles.stepContainer}>
            <Icon name="calendar-check" size={24} color="#007AFF" style={styles.stepIcon} />
            <View>
              <Text style={styles.stepText}>2. Schedule a visit with our top-rated professionals</Text>
              <Text style={styles.stepDetail}>Book in advance to get matched with the best specialists in your area</Text>
            </View>
          </View>
          <View style={styles.stepContainer}>
            <Icon name="home-account" size={24} color="#007AFF" style={styles.stepIcon} />
            <View>
              <Text style={styles.stepText}>3. Receive professional care at your home or office</Text>
              <Text style={styles.stepDetail}>Our certified professionals come fully equipped with all necessary medical supplies</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View></SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f5f5ff',
  },
  header: {
    backgroundColor: '#e1dfdfff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  serviceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    paddingVertical: 12,
    width: '30%',
  },
  buttonText: {
    marginTop: 6,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  bookingForm: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  phoneNumberContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  phoneInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
  },
  serviceTypeContainer: {
    marginBottom: 15,
  },
  serviceTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  serviceTypeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedServiceType: {
    backgroundColor: '#e6f2ff',
    borderColor: '#007AFF',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  infoSection: {
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stepIcon: {
    marginRight: 10,
    marginTop: 3,
  },
  stepText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  stepDetail: {
    fontSize: 14,
    color: '#777',
    marginTop: 3,
  },
});

export default HomeServicesScreen;