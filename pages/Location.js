import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Modal, PermissionsAndroid, Platform, Alert,
  ActivityIndicator, ScrollView
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { updateLocation } from '../Redux/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const GOOGLE_MAPS_API_KEY = "AIzaSyAxlmVTM7QxCXm6mSpvp7_CjyLHjbdSCTw";
Geocoder.init(GOOGLE_MAPS_API_KEY);

export default function LocationScreen() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedLocations, setSavedLocations] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showAddressOptions, setShowAddressOptions] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const token = useSelector((state) => state.user.userToken);
const dispatch=useDispatch();

const navigation=useNavigation();
 const currentServiceLocation = useSelector((state) => state.user.location);
  useEffect(() => {
    requestLocationPermission();
    fetchSavedLocations();
    fetchLocation();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Location permission is required');
      }
    }
  };
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; 
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};
const shouldAutoSaveLocation = async (newLocation, newAddress) => {
  try {

      const response = await fetch('https://medospabackend.onrender.com/data/saved-locations', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
    const saved=data.locations;

    if (saved.length === 0) return true;
    
   
    const sameAddressExists = saved.some(
      loc => loc.address.toLowerCase() === newAddress.toLowerCase()
    );
    if (sameAddressExists) return false;



  
    for (const savedLoc of saved) {
      const distance = calculateDistance(
        newLocation.latitude,
        newLocation.longitude,
        savedLoc.latitude,
        savedLoc.longitude
      );
      console.log(distance)
      
      if (distance <= 28) return false;
    }
    
 
    return true;
  } catch (error) {
    console.error('Error checking location:', error);
    return false;
  }
}

  const fetchLocation = async (data) => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await Geocoder.from(latitude, longitude);
          console.log(res)
          const addr = res.results[0]?.formatted_address;
          setLocation({ latitude, longitude });
          setAddress(addr);

          const tosave={latitude,longitude};
          const tosaveaddr=addr;
      if(data){
          dispatch(updateLocation({
                coords: { latitude, longitude },
                address: addr
              }));
      };


    const shouldSave = await shouldAutoSaveLocation({ latitude, longitude }, addr);
if (shouldSave) {
          try {
      const response = await fetch('https://medospabackend.onrender.com/data/save-location', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...tosave, address:tosaveaddr }),
      });
      if (!response.ok) throw new Error('Failed to save');
     
      fetchSavedLocations();
      setShowAddressOptions(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to save location');
    }
          }
        } catch (e) {
          console.error('Geocoder error:', e);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const saveCurrentLocation = async () => {
    if (!location || !address) return Alert.alert('Error', 'No location data to save');
    try {
      const response = await fetch('https://medospabackend.onrender.com/data/save-location', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...location, address }),
      });
      if (!response.ok) throw new Error('Failed to save');
     
      fetchSavedLocations();
      setShowAddressOptions(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to save location');
    }
  };

  const deleteLocation = async (locationId) => {
    try {
      const response = await fetch(`https://medospabackend.onrender.com/data/delete-location/${locationId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete');
      fetchSavedLocations();
      setSelectedLocationId(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to delete location');
    }
  };
  const setServiceLocation = () => {
    if (!location || !address) return;
    
    dispatch(updateLocation({
      coords: location,
      address: address
    }));
    
   
    setShowAddressOptions(false);
  };
  const fetchSavedLocations = async () => {
    try {
      const response = await fetch('https://medospabackend.onrender.com/data/saved-locations', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSavedLocations(data.locations || []);
    } catch (err) {
      setSavedLocations([]);
    }
  };

  const handleManualSubmit = async () => {
    try {
      const res = await Geocoder.from(manualInput);
      const loc = res.results[0].geometry.location;
      const addr = res.results[0].formatted_address;

      const newLoc = { latitude: loc.lat, longitude: loc.lng };
      setLocation(newLoc);
      setAddress(addr);
 
    } catch (err) {
      Alert.alert('Error', 'Could not find that location');
    }
  };

const handlePrdictionClick = async (input) => {
    try {
      const res = await Geocoder.from(input);
      const loc = res.results[0].geometry.location;
      const addr = res.results[0].formatted_address;

      const newLoc = { latitude: loc.lat, longitude: loc.lng };
      setLocation(newLoc);
      setAddress(addr);
   dispatch(updateLocation({
                coords: { latitude:loc.lat, longitude:loc.lng },
                address: addr
              }));
           try {
      const response = await fetch('https://medospabackend.onrender.com/data/save-location', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newLoc, address:addr }),
      });
      if (!response.ok) throw new Error('Failed to save');
      
      fetchSavedLocations();
      setShowAddressOptions(false);
      setTimeout(()=>{navigation.goBack(); },1000)
    } catch (err) {
      Alert.alert('Error', 'Failed to save location');
    }
             
              
    } catch (err) {
      Alert.alert('Error', 'Could not find that location');
    }
  };


  const fetchPredictions = async (text) => {
    setManualInput(text);
    if (text.length > 2) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        setPredictions(data.predictions || []);
      } catch (err) {
        setPredictions([]);
      }
    } else {
      setPredictions([]);
    }
  };

  return (

    <SafeAreaView style={{flex:1,backgroundColor:"#f0f0f0"}}>
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search for a location..."
          onChangeText={fetchPredictions}
          value={manualInput}
          onSubmitEditing={handleManualSubmit}
        />
        {predictions.length > 0 && (
          <View style={styles.predictionsContainer}>
            <ScrollView style={styles.predictionsScroll}>
              {predictions.map((prediction) => (
                <TouchableOpacity
                  key={prediction.place_id}
                  style={styles.predictionItem}
                  onPress={() => {handlePrdictionClick(prediction.description)
                    setManualInput(prediction.description);

                    setPredictions([]);
                  }}
                >
                  <Text>{prediction.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

    
      <TouchableOpacity style={styles.locationButton} onPress={()=>{fetchLocation("new ")}}>
        <Icon name="my-location" size={20} color="#fff" />
        <Text style={styles.buttonText}>Use Current Location</Text>
      </TouchableOpacity>

      <View style={styles.addressContainer}>
        <View style={styles.addressHeader}>
          <Text style={styles.addressTitle}>Current Address</Text>
          <TouchableOpacity 
            onPress={() => setShowAddressOptions(!showAddressOptions)}
            style={styles.iconButton}
          >
            <Icon name="more-vert" size={22} color="#000" />
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ActivityIndicator style={{ marginTop: 10 }} />
        ) : (
          <Text style={styles.addressText}>{address || 'Fetching location...'}</Text>
        )}

        {showAddressOptions && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={saveCurrentLocation}
            >
              <Text style={styles.optionText}>Save Location</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={setServiceLocation}
            >
              <Text style={styles.optionText}>Get Service Here</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.savedTitle}>Saved Locations</Text>
      <ScrollView style={styles.savedContainer}>
        {savedLocations.length > 0 ? (
          savedLocations.map((loc) => (
            <View 
  key={loc._id} 
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
    paddingRight: 40 
  }}
>
 
  <View style={{
    marginRight: 12,
    alignItems: 'center',
    width: 40
  }}>
    <Icon name="location-on" size={24} color="#888" />
    {location && (
      <Text style={{
        fontSize: 10,
        color: '#666',
        marginTop: 2
      }}>
     {(() => {
      const distanceInMeters = calculateDistance(
        location.latitude,
        location.longitude,
        loc.latitude,
        loc.longitude
      );
      return distanceInMeters < 1000 
        ? `${distanceInMeters.toFixed(0)}m` 
        : `${(distanceInMeters/1000).toFixed(1)}km`;
    })()}
      </Text>
    )}
  </View>

  
  <View style={{
    flex: 1,
    marginRight: 8,
    minWidth: 0 
  }}>
    <Text 
      style={{
        fontSize: 14,
        color: '#333',
      }}
      numberOfLines={2}
      ellipsizeMode="tail"
    >
      {loc.address}
    </Text>
    <Text style={{
      fontSize: 12,
      color: '#777',
      marginTop: 4
    }}>
      ({loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)})
    </Text>
    {currentServiceLocation?.address === loc.address && (
      <Text style={{
        color: '#4CAF50',
        fontSize: 12,
        marginTop: 4,
        fontWeight: 'bold'
      }}>
        Service Location
      </Text>
    )}
  </View>

 
  <TouchableOpacity 
    onPress={() => setSelectedLocationId(loc._id === selectedLocationId ? null : loc._id)}
    style={{
      position: 'absolute',
      right: 0,
      top: 14,
      padding: 8,
    }}
  >
    <Icon name="more-vert" size={20} color="#777" />
  </TouchableOpacity>
  
  
  {selectedLocationId === loc._id && (
    <View style={{
      position: 'absolute',
      right: 0,
      top: 40,
      backgroundColor: '#f9f9f9',
      borderRadius: 6,
      padding: 8,
      zIndex: 1,
      elevation: 3,
      width: 180
    }}>
      <TouchableOpacity 
        style={{ padding: 8 }}
        onPress={() => {
          dispatch(updateLocation({
            coords: { latitude: loc.latitude, longitude: loc.longitude },
            address: loc.address
          }));
          setSelectedLocationId(null);
        }}
      >
        <Text style={{ color: '#2196F3' }}>Set as Service Location</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={{ padding: 8 }}
        onPress={() => deleteLocation(loc._id)}
      >
        <Text style={{ color: 'red' }}>Delete</Text>
      </TouchableOpacity>
    </View>
  )}
</View>
          ))
        ) : (
          <Text style={styles.noLocationsText}>No saved locations</Text>
        )}
      </ScrollView>
    </View></SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  }, serviceLocationTag: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold'
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  predictionsContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
  },
  predictionsScroll: {
    maxHeight: 200,
  },
  predictionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  addressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  addressText: {
    color: '#444',
    fontSize: 14,
  },
  iconButton: {
    padding: 4,
  },
  optionsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  optionButton: {
    padding: 8,
  },
  optionText: {
    color: '#2196F3',
  },
  savedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  savedContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 2,
  },
  savedItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative',
  },
  savedItemContent: {
    flex: 1,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  savedItemOptions: {
    position: 'absolute',
    right: 0,
    top: 14,
    padding: 8,
  },
  savedOptionsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: 'red',
  },
  noLocationsText: {
    color: '#777',
    paddingVertical: 16,
    textAlign: 'center',
  },
});