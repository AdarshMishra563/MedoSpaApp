import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StyleSheet,
  Animated,
  Alert
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from './useCart'; // Import the useCart hook
import ErrorPopup from './ErrorPopup';

const { width } = Dimensions.get('window');

const assistants = [
  {
    id: 'assistant1', // Added unique IDs
    title: 'Basic Care Assistant',
    description: 'Helps with hygiene, feeding, and basic mobility.',
    price: 25, // Added pricing
    duration: '4 hours minimum'
  },
  {
    id: 'assistant2',
    title: 'Post-Surgery Attendant',
    description: 'Supports recovery after operations or treatments.',
    price: 30,
    duration: '8 hours minimum'
  },
  {
    id: 'assistant3',
    title: 'Elderly Care GDA',
    description: 'Trained in caring for elderly with empathy and patience.',
    price: 28,
    duration: '4 hours minimum'
  },
  {
    id: 'assistant4',
    title: 'Physically Disabled Support',
    description: 'Assists individuals with physical impairments.',
    price: 32,
    duration: '4 hours minimum'
  },
  {
    id: 'assistant5',
    title: 'Long-term Home Care GDA',
    description: 'Available for extended care in home settings.',
    price: 35,
    duration: '12 hours minimum'
  },
];

const AssistantCard = ({ item, index, navigation, addToCart,setErrorPopup }) => {
  const translateX = useRef(new Animated.Value(index % 2 === 0 ? -width : width)).current;


  useEffect(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      speed: 12,
      bounciness: 10,
    }).start();
  }, []);
    const handleAddToCart = async () => {
    try {
       addToCart({
        id: item.id,
        name: item.title,
        description: item.description,
        price: item.price,
        duration: item.duration,
        imageSource: require('./assets/Assistants.png')
      });
    setErrorPopup("Added to Cart");
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  const handleBook = async () => {
 
    
      navigation.navigate('BookingPage', {
        name: item.title,
        imageSource: require('./assets/Assistants.png'),
      });
    }

  return (
    <Animated.View style={[styles.card, { transform: [{ translateX }] }]}>
      <View style={styles.cardHeader}>
    
        <Text style={styles.cardTitle}>{item.title}</Text>
        <TouchableOpacity onPress={handleAddToCart}>
            
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="medical-bag" size={20} color="#555" />
          </View>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardDesc}>{item.description}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>${item.price}/hr</Text>
        <Text style={styles.durationText}>{item.duration}</Text>
      </View>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={handleBook}
      >
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const GeneralDutyAssistantsPage = () => {
     const [errorPopup,setErrorPopup]=useState(null);
  const navigation = useNavigation();
  const { addToCart, cartItems } = useCart(); 

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
            {errorPopup && <ErrorPopup message='Added to Treatment Bag' Color='green' onHide={()=>{setErrorPopup(null)}}/>}
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>General Duty Assistants</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Cart')}
            style={styles.cartIcon}
          >
            <MaterialCommunityIcons name="medical-bag" size={26} color="#333" />
            {cartItems.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {assistants.map((item, index) => (
          <AssistantCard 
            key={item.id} 
            item={item} 
            index={index} 
            navigation={navigation}
            addToCart={addToCart}
            setErrorPopup={setErrorPopup}
          />
        ))}

        <View style={styles.certifiedBox}>
          <MaterialCommunityIcons name="certificate" size={22} color="#007aff" />
          <Text style={styles.certifiedText}>
            All assistants are trained and background-verified professionals.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  cartIcon: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -3,
    top: -2,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  card: {
    width: width * 0.92,
    alignSelf: 'center',
    backgroundColor: '#e1dfdf',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  iconCircle: {
    borderWidth: 0.5,
    borderColor: '#aaa',
    borderRadius: 25,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDesc: {
    fontSize: 14,
    marginTop: 8,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 5,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    marginTop: 14,
    backgroundColor: '#d4d0cc',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#aaa',
  },
  bookButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  certifiedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    marginLeft: 6,
    marginBottom: 28,
  },
  certifiedText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
  },
});

export default GeneralDutyAssistantsPage;