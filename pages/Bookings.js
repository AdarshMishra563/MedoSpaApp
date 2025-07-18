import { View, Text } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux';

export default function Bookings() {

  const currentServiceLocation = useSelector((state) => state.user.location);
  console.log(currentServiceLocation);
  return (
    <View style={{marginTop:40}}>
      <Text>{currentServiceLocation?.address}</Text>
    </View>
  )
}