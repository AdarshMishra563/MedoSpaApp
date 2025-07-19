import {
  View,
  Text,
 
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Button,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Entypo';      
import FAIcon from 'react-native-vector-icons/FontAwesome'; 
import NewIcon  from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { logout } from '../Redux/userSlice';

const {width,height}=Dimensions.get("window")
export default function Account() {
  const token = useSelector((state) => state?.user?.userToken);
  const [data, setData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editInfo, setEditInfo] = useState({ name: '', email: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
const navigation=useNavigation()
  const [updateerror,setupdateerror]=useState("")
const [address,setAddress]=useState(null);
const dispatch=useDispatch();
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get('https://medospabackend.onrender.com/data/getUser', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200) {
          setData(res.data);
          setEditInfo({
            name: res.data.name || '',
            email: res.data.email || '',
            phoneNumber: res.data.phoneNumber || '',
          });
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const handleSave = async () => {
    setupdateerror("")
    setSaveLoading(true);
    try {
      const res = await axios.put(
        'https://medospabackend.onrender.com/data/updateUser',
        {
          name: editInfo.name,
          email: editInfo.email,
          phoneNumber: editInfo.phoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        setData(res.data);
        setModalVisible(false);
      }
    } catch (error) {
    

      
  const err = error?.response?.data?.message || error?.message || "Error saving data";
  setupdateerror(err);
    } finally {
      setSaveLoading(false);
    }
  };
 useFocusEffect(() => {
  StatusBar.setBarStyle('dark-content');
  if (Platform.OS === 'android') {
    StatusBar.setBackgroundColor('#f0f0f0');
  }
});
useEffect(()=>{
const location= async ()=>{
const storedLoc = await AsyncStorage.getItem('userLocation');
const parsedLoc = storedLoc ? JSON.parse(storedLoc) : null;
setAddress(parsedLoc)

}
location();
},[])
const button=['Doctors','Saved','Help']
const icons = ['person','bookmark', 'help-outline', ]
  if (loading || !data) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="gray" />
      </SafeAreaView>
    );
  }
const settingsList = [
 

{name:"Past Bookings",icon:"assignment",screen:"PastBookings"},
  {name:"Completed Transactions",icon:"payments",screen:"PastTransactions"},
   { name: 'My Plans', icon: 'event-note', screen: 'PlansScreen' },
   { name: 'Manage addresses', icon: 'location-on', screen: 'Location' },
  { name: 'Manage payment methods', icon: 'payment', screen: 'PaymentScreen' },
  
  { name: 'Wallet', icon: 'account-balance-wallet', screen: 'WalletScreen' },
  { name: 'Settings', icon: 'settings', screen: 'SettingsScreen' },
    { name: 'Refer', icon: 'star-border', screen: 'ReferScreen' },
  
];
  return (
    <SafeAreaView style={{ flex: 1,paddingTop:12,backgroundColor:"#f0f0f0" }}>
       <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />
      <View style={[styles.container,{backgroundColor:"#f0f0f0",height:100,padding:9}]}>
         <Image
          source={{
            uri:
              data.picture ||
              'https://tse4.mm.bing.net/th/id/OIP.9zsJAmSYTJEWaxoDi8uYigHaGl?pid=Api&P=0&h=180',
          }}
          style={styles.avatar}
        />
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
  <Text style={styles.nameText} numberOfLines={0}>
    {data.name ? data.name : 'Verified Customer'}
  </Text>
  <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
    <Icon name="pencil" size={16} color="#000" />
  </TouchableOpacity>
</View>
          {data.phoneNumber ? <Text style={styles.subText}>{data.phoneNumber}</Text> : null}
          {data.email ? <Text style={styles.subText}>{data.email}</Text> : null}
        </View>

       
      </View>

     
      
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Info</Text>

            <TextInput
              placeholder="Name"
              value={editInfo.name}
              placeholderTextColor="gray"
              onChangeText={(text) => setEditInfo((prev) => ({ ...prev, name: text }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="gray"
              value={editInfo.phoneNumber}
              onChangeText={(text) => setEditInfo((prev) => ({ ...prev, phoneNumber: text }))}
              style={styles.input}
              keyboardType="phone-pad"
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="gray"
              value={editInfo.email}
              onChangeText={(text) => setEditInfo((prev) => ({ ...prev, email: text }))}
              style={styles.input}
              keyboardType="email-address"
            />
{updateerror !=="" &&<Text style={{fontSize:10,color:"red"}}>{updateerror}</Text>}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() =>{setModalVisible(false);setSaveLoading(false),setupdateerror("")}}
                style={[styles.button, { backgroundColor: '#ccc' }]}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.button, { backgroundColor: '#ccc' }]}
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
<View style={{ marginTop: 2,padding:6 }}>
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 }}>
    {button.map((name, index) => (
      <TouchableOpacity
        key={index}
        style={{
          backgroundColor: '#76787d',
          padding: 7,
          width: 90,
          borderRadius: 18,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={()=>{navigation.navigate(name)}}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <NewIcon name={icons[index] || 'bookmark'} size={16} color="white" />
          <Text style={{ fontSize: 14, color: 'white', marginLeft: 4 }}>{name}</Text>
        </View>
      </TouchableOpacity>
    ))}
  </View>
</View>

<View  style={{height:6,backgroundColor:"#c6c7c9ff",marginTop:4,width:width}}/>
 <View  style={{padding:10}}>

    <View style={styles.settingsList}>
        {settingsList.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.settingsItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.settingsLeft}>
              <NewIcon name={item.icon} size={24} />
              <Text style={styles.settingsLabel}>{item.name}</Text>
            </View>
            <NewIcon  name="chevron-right" size={24} />
          </TouchableOpacity>
        ))}
      </View>
 </View>
<TouchableOpacity style={styles.button3} onPress={()=>{dispatch(logout());navigation.navigate("Login")}}>
      <NewIcon name="logout" size={22} color="white" />
      <Text style={styles.text4}>Logout</Text>
    </TouchableOpacity>

    </SafeAreaView>
  );
}




const styles = StyleSheet.create({

    container2: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  }, button3: {
    width: width * 0.8,
    backgroundColor: '#de514fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    
  },
  text4: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  wave: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
  },
  container: {
    flexDirection: 'row',
    
    marginTop:12
    
  },
   settingsList: {
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingLeft:4,
    paddingRight:2
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsLabel: {
    marginLeft: 12,
    fontSize: 16,
  },
  referCard: {
    marginTop: 20,
    backgroundColor: '#f0ecff',
    padding: 16,
    borderRadius: 12,
  },
  referTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  referDesc: {
    fontSize: 14,
    color: '#444',
  },
  infoSection: {
    flex: 1,marginTop:5
    
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    marginLeft: 1,
    marginRight:12,
    marginTop:6,
    backgroundColor: '#ccc',
  },
 nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    maxWidth: '100%',
    gap: 2,
  },
  nameText: {
    fontSize: 28,
 
    flexShrink: 1,
    fontWeight:"bold",
    flexWrap: 'wrap',
  },
  editButton: {
    paddingLeft: 6,
    paddingTop: 2,
  },
  subText: {
    fontSize: 14,
    color: '#555',
  },
  editButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginTop:4,
    backgroundColor: 'transparent',
    borderRadius: 6,
  },
  editText: {
    fontSize: 16,
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#bbb',
    marginBottom: 14,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
});
