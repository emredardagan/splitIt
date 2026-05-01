import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { Colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import ManualScreen from '../screens/ManualScreen';
import ReceiptItemsScreen from '../screens/ReceiptItemsScreen';
import PeopleAndSplitScreen from '../screens/PeopleAndSplitScreen';
import AdScreen from '../screens/AdScreen';
import SplitSummaryScreen from '../screens/SplitSummaryScreen';
import CurrencySelectorScreen from '../screens/CurrencySelectorScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      {/* Workaround RN Fabric + react-native-screens: avoid RCTView sheet crash (see screens#2166) */}
      <Stack.Navigator
        initialRouteName="Home"
        detachInactiveScreens={false}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Manual" component={ManualScreen} />
        <Stack.Screen name="ReceiptItems" component={ReceiptItemsScreen} />
        <Stack.Screen name="PeopleAndSplit" component={PeopleAndSplitScreen} />
        <Stack.Screen name="AdScreen" component={AdScreen} />
        <Stack.Screen name="SplitSummary" component={SplitSummaryScreen} />
        <Stack.Screen
          name="CurrencySelector"
          component={CurrencySelectorScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
