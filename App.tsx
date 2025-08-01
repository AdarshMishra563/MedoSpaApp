import { View, Text, Platform, Vibration } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';
import { Alert, AppState } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Dashboard from './pages/dashboard';
import Login from './/pages/login';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './pages/Home';
import Account from './pages/Account';
import Bookings from './pages/Bookings';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './Redux/store';
import axios from 'axios';
import LocationScreen from './pages/Location';
import PlansScreen from './pages/PlansScreen';
import LocationTracker from './pages/LocationTracker';
import { clearUserInfo, updateUserInfo } from './Redux/userSlice';
import BookingPage from './pages/BookingPage';
import MassageTherapiesPage from './pages/MedicalMassages';
import HomeServicesScreen from './pages/DoctorsOnCall';
import GeneralDutyAssistantsPage from './pages/AssistantsBooking';
import ServicesList from './pages/Appointment';
import CartScreen from './pages/CartScreen';
import { MenuProvider } from 'react-native-popup-menu';
import PastBookingsScreen from './pages/PastBookings';
import ErrorPopup from './pages/ErrorPopup';
import NotificationPopup from './pages/NotificationPopup';
import NotificationScreen from './pages/NotificationPage';
import FeedbackScreen from './pages/FeedbackScreen';
import AdminBookingsScreen from './pages/Adminscreen';


const Stack = createNativeStackNavigator();
const Tab=createBottomTabNavigator();
const TabNavigator=()=>{

const navigation=useNavigation();
const token=useSelector(state=>state?.user?.userToken);
const userpicture=useSelector(state=>state?.user?.userInfo?.picture);
const [image,setimage]=useState(userpicture);
const dispatch=useDispatch();
const handleUserInfoUpdate = (dispatch, { name, phoneNumber,picture }) => {
  let isValidPhone = false;

  if (phoneNumber?.startsWith('+')) {
    isValidPhone = phoneNumber.length === 13;
  } else {
    isValidPhone = phoneNumber.length === 10 && /^\d+$/.test(phoneNumber);
  }

  const finalName = name;

  if (isValidPhone || finalName) {
    dispatch(updateUserInfo({
      name: finalName,
      phoneNumber: isValidPhone ? phoneNumber : null,
      picture:picture
    }));
  } else {
    dispatch(clearUserInfo());
  }
};
useEffect(()=>{

const fetch=async ()=>{

const res=await axios.get("https://medospabackend.onrender.com/data/getUser",{

  headers:{Authorization:`Bearer ${token}`}
});

if(res.status==200){

  handleUserInfoUpdate(dispatch, {name:res?.data.name,phoneNumber:res?.data.phoneNumber,picture:res?.data.picture});
  console.log(token,res)
  setimage(res.data.picture)
}

}
if(token){
fetch();

}else{
          dispatch(clearUserInfo());

navigation.navigate("Login")

}
})
  return(
 <Tab.Navigator
  screenOptions={({ route }) => ({
    headerShown: false,
    safeAreaInsets: { bottom: 0 },
    tabBarStyle:{ backgroundColor:"#f0f0f0",elevation:0},
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
const isAdmin = useSelector(state => state?.user?.userInfo.admin);
    const getInitialRoute = () => {
    if (!token) return 'Login';
    return isAdmin ? 'AdminPage' : 'Dashboard';
  };

  return (
    <MenuProvider>
    <NavigationContainer>
    <Stack.Navigator   initialRouteName={getInitialRoute()}  screenOptions={{headerShown:false}}>
<Stack.Screen name='Login' component={Login}/>
<Stack.Screen name='Dashboard' component={TabNavigator}/>
<Stack.Screen name='Location' component={LocationScreen}/>
<Stack.Screen name='PlansScreen' component={PlansScreen}/>
<Stack.Screen name='BookingPage' component={BookingPage}/>
<Stack.Screen name='DoctorsOnCall' component={HomeServicesScreen}/>
<Stack.Screen name='MassageBooking' component={MassageTherapiesPage}/>
<Stack.Screen name='AssistantsBooking' component={GeneralDutyAssistantsPage}/>
<Stack.Screen name='Appointment' component={ServicesList}/>
<Stack.Screen name='Cart' component={CartScreen}/>
<Stack.Screen name='PastBookings' component={PastBookingsScreen}/>
<Stack.Screen name='NotificationPage' component={NotificationScreen}/>
<Stack.Screen name='FeedbackScreen' component={FeedbackScreen}/>
      <Stack.Screen name='AdminPage' component={AdminBookingsScreen}/>
    </Stack.Navigator></NavigationContainer></MenuProvider>
  )
}
export default function App(){
const [error,setError]=useState(null)
useEffect(() => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    setError(remoteMessage?.notification?.body);
   Vibration.vibrate([0, 200, 200, 200]);
  });

  return unsubscribe;
}, []);
useEffect(() => {
  const requestPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        console.log(enabled ? '✅ iOS permission granted.' : '🚫 iOS permission denied.');
      } else if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
          if (result === RESULTS.GRANTED) {
            console.log('✅ Android permission granted.');
          } else if (result === RESULTS.DENIED) {
            console.warn('🚫 Android permission denied (user can be asked again).');
          } else if (result === RESULTS.BLOCKED) {
            console.error('❌ Android permission permanently blocked. Go to settings.');
          }
        } else {
          console.log('✅ No runtime notification permission required for Android < 13');
        }
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  };

  requestPermission();
}, []);

  return (
      <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        
        {error && <NotificationPopup message={error} Color='green'   onHide={() => setError(null)}/>}
        <Main />
      </PersistGate>
    </Provider>
  )
}