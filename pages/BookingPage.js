import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import ErrorPopup from './ErrorPopup';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const BookingPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { name: passedName, imageSource } = route.params || {};

  const { userInfo, location, userToken } = useSelector((state) => state.user);

  const [name, setName] = useState(userInfo.name || '');
  const [editingName, setEditingName] = useState(!userInfo.name);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(userInfo.phoneNumber || '');
  const [editingPhone, setEditingPhone] = useState(!userInfo.phoneNumber);
const [showDatePicker, setShowDatePicker] = useState(false);
const [appointmentDate, setAppointmentDate] = useState(new Date());

  const [isHomeService, setIsHomeService] = useState(false);
  const [landmark, setLandmark] = useState('');
  const [homeDetails, setHomeDetails] = useState('');

  const [errorPopup, setErrorPopup] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!passedName || !imageSource) {
      Alert.alert('Invalid Parameters', 'Missing required booking details.');
      navigation.goBack();
    }
  }, []);

  const validateFields = () => {
    const errors = {};

    if (!name.trim()) errors.name = 'Name is required';
    if (!phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    if (!appointmentDate || isNaN(appointmentDate.getTime())) {
    errors.appointmentDate = 'Valid date is required';
  } else if (appointmentDate < new Date()) {
    errors.appointmentDate = 'Date cannot be in the past';
  }
    if (isHomeService) {
      if (!landmark.trim()) errors.landmark = 'Landmark is required';
      if (!homeDetails.trim()) errors.homeDetails = 'Building/floor info is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };


  const handleDateChange = (event, selectedDate) => {
  setShowDatePicker(false);
  if (selectedDate) {
    setAppointmentDate(selectedDate);
    setShowTimePicker(true)
  }
};

const handleTimeChange = (event, selectedTime) => {
  setShowTimePicker(false);
  if (event?.type === 'set' && selectedTime) {
    const prevDate = new Date(appointmentDate || new Date());
    const updatedDate = new Date(prevDate);

    updatedDate.setHours(selectedTime.getHours());
    updatedDate.setMinutes(selectedTime.getMinutes());
    updatedDate.setSeconds(0);
    updatedDate.setMilliseconds(0);

    setAppointmentDate(updatedDate);
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleString();
};


  const handleSubmit = async () => {
  
    if (!validateFields()) return;
    
    setIsSubmitting(true);
      
   
    const payload = {
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      picture: userInfo.picture,
      appointmentDate: appointmentDate.toISOString(),
      location: {
        address: location?.address,
        coords: location?.coords,
      },
      serviceType: isHomeService ? 'home' : 'clinic',
      serviceFor: passedName,
      ...(isHomeService && {
        landmark: landmark.trim(),
        buildingInfo: homeDetails.trim(),
      }),
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
console.log(result)
      if (!response.ok) {
        if (result.errors) {
          setFieldErrors(result.errors);
        } else {
          setErrorPopup(result.response?.data?.message || 'Something went wrong');
        }
        return;
      }

      Alert.alert('Success', 'Appointment booked successfully.');
      navigation.goBack();
    } catch (err) {
      setErrorPopup('Failed to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <SafeAreaView style={{flex:1}} >
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {errorPopup && <ErrorPopup message={errorPopup} onHide={() => setErrorPopup(null)} />}

      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>
        Booking for {passedName}
      </Text>

      <Image
        source={imageSource }
        style={{
          width: width * 0.92,
          height: 200,
          borderRadius: 12,
          marginBottom: 16,
          alignSelf: 'center',
        }}
      />

    
      <View style={{ marginBottom: 12 }}>
        <Text style={{ marginBottom: 4 }}>Name</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {editingName ? (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              style={{
                flex: 1,
                borderWidth: 0.7,
                borderColor: fieldErrors.name ? 'red' : '#888',
                borderRadius: 8,
                padding: 8,
              }}
            />
          ) : (
            <>
              <Text style={{ flex: 1 }}>{name}</Text>
              <TouchableOpacity onPress={() => setEditingName(true)}>
                <Icon name="edit-2" size={18} />
              </TouchableOpacity>
            </>
          )}
        </View>
        {fieldErrors.name && <Text style={{ color: 'red' }}>{fieldErrors.name}</Text>}
      </View>

      
      <View style={{ marginBottom: 12 }}>
        <Text style={{ marginBottom: 4 }}>Phone Number</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {editingPhone ? (
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              style={{
                flex: 1,
                borderWidth: 0.7,
                borderColor: fieldErrors.phoneNumber ? 'red' : '#888',
                borderRadius: 8,
                padding: 8,
              }}
            />
          ) : (
            <>
              <Text style={{ flex: 1 }}>{phoneNumber}</Text>
              <TouchableOpacity onPress={() => setEditingPhone(true)}>
                <Icon name="edit-2" size={18} />
              </TouchableOpacity>
            </>
          )}
        </View>
        {fieldErrors.phoneNumber && <Text style={{ color: 'red' }}>{fieldErrors.phoneNumber}</Text>}
      </View>

      <View style={{ marginBottom: 12,marginTop:8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center',marginBottom:4 }}>
          <Text style={{ marginBottom: 4, flex: 1 }}>Current Location</Text>
          <TouchableOpacity  style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('Location')}>
           <Icon name="map-pin" size={16} color="#007aff" style={{ marginRight: 4 }} />
            <Text style={{ color: '#007aff' }}>Update</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: '#333', fontSize: 14 }}>{location?.address || 'Fetching...'}</Text>
      </View>

   
     <View style={{ marginBottom: 12 }}>
  <Text style={{ marginBottom: 4 }}>Appointment Date</Text>
  <TouchableOpacity
    onPress={() => setShowDatePicker(true)}
    style={{
      borderWidth: 0.7,
      borderColor: fieldErrors.appointmentDate ? 'red' : '#888',
      borderRadius: 8,
      padding: 8,
      justifyContent: 'space-between',
      height: 40,
      flexDirection: 'row',
      alignItems: 'center',
    }}
  >
    <Text>{formatDate(appointmentDate)}</Text>
    <Icon name="calendar" size={20} color="#888" />
  </TouchableOpacity>

  {showDatePicker && (
    <DateTimePicker
      value={appointmentDate}
      mode="date"
      display="default"
      onChange={handleDateChange}
      minimumDate={new Date()}
    />
  )}  {showTimePicker && (
        <DateTimePicker
          mode="time"
          value={appointmentDate}
          display="default"
          onChange={handleTimeChange}
        />
      )}

  {fieldErrors.appointmentDate && (
    <Text style={{ color: 'red' }}>{fieldErrors.appointmentDate}</Text>
  )}
</View>

     
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ marginRight: 12 }}>Home Service</Text>
        <Switch
          value={isHomeService}
          onValueChange={setIsHomeService}
          thumbColor="#007aff"
        />
      </View>

    
      {isHomeService && (
        <>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ marginBottom: 4 }}>Landmark</Text>
            <TextInput
              value={landmark}
              onChangeText={setLandmark}
              placeholder="E.g. Near metro station"
              style={{
                borderWidth: 0.7,
                borderColor: fieldErrors.landmark ? 'red' : '#888',
                borderRadius: 8,
                padding: 8,
              }}
            />
            {fieldErrors.landmark && <Text style={{ color: 'red' }}>{fieldErrors.landmark}</Text>}
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ marginBottom: 4 }}>Building/Floor Info</Text>
            <TextInput
              value={homeDetails}
              onChangeText={setHomeDetails}
              placeholder="E.g. Flat 101, 2nd floor"
              style={{
                borderWidth: 0.7,
                borderColor: fieldErrors.homeDetails ? 'red' : '#888',
                borderRadius: 8,
                padding: 8,
              }}
            />
            {fieldErrors.homeDetails && (
              <Text style={{ color: 'red' }}>{fieldErrors.homeDetails}</Text>
            )}
          </View>
        </>
      )}

     
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={{
          backgroundColor: '#007aff',
          paddingVertical: 14,
          borderRadius: 10,
          marginTop: 16,
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={{
              textAlign: 'center',
              color: '#fff',
              fontWeight: '600',
              fontSize: 16,
            }}
          >
            Submit Booking
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView></SafeAreaView>
  );
};

export default BookingPage;