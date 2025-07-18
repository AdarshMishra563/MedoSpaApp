import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Platform,
  PermissionsAndroid,
  Modal,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import Geocoder from 'react-native-geocoding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateLocation } from '../Redux/userSlice';
import { useDispatch, useSelector } from 'react-redux';

const GOOGLE_MAPS_API_KEY = "AIzaSyAxlmVTM7QxCXm6mSpvp7_CjyLHjbdSCTw";
Geocoder.init(GOOGLE_MAPS_API_KEY);

const getDistance = (lat1, lon1, lat2, lon2) => {
  console.log('Calculating distance...');
  const R = 6371e3;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  console.log(`Distance: ${dist.toFixed(2)} meters`);
  return dist;
};

export default function LocationTracker() {
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState('');
  const scale = new Animated.Value(1);
  const loc=useSelector(state=>state.user.location)
const dispatch=useDispatch();
const hasDispatched = useRef(false);
  useEffect(() => {
    console.log('useEffect triggered');

    const fetchLocation = async () => {
      
      const granted = await requestLocationPermission();
      if (!granted) {
        console.log('Permission denied');
        return;
      }


      Geolocation.getCurrentPosition(
        async (position) => {
          console.log('Position received:', position);
          const { latitude, longitude } = position.coords;

          try {
          
            const stored = loc?.coords;
            const storedLoc = stored 
           

            const distance =
              storedLoc && storedLoc.latitude
                ? getDistance(
                    latitude,
                    longitude,
                    storedLoc.latitude,
                    storedLoc.longitude
                  )
                : Infinity;

            

            if (distance > 180) {
             
              const res = await Geocoder.from(latitude, longitude);
              const addr = res.results[0]?.formatted_address || '';
              if(!hasDispatched.current){
                 dispatch(updateLocation({
                coords: { latitude, longitude },
                address: addr
              }));

              hasDispatched.current=true;
              }

              setAddress(addr);
              setShowModal(true);
              console.log('Modal shown.');
              animateWave();
              setTimeout(() => {
                setShowModal(false);
                console.log('Modal hidden.');
              }, 1500);
            } else {
              console.log('User has not moved > 100 meters. No update.');
            }
          } catch (error) {
            console.warn('Error in location logic:', error);
          }
        },
        (error) => {
          
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    fetchLocation();
  }, []);

  const animateWave = () => {
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 2,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  return (
    <Modal visible={showModal} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.waveContainer, { transform: [{ scale }] }]}>
          <View style={styles.rod} />
        </Animated.View>
        <Text style={styles.locationText}>Current Location:</Text>
        <Text style={styles.addressText}>{address}</Text>
      </View>
    </Modal>
  );
}

const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      console.log('Requesting Android location permission...');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      console.log('Permission result:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  }
  return true;
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rod: {
    width: 6,
    height: 30,
    backgroundColor: 'green',
    borderRadius: 3,
  },
  locationText: {
    marginTop: 20,
    fontSize: 16,
    color: '#fff',
  },
  addressText: {
    fontSize: 14,
    color: '#eee',
    marginTop: 5,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
});
