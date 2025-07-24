import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StyleSheet,
  Animated,
 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from './useCart';
import { useSelector } from 'react-redux';
import ErrorPopup from './ErrorPopup';

const { width } = Dimensions.get('window');

const therapies = [
  {
    id: 'massage1', // Added unique IDs for cart operations
    title: 'Ayurveda Massage',
    description: 'Traditional Indian healing therapy for body balance.',
    price: 60, // Added price for cart
  },
  {
    id: 'massage2',
    title: 'Kerala Massage',
    description: 'Deep relaxation using herbal oils and rhythmic strokes.',
    price: 70,
  },
  {
    id: 'massage3',
    title: 'Swedish Massage',
    description: 'Classic European technique for relaxation and circulation.',
    price: 65,
  },
  {
    id: 'massage4',
    title: 'Stone Therapy',
    description: 'Hot stone massage to ease muscle tension and stress.',
    price: 80,
  },
];

const MassageCard = ({ item, index, navigation,addToCart,setErrorPopup }) => {
  const translateX = useRef(new Animated.Value(index % 2 === 0 ? -width : width)).current;


  useEffect(() => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      speed: 12,
      bounciness: 10,
    }).start();
  }, []);

 const handleBook = async () => {
    console.log("book")
    try {
      await addToCart({
        id: item.id,
        name: item.title,
        description: item.description,
        price: item.price,
        imageSource: require('./assets/16.png')
      });
      setErrorPopup("Added To Cart")
    
    } catch (error) {
        setErrorPopup("Alredy in Cart")
      Alert.alert('Error', 'Failed to add to cart');
    }
  };
  return (
    <Animated.View style={[styles.card, { transform: [{ translateX }] }]}>
     
      <View style={styles.cardHeader}>
  
        <Text style={styles.cardTitle}>{item.title}</Text>
        <TouchableOpacity onPress={handleBook}><View style={styles.iconCircle}>
          <MaterialCommunityIcons name="medical-bag" size={20} color="#555" />
        </View></TouchableOpacity>
      </View>
      <Text style={styles.cardDesc}>{item.description}</Text>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() =>
          navigation.navigate('BookingPage', {
            name: item.title,
            imageSource: require('./assets/16.png'),
          })
        }
      >
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MassageTherapiesPage = () => {
const [errorPopup,setErrorPopup]=useState(null);
    const items=useSelector(state=>state.cart.items);
    console.log(items)
  const navigation = useNavigation();
const { addToCart } = useCart();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
        
      <ScrollView style={styles.container}>
              {errorPopup&& <ErrorPopup message="Added to Treatment Bag" Color='green' onHide={()=>{setErrorPopup(null)}}/>}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Massage Therapies</Text>
        </View>

        {therapies.map((item, index) => (
          <MassageCard key={index} item={item} index={index} navigation={navigation} addToCart={addToCart} setErrorPopup={setErrorPopup}/>
        ))}

        <View style={styles.certifiedBox}>
          <MaterialCommunityIcons name="certificate" size={22} color="#007aff" />
          <Text style={styles.certifiedText}>
            All therapists are certified wellness professionals.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MassageTherapiesPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
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
    marginBottom:28
  },
  certifiedText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
  },
});
