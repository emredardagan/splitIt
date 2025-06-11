import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

// Import screens
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
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4eeec',
          },
          headerTintColor: '#1e2939',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen} 
          options={{ title: 'Scan Receipt' }}
        />
        <Stack.Screen 
          name="Manual" 
          component={ManualScreen} 
          options={{ title: 'Enter Manually' }}
        />
        <Stack.Screen 
          name="ReceiptItems" 
          component={ReceiptItemsScreen} 
          options={{ title: 'Receipt Items' }}
        />
        <Stack.Screen 
          name="PeopleAndSplit" 
          component={PeopleAndSplitScreen} 
          options={{ title: 'People & Split' }}
        />
        <Stack.Screen 
          name="AdScreen" 
          component={AdScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SplitSummary" 
          component={SplitSummaryScreen} 
          options={{ title: 'Split Summary' }}
        />
        <Stack.Screen 
          name="CurrencySelector" 
          component={CurrencySelectorScreen} 
          options={{ title: 'Select Currency' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 