import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, StatusBar, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const HomeServicesScreen = () => {
  const navigation = useNavigation();

  const handleCallNow = () => {
    const phoneNumber = '+916393137253';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const ServiceButtonGroup = ({ serviceType }) => {
    const icons = {
      'Doctor': 'doctor',
      'Nurse': 'nursing',
      'Physiotherapist': 'arm-flex',
      'Medical Massage Therapist': 'massage'
    };

    const navigateToBooking = () => {
      navigation.navigate('BookingPage', {
        name: serviceType +" on Call",
        imageSource: require('./assets/15.png')
      });
    };

    return (
      <View style={styles.serviceContainer}>
        <Text style={styles.serviceTitle}>Call a {serviceType}</Text>
        
        <View style={styles.buttonRow}>
          {/* Immediate Call Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCallNow}
          >
            <Icon name="phone" size={24} color="#007AFF" />
            <Text style={styles.buttonText}>Call Now</Text>
          </TouchableOpacity>

          {/* Medical Info Button */}
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="medical-bag" size={24} color="#007AFF" />
            <Text style={styles.buttonText}>Services</Text>
          </TouchableOpacity>

          {/* Schedule Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={navigateToBooking}
          >
            <Icon name="calendar-clock" size={24} color="#007AFF" />
            <Text style={styles.buttonText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f5f5ff" />
      
      <View style={styles.header}>
        <Image
          source={require('./1752603563232.jpg')}
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>MedoSpa</Text>
        <Text style={styles.headerSubtitle}>Health services on a Call</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <ServiceButtonGroup serviceType="Doctor" />
        <ServiceButtonGroup serviceType="Nurse" />
        <ServiceButtonGroup serviceType="Physiotherapist" />
        <ServiceButtonGroup serviceType="Medical Massage Therapist" />

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
          <View style={styles.stepContainer}>
            <Icon name="star" size={24} color="#007AFF" style={styles.stepIcon} />
            <View>
              <Text style={styles.stepText}>4. Enjoy premium aftercare services</Text>
              <Text style={styles.stepDetail}>Get follow-up consultations and personalized health recommendations</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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