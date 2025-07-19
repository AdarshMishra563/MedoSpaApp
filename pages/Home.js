import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, Platform, ScrollView, Dimensions, Animated, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';
import ImageButton from './Button';
import { SvgXml } from 'react-native-svg';
const { width, height } = Dimensions.get('window');

const medicalBagSvg = `
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="20" width="48" height="36" rx="6" fill="#EAEAEA" stroke="#333" stroke-width="2"/>
  <path d="M24 8H40V20H24V8Z" fill="#FFFFFF" stroke="#333" stroke-width="2"/>
  <path d="M30 34V28H34V34H40V38H34V44H30V38H24V34H30Z" fill="#4CAF50"/>
</svg>

`;

const images = [
  { id: '1', uri: require('./assets/12.png') },
  { id: '2', uri: require('./assets/13.png') },
  { id: '3', uri: require('./assets/16.png') },
  { id: '4', uri: require('./assets/15.png') },
];
const healthcareRoles = [
  { name: "Physiotherapist", uri: require('./assets/Physiotherapist.png') },
  { name: "Nurses", uri:require('./assets/13.png')  },
  { name: "Assistants", uri:require('./assets/Assistants.png')  },
  { name: "Medical Massage", uri: require('./assets/MedicalMassage.png')  },
  { name: "Doctors on Call", uri: require('./assets/OnCall.png')  }
];

export default function Home() {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const scrollX = useRef(new Animated.Value(0)).current;
  const texts = ['M', 'e', 'd', 'o', 'S', 'p', 'a'];
const [key,setkey]=useState(0)
 
  const CARD_WIDTH = width * 0.9; 
  const CARD_MARGIN = width * 0.02; 
  const PEEK_WIDTH = (width - CARD_WIDTH) / 2; 
useEffect(()=>{setTimeout(()=>{setkey(prev=>prev+1)},100)},[])
  useFocusEffect(() => {
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#e1dfdfff');
    }
  });

  const onScrollEnd = (e) => {
    const contentOffset = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + CARD_MARGIN * 2));
    setCurrentIndex(index);
  };
useEffect(() => {
  const interval = setInterval(() => {
    let nextIndex = currentIndex + direction;

    
    if (nextIndex >= images.length - 1 || nextIndex <= 0) {
      setDirection(-direction); 
    }

   
    nextIndex = Math.max(0, Math.min(nextIndex, images.length - 1));
    
    flatListRef.current?.scrollToIndex({
  index: nextIndex,
  animated: true,
  viewOffset: PEEK_WIDTH - CARD_MARGIN, 
});
    setCurrentIndex(nextIndex);
  }, 10000);

  return () => clearInterval(interval);
}, [currentIndex, direction]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
       {key==0&& <StatusBar barStyle="dark-content" backgroundColor="#e1dfdfff" />}
      <View style={{ flexDirection: 'row', padding: 10, alignItems: 'center', backgroundColor: "#e1dfdfff" }}>
        <Image
          source={require('./1752603563232.jpg')}
          style={{
            height: 34,
            width: 34,
            marginRight: 4,
            marginBottom: 3,
            resizeMode: "contain"
          }}
        />
        {texts.map((word, index) => (
          <View key={index} style={{ flexDirection: "column" }}>
            <Text style={{ fontSize: 32, fontWeight: '500', color: 'gray', padding: 2 }}>
              {word}
            </Text>
          </View>
        ))}
        <TouchableOpacity style={{ marginLeft: 'auto', padding: 8 }} onPress={() => console.log('Icon pressed')}>
          <Icon name="medical-bag" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: "#f6f5f5ff" }}>
        <View style={{ marginTop: 28, justifyContent: "center", alignItems: "center" }}>
      
          <View style={{ height: height * 0.196, width }}>
            <Animated.FlatList
              ref={flatListRef}
              data={images}
              horizontal
              disableIntervalMomentum={true}
              pagingEnabled={false}
              snapToInterval={CARD_WIDTH + CARD_MARGIN *2}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: PEEK_WIDTH - CARD_MARGIN }}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              onMomentumScrollEnd={onScrollEnd}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => {
                const inputRange = [
                  (index - 1) * (CARD_WIDTH + CARD_MARGIN * 2),
                  index * (CARD_WIDTH + CARD_MARGIN * 2),
                  (index + 1) * (CARD_WIDTH + CARD_MARGIN * 2),
                ];

                const scale = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.6, 1, 0.6],
                  extrapolate: 'clamp',
                });

                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.2, 1, 0.2],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View style={[
                    styles.card,
                    {
                      width: CARD_WIDTH,
                      marginHorizontal: CARD_MARGIN,
                      transform: [{ scale }],
                      opacity,
                    }
                  ]}>
                    <Image
                      source={item.uri}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  </Animated.View>
                );
              }}
            />
          </View>

         
          <View style={styles.pagination}>
            {images.map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    isActive ? styles.activeDot : styles.inactiveDot,
                    isActive && styles.glowEffect
                  ]}
                />
              );
            })}
          </View>
        </View>

<View style={{padding:1,marginTop:6}}>
<View style={{flexDirection:"row",alignContent:"center",alignItems:"center",padding:2,paddingLeft:6}}><Text style={{fontSize:24,fontWeight:600,marginRight:4}}>Health Care Services</Text><SvgXml style={{marginBottom:4}} xml={medicalBagSvg} width={32} height={32} /></View>
<View style={{ 
  flexDirection: "row", 
  flexWrap: "wrap", 
 
  justifyContent: "space-between"
}}>
<ImageButton  text={healthcareRoles[0].name} imageSource={healthcareRoles[0].uri}/>
<ImageButton text={healthcareRoles[1].name} imageSource={healthcareRoles[1].uri}/>
<ImageButton text={healthcareRoles[2].name} imageSource={healthcareRoles[2].uri}/>
<View style={{ 
  flexDirection: "row", 
  flexWrap: "wrap", 
 width:width,
  justifyContent: "center"
}}><ImageButton buttonHeight={86} buttonWidth={width*.42} text={healthcareRoles[3].name} imageSource={healthcareRoles[3].uri}/>
<ImageButton buttonHeight={86}  buttonWidth={width*.42} text={healthcareRoles[4].name} imageSource={healthcareRoles[4].uri}/></View>

</View>

  </View>

 <View style={{padding:1,marginTop:6}}>
<View style={{flexDirection:"row",alignContent:"center",alignItems:"center",padding:4,marginTop:8,paddingLeft:8}}><Text style={{fontSize:24,fontWeight:600,marginRight:4}}> Specialists</Text><Icon style={{marginTop:4}} name='stethoscope'  size={24} color='#444242ff'/></View>

<View style={{flexDirection:"row",justifyContent:"center",marginTop:8

}}><ImageButton buttonHeight={96}  buttonWidth={width*.43} text={"Cardiologist"} imageSource={require('./assets/Cardiologist.png')}  />
<ImageButton buttonHeight={96} buttonWidth={width*.43} text={"Orthopedic"} imageSource={require('./assets/Orthopedic.png')}  /></View>
 <View style={{
    width: width,
    justifyContent: "center",
    alignItems: "center",  
  }}>
    <ImageButton buttonHeight={110} buttonWidth={width*.54}
      text={"General Doctors"} 
      imageSource={require('./assets/GeneralDoctors.png')} 
    />
  </View>

  </View>
  <View style={{padding:1,marginTop:6}}>
<View style={{flexDirection:"row",alignContent:"center",alignItems:"center",padding:4,marginTop:8,paddingLeft:8}}><Text style={{fontSize:24,fontWeight:600,marginRight:4}}> Physiotherapy Categories</Text><Icon style={{marginTop:4}} name='stethoscope'  size={24} color='#444242ff'/></View>
</View>

<View style={{flexDirection:"row",justifyContent:"center",marginTop:8,flexWrap:"wrap"

}}>
  
  <ImageButton buttonHeight={96}  buttonWidth={width*.43}
      text={"Soft Tissue Therapy"} 
      imageSource={require('./assets/SoftTissueTherapy.png')} 
    />
  <ImageButton buttonHeight={96}  buttonWidth={width*.43}
      text={"Post Surgical Rehab"} 
      imageSource={require('./assets/PostSurgicalRehab.png')} 
    />
  <ImageButton buttonHeight={96}  buttonWidth={width*.43}
      text={"Trigger Point Therapy"} 
      imageSource={require('./assets/TriggerPointTherapy.png')} 
    />
  <ImageButton buttonHeight={96}  buttonWidth={width*.43}
      text={"Deep Tissue Therapy"} 
      imageSource={require('./assets/DeepTissueTherapy.png')} 
    />
    
    </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    height: height * 0.18,width:width*.90,
    borderRadius: 26,
    
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius:26
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#4da6ff',
    width: 5,
    height: 5,
  },
  inactiveDot: {
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  glowEffect: {
    shadowColor: '#4da6ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
});