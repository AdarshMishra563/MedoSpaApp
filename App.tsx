import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Dashboard from './pages/dashboard';
import Login from './/pages/login';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './pages/Home';
import Account from './pages/Account';
import Bookings from './pages/Bookings';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './Redux/store';
import axios from 'axios';
import LocationScreen from './pages/Location';
import PlansScreen from './pages/PlansScreen';


const Stack = createNativeStackNavigator();
const Tab=createBottomTabNavigator();
const TabNavigator=()=>{
const [image,setimage]=useState("");
const navigation=useNavigation();
const token=useSelector(state=>state?.user?.userToken);
useEffect(()=>{

const fetch=async ()=>{

const res=await axios.get("https://medospabackend.onrender.com/data/getUser",{

  headers:{Authorization:`Bearer ${token}`}
});

if(res.status==200){
  console.log(token,res)
  setimage(res.data.picture)
}

}
if(token){
fetch();

}else{
navigation.navigate("Login")

}
})
  return(
 <Tab.Navigator
  screenOptions={({ route }) => ({
    headerShown: false,
    tabBarStyle:{ backgroundColor:"#f0f0f0"},
    tabBarIcon: ({ focused, color, size }) => {
      if (route.name === 'Home') {
        return (
          <View
            style={{
              width:26,height:26,
             position:"relative",
              borderRadius: 4,
              borderWidth: focused ? 2 : 0,
              borderColor: focused ? '#333638ff' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              resizeMode="cover"
              source={require('./pages/1752603563232.jpg')}
              style={{ width: 24, height: 24,position:"absolute",zIndex:-1 }}
            />
          </View>
        );
      } else if (route.name === 'Account') {
        return (
          <View
            style={{
              
              width: 28, height: 28,borderRadius:14,
              borderWidth: focused ? 2 : 0,
              borderColor: focused ? '#333638ff' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              resizeMode="cover"
              source={{uri:image?image:"https://tse4.mm.bing.net/th/id/OIP.9zsJAmSYTJEWaxoDi8uYigHaGl?pid=Api&P=0&h=180"}}
              style={{ width: 24, height: 24,borderRadius:12 }}
            />
          </View>
        );
      } else if (route.name === 'Bookings') {
        return (
          <View
  style={{
    padding: 2,
   
    
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <Icon
    name="calendar"
    size={size}
    color={focused ? 'black' : 'gray'}
  />
</View>
        );
      }
    },
     tabBarActiveTintColor: 'black',
    tabBarActiveBackgroundColor: 'transparent',
    tabBarInactiveTintColor: 'gray',
  })}
>
  <Tab.Screen   options={{ tabBarLabel: 'MedoSpa' }} name="Home" component={Home} />
  
  <Tab.Screen name="Bookings" component={Bookings} />
  <Tab.Screen name="Account" component={Account} />
</Tab.Navigator>


  )
}
 function Main() {


  const token=useSelector(state=>state?.user?.userToken);

  
  return (
    <NavigationContainer>
    <Stack.Navigator  initialRouteName={token?"Dashboard":"Login"} screenOptions={{headerShown:false}}>
<Stack.Screen name='Login' component={Login}/>
<Stack.Screen name='Dashboard' component={TabNavigator}/>
<Stack.Screen name='Location' component={LocationScreen}/>
<Stack.Screen name='PlansScreen' component={PlansScreen}/>
      
    </Stack.Navigator></NavigationContainer>
  )
}
export default function App(){



  return (
      <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Main />
      </PersistGate>
    </Provider>
  )
}