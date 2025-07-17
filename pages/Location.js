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

  const fetchLocation = async () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await Geocoder.from(latitude, longitude);
          const addr = res.results[0]?.formatted_address;
          setLocation({ latitude, longitude });
          setAddress(addr);
        dispatch(updateLocation({
                coords: { latitude, longitude },
                address: addr
              }));
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
      Alert.alert('Success', 'Location saved');
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
    
    Alert.alert('Service Location Set', 'This location has been set for service requests');
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
   dispatch(updateLocation({
                coords: { latitude, longitude },
                address: addr
              }));
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
                  onPress={() => {
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

    
      <TouchableOpacity style={styles.locationButton} onPress={fetchLocation}>
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
            <View key={loc._id} style={styles.savedItem}>
              <View style={styles.savedItemContent}>
                <Text>{loc.address}</Text>
                <Text style={styles.coordinatesText}>
                  ({loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)})
                </Text>
                {currentServiceLocation?.address === loc.address && (
                  <Text style={styles.serviceLocationTag}>Service Location</Text>
                )}
              </View>
              <TouchableOpacity 
                onPress={() => setSelectedLocationId(loc._id === selectedLocationId ? null : loc._id)}
                style={styles.savedItemOptions}
              >
                <Icon name="more-vert" size={20} color="#777" />
              </TouchableOpacity>
              
              {selectedLocationId === loc._id && (
                <View style={styles.savedOptionsContainer}>
                  <TouchableOpacity 
                    style={styles.optionButton}
                    onPress={() => {
                      dispatch(updateLocation({
                        coords: { latitude: loc.latitude, longitude: loc.longitude },
                        address: loc.address
                      }));
                      setSelectedLocationId(null);
                    }}
                  >
                    <Text style={styles.optionText}>Set as Service Location</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteLocation(loc._id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noLocationsText}>No saved locations</Text>
        )}
      </ScrollView>
    </View>
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