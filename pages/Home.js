import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import LocationTracker from './LocationTracker'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function Home() {
  const token = useSelector((state) => state.user.userToken);
  const currentServiceLocation = useSelector((state) => state.user.location);
  console.log(currentServiceLocation);
const navigation=useNavigation();
  return (
    <SafeAreaView>
      <View  >
           <TouchableOpacity  onPress={()=>{navigation.navigate("Login")}}><Text style={{fontSize:18,color:"black"}}>Welcome to Dashboard</Text></TouchableOpacity>
         </View>
      <LocationTracker />
      </SafeAreaView>
  );
}
