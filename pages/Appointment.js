import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, StyleSheet, FlatList, TextInput, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const healthcareServices = [
  { 
    id: '1',
    name: "Physiotherapist", 
    imageSource: require('./assets/Physiotherapist.png'),
    description: "Professional physical therapy for recovery and mobility"
  },
  { 
    id: '2',
    name: "Nurses", 
    imageSource: require('./assets/13.png'),
    description: "Skilled nursing care at your home"
  },
  { 
    id: '3',
    name: "Assistants", 
    imageSource: require('./assets/Assistants.png'),
    description: "Trained healthcare assistants for daily support"
  },
  { 
    id: '4',
    name: "Medical Massage", 
    imageSource: require('./assets/MedicalMassage.png'),
    description: "Therapeutic massage for pain relief and relaxation"
  },
  { 
    id: '5',
    name: "Doctors on Call", 
    imageSource: require('./assets/OnCall.png'),
    description: "Doctor consultations at your convenience"
  },
  { 
    id: '6',
    name: "Soft Tissue Therapy", 
    imageSource: require('./assets/SoftTissueTherapy.png'),
    description: "Treatment for muscle and soft tissue injuries"
  },
  { 
    id: '7',
    name: "Post Surgical Rehab", 
    imageSource: require('./assets/PostSurgicalRehab.png'),
    description: "Rehabilitation programs after surgery"
  },
  { 
    id: '8',
    name: "Trigger Point Therapy", 
    imageSource: require('./assets/TriggerPointTherapy.png'),
    description: "Targeted treatment for muscle knots"
  },
  { 
    id: '9',
    name: "Deep Tissue Therapy", 
    imageSource: require('./assets/DeepTissueTherapy.png'),
    description: "Intensive massage for chronic muscle tension"
  },
  { 
    id: '10',
    name: "Cardiologist", 
    imageSource: require('./assets/Cardiologist.png'),
    description: "Heart specialists for cardiovascular health"
  },
  { 
    id: '11',
    name: "Orthopedic", 
    imageSource: require('./assets/Orthopedic.png'),
    description: "Bone and joint specialists"
  },
  { 
    id: '12',
    name: "General Doctors", 
    imageSource: require('./assets/GeneralDoctors.png'),
    description: "Comprehensive medical care"
  }
];

export default function ServicesList() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState(healthcareServices);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredServices(healthcareServices);
    } else {
      const filtered = healthcareServices.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchQuery]);

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.serviceItem}
      onPress={() => navigation.navigate("BookingPage", {
        name: item.name,
        imageSource: item.imageSource
      })}
    >
      <View style={styles.imageContainer}>
        <Image source={item.imageSource} style={styles.serviceImage} resizeMode="contain" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDescription}>{item.description}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Healthcare Services</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Icon name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Services List */}
      <FlatList
        data={filteredServices}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="magnify-close" size={40} color="#666" />
            <Text style={styles.emptyText}>No services found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f0f0f',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '80%',
    height: '80%',
  },
  textContainer: {
    flex: 1,
  },
  serviceName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  serviceDescription: {
    color: '#888',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginTop: 16,
  },
});