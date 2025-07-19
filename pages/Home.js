import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, Platform, ScrollView, Dimensions, Animated, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DeviceInfo from 'react-native-device-info';
import ImageButton from './Button';

const { width, height } = Dimensions.get('window');

const images = [
  { id: '1', uri: require('./assets/12.png') },
  { id: '2', uri: require('./assets/13.png') },
  { id: '3', uri: require('./assets/16.png') },
  { id: '4', uri: require('./assets/15.png') },
];

export default function Home() {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const scrollX = useRef(new Animated.Value(0)).current;
  const texts = ['M', 'e', 'd', 'o', 'S', 'p', 'a'];

 
  const CARD_WIDTH = width * 0.9; 
  const CARD_MARGIN = width * 0.02; 
  const PEEK_WIDTH = (width - CARD_WIDTH) / 2; 

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

<View style={{padding:14,marginTop:18}}>
<View style={{}}><Text>Services</Text></View>
  
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
    borderRadius:26,
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