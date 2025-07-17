import { View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
const statusbarheight=Platform.OS==='android'?StatusBar.currentHeight:0;
export default function Dashboard() {
    const navigation=useNavigation();
  return (
    <View  style={{marginTop:statusbarheight}}>
      <TouchableOpacity  onPress={()=>{navigation.navigate("Login")}}><Text style={{fontSize:18,color:"black"}}>Welcome to Dashboard</Text></TouchableOpacity>
    </View>
  )
}