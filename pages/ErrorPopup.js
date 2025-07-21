import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const ErrorPopup = ({ message, onHide,Color="red" }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onHide?.());
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        padding: 14,
        borderRadius: 10,
        backgroundColor: `${Color}`,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        opacity: fadeAnim,
        zIndex: 100,
      }}
    >
      <Icon name="alert-circle" size={20} color="#fff" style={{ marginRight: 10 }} />
      <Text style={{ color: '#fff', flex: 1 }}>{message}</Text>
    </Animated.View>
  );
};

export default ErrorPopup;
