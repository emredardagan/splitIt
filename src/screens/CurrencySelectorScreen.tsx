import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, CurrencyInfo } from '../types';
import { CURRENCIES } from '../constants/currencies';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

type CurrencySelectorNavigationProp = StackNavigationProp<RootStackParamList, 'CurrencySelector'>;

interface Props {
  navigation: CurrencySelectorNavigationProp;
}

const CurrencySelectorScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyInfo>(CURRENCIES[0]);

  useEffect(() => {
    loadSelectedCurrency();
  }, []);

  const loadSelectedCurrency = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedCurrency');
      if (saved) {
        const currency = JSON.parse(saved);
        setSelectedCurrency(currency);
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    }
  };

  const saveCurrency = async (currency: CurrencyInfo) => {
    try {
      await AsyncStorage.setItem('selectedCurrency', JSON.stringify(currency));
      setSelectedCurrency(currency);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const renderCurrencyItem = ({ item }: { item: CurrencyInfo }) => (
    <TouchableOpacity
      style={[
        styles.currencyItem,
        selectedCurrency.code === item.code && styles.selectedItem
      ]}
      onPress={() => saveCurrency(item)}
    >
      <View style={styles.currencyInfo}>
        <Text style={styles.currencySymbol}>{item.symbol}</Text>
        <View style={styles.currencyDetails}>
          <Text style={styles.currencyCode}>{item.code}</Text>
          <Text style={styles.currencyName}>{item.name}</Text>
        </View>
      </View>
      {selectedCurrency.code === item.code && (
        <Ionicons name="checkmark" size={24} color="#1e2939" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Currency</Text>
        <Text style={styles.subtitle}>Choose your preferred currency for bill splitting</Text>
        
        <FlatList
          data={CURRENCIES}
          renderItem={renderCurrencyItem}
          keyExtractor={(item) => item.code}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4eeec',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1e2939',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5565',
    marginBottom: 32,
    lineHeight: 22,
  },
  list: {
    flex: 1,
  },
  currencyItem: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedItem: {
    borderColor: '#1e2939',
    backgroundColor: '#f8f9fa',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e2939',
    marginRight: 16,
    minWidth: 32,
    textAlign: 'center',
  },
  currencyDetails: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e2939',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 14,
    color: '#6a7282',
  },
});

export default CurrencySelectorScreen; 