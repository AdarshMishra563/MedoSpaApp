import { View, Text, Animated, TextInput, TouchableOpacity, ActivityIndicator, Dimensions, Modal, Image, Platform, StatusBar } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin,GoogleSigninButton } from '@react-native-google-signin/google-signin';
import axios from 'axios'
import { useNavigation } from '@react-navigation/native';
const {height,width}=Dimensions.get('window');
import auth from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/auth';
import { findPackageJSON } from 'module';
import { useDispatch } from 'react-redux';
import { login } from '../Redux/userSlice';

const statusbarheight=Platform.OS==='android'?StatusBar.currentHeight:0;
export default function Login() {
const translateX = useRef(new Animated.Value(300)).current;
  const translateY = useRef(new Animated.Value(0)).current;
    const inputTranslateX = useRef(new Animated.Value(-200)).current;
  const inputOpacity = useRef(new Animated.Value(0)).current;
    const texts = ['M','e', 'd','o', 'S','p','a'];
  const animations = useRef(texts.map(() => new Animated.Value(300))).current;
const [phonenumber,setphonenumber]=useState('');
const [loading, setLoading] = useState(false);
const [error,seterror]=useState('');
  const [modalVisible, setModalVisible] = useState(false);
const [modalerror,setmodalerror]=useState('')
   const [otp, setOtp] = useState(['', '', '', '','','']);
  const inputs = useRef([]);
const [verifying, setVerifying] = useState(false);
const [requesterror,setrequesterror]=useState('');
const [requestLoader,setRequestLoader]=useState(false);
const [callNumber,setCallNumber]=useState('');
const navigation=useNavigation();
  const slideAnim = useRef(new Animated.Value(height)).current;
 const dispatch = useDispatch();
  useEffect(()=>{GoogleSignin.configure({
  webClientId: '323015390490-en5pnrvqe8kjr17kffkact7oq0p5jirv.apps.googleusercontent.com',
});},[])
      useEffect(() => {
    const animatedTransitions = animations.map(anim =>
      Animated.timing(anim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, animatedTransitions).start();
  }, []);
  const startAnimation = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,duration:300,
        useNativeDriver: true,
      }),
     
   Animated.spring(inputTranslateX, {
        toValue: 0,
        duration:400,
        useNativeDriver: true,
      }),
      Animated.timing(inputOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

     
    ]).start();
  };
   useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [])
useEffect(()=>{startAnimation()},[]);
 const openModal = () => {
    setModalVisible(true);
    Animated.timing(modalTranslateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  const closeModal = () => {
    Animated.timing(modalTranslateY, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };
const handlePress = async () => {
if(phonenumber.length==0){
    seterror("Enter a number first");
    return 
}
if(phonenumber.length<10){
    seterror("Not a valid phone number");
    return 
}

    setLoading(true);
    seterror('');

    try{
setgoogleloader(false)
        const number='+91'+phonenumber
const res= await axios.post("https://medospabackend.onrender.com/api/send-otp",{phoneNumber:number});
if(res.status==200){

    setmodalerror("");
    setOtp(['', '', '', '','',''])
    openModal();
       }

    }catch(e){
        console.log(e,phonenumber);
        seterror("Something went wrong. Check the number")

    }finally{
        setLoading(false)
    }
  
  };
  const handleChange = (text, index) => {
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < otp.length - 1) {
      inputs.current[index + 1].focus();
    }
  };
   const handleVerify =async () => {
    const enteredOtp = otp.join('');
    const number="+91"+phonenumber;
    setmodalerror("");
    if(enteredOtp.length<6){
        setmodalerror("Otp must be 6 digits");
        return
    }
   try{    setVerifying(true);
const res=await axios.post("https://medospabackend.onrender.com/api/verify-otp",{

    phoneNumber:number,otp:enteredOtp
})
if(res.status==200){

  dispatch(login(res.data.token))
navigation.navigate("Dashboard")
}

   }catch(e){setmodalerror(e.response.data.error);
   
   }finally {
    setVerifying(false); 
  }
  
  };
    const modalTranslateY = useRef(new Animated.Value(300)).current;
  useEffect(() => {
    if (modalVisible) {
      Animated.spring(modalTranslateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);
const handleKeyPress = (e, index) => {
  if (e.nativeEvent.key === 'Backspace') {
    if (otp[index] === '') {
      if (index > 0) {
        inputs.current[index - 1].focus();
      }
    }
  }
};
const getCall=async ()=>{

    setrequesterror("")
if(callNumber.length<10 ){
    setrequesterror("Enter a valid Number")
    return

}
try{setRequestLoader(true);

    
}catch(e){
setrequesterror(e.message)
}finally{setRequestLoader(false)}

};
const [googleloader,setgoogleloader]=useState(false)
const [googleerror,setgoogleerror]=useState("")
  const handleGoogleSignIn = async () => {
    setgoogleerror("")
     await GoogleSignin.signOut();
    
    try {
      await GoogleSignin.hasPlayServices();
   setgoogleloader(true)
     
      const  idToken  = await GoogleSignin.signIn();

      const res=await axios.post("https://medospabackend.onrender.com/auth/google-login",{
        idToken:idToken?.data?.idToken
      })

      
    if(res.status==200){
      dispatch(login(res.data.token))
      navigation.navigate("Dashboard")
    }
     
    } catch (error) {
    const errormsg=error.response.data.message?error.response.data.message:error.message;
    setgoogleerror(errormsg);
    }finally{setgoogleloader(false)}
  };
  return (
    <View style={{backgroundColor:"#f0f0f0",height:height,marginTop:statusbarheight}}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />
        <View style={{ flexDirection: 'row',padding:10 }}>
        <Animated.Image source={require('./1752603563232.jpg')} style={{height:34,width:34,marginRight:4,marginTop:4,resizeMode:"contain" , transform: [{ translateX: animations[0] }]}}/>
         {texts.map((word, index) => (
        <Animated.View
          key={index}
          style={{flexDirection:"column",
            transform: [{ translateX: animations[index] }],
          }}
        >
          <Text style={{ fontSize: 32, fontWeight: '500', color: 'gray',padding:2 }}>
            {word}
          </Text>
        </Animated.View>
      ))}

</View>
  <View style={{ justifyContent: 'center', alignItems: 'center' ,marginTop:28}}> <Animated.View style={{margin:8,
        transform: [{ translateX: inputTranslateX }],
        opacity: inputOpacity
      }}>
        <TextInput
          placeholder="Enter phone number"
          placeholderTextColor="#374151"
          
        style={{borderBottomWidth: 1,  backgroundColor: '#D1D5DB',borderRadius:4,height:40,
  borderBottomColor: 'black',width:292}}
          keyboardType="phone-pad"
onChangeText={(e)=>{setphonenumber(e)}}
        />
      </Animated.View ></View>

  <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 12 }}>
  <Animated.View
    style={{
      
      transform: [{ translateX: inputTranslateX }],
      opacity: inputOpacity,
    }}
  >
    <TouchableOpacity
      style={{
        padding:8,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 6,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
        minWidth:120
      }}
        onPress={handlePress}
          disabled={loading}
      
    >
       {loading ? (
            <ActivityIndicator size="small" color="black" />
          ) : (
            <Text style={{ fontSize: 16, color: 'black' }}>Get OTP</Text>
          )}
    </TouchableOpacity>
  </Animated.View>
  {error !== '' && (
    <View style={{ marginTop: 8, alignSelf: 'flex-end', marginRight: 32 }}>
      <Text style={{ color: 'red', fontSize: 14, textAlign: 'right' }}>{error}</Text>
    </View>
  )}
</View>
 <Modal transparent visible={modalVisible} animationType="none">
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-end' }}>
    <Animated.View
      style={{
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        transform: [{ translateY: modalTranslateY }],
      }}
    >
      
      <TouchableOpacity
        onPress={closeModal}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1,
          padding: 8,
        }}
      >
        {modalerror!==""?<><Text style={{ fontSize: 20, color: 'red' }}>✖️</Text></>:<></>}
      </TouchableOpacity>

      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 20, marginTop: 8 }}>Enter OTP</Text>

     
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            value={digit}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onChangeText={(text) => handleChange(text, index)}
            keyboardType="number-pad"
            maxLength={1}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              backgroundColor: '#f9f9f9',
              borderRadius: 8,
              textAlign: 'center',
              fontSize: 20,
              padding: 10,
              width: 48,
            }}
          />
        ))}
      </View>

    
      {modalerror !== '' && (
        <View style={{ alignSelf: 'flex-end', marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: 'red', textAlign: 'right' }}>{modalerror}</Text>
        </View>
      )}

    
      <TouchableOpacity
        onPress={handleVerify}
        style={{
          backgroundColor: '#000',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
       {verifying ? (
    <ActivityIndicator color="white" />
  ) : (
    <Text style={{ color: 'white', fontSize: 16 }}>Verify OTP</Text>
  )}
      </TouchableOpacity>
    </Animated.View>
  </View>
</Modal>
  
    <Animated.View style={{margin:8,
        transform: [{ translateX: inputTranslateX }],
      
      }}><View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
    <View style={{ flex: 1, height: 1, backgroundColor: '#ccc',marginLeft:14 }} />
    <Text style={{ marginHorizontal: 8, color: '#666' }}>or</Text>
    <View style={{ flex: 1, height: 1, backgroundColor: '#ccc',marginRight:14 }} /></View>
    <View style={{ justifyContent: 'center', alignItems: 'center' ,marginTop:28}}>
     {googleloader ?<> <ActivityIndicator size="small" color="black" /></>: <GoogleSigninButton
  style={{ width: 292, height: 48, alignSelf: 'center' }}
  size={GoogleSigninButton.Size.Wide}
  color={GoogleSigninButton.Color.Light}
  onPress={handleGoogleSignIn}
/>}
{ googleerror!=="" && <Text style={{ fontSize: 12, color: 'red', textAlign: 'right',marginTop:8 }}>{googleerror}</Text>}
  </View> 
    
    </Animated.View>
 <Animated.View
      style={{
       padding:14,marginTop:32,
          transform: [{ translateY: slideAnim }],
        }}
    >
    <Text style={{fontSize:26,color:"gray"}}>Emergency Service</Text>
<View  style={{ justifyContent: 'center', alignItems: 'center' ,marginTop:30}}>
     <TextInput
     value={callNumber}
          placeholder="Enter phone number to get a call from us"
          placeholderTextColor="#374151"
          
        style={{borderBottomWidth: 1,  backgroundColor: '#FFFACD',borderRadius:4,height:40,
  borderBottomColor: 'black',width:292}}
          keyboardType="phone-pad"
onChangeText={(e)=>{setCallNumber(e)}}
        />
        
         <TouchableOpacity
      style={{
        padding:8,
        marginTop:16,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 6,
        backgroundColor: '#f2f2f2',
        alignItems: 'center',
        minWidth:120
      }}
        onPress={getCall}
          disabled={requestLoader}
      
    >{requestLoader ? (
            <ActivityIndicator size="small" color="black" />
          ) : (
            <Text style={{ fontSize: 16, color: 'black' }}>Request</Text>
          )}</TouchableOpacity>
     {requesterror !== '' && (
    <View style={{ marginTop: 8, alignSelf: 'flex-end', marginRight: 24 }}>
      <Text style={{ color: 'red', fontSize: 14, textAlign: 'right' }}>{requesterror}</Text>
    </View>
  )}

  <Text  style={{ color: '#2A2A2A', fontSize: 14,marginTop:28}}>An assistent will call you as soon as possible</Text>
        </View>
    
    </Animated.View>
 
    </View>
  )
}