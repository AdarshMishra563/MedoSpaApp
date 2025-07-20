import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { 
  TouchableOpacity, 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

const ImageButton = ({ 
  imageSource, 
  text, 
  onPress, 
  buttonWidth = width * 0.29,
  buttonHeight = 80,
  overlayOpacity = 0.5 
}) => {

  const navigation=useNavigation();
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8}
      style={[styles.button, { width: buttonWidth, height: buttonHeight }]}
    >
      <Image 
        source={imageSource} 
        style={styles.image} 
        resizeMode="cover" 
      />
      <View style={[styles.overlay, { opacity: overlayOpacity }]} />
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
    elevation: 3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: '#000',
  },
  text: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    color: '#EAEAEA',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});

export default ImageButton;