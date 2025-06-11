import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, BillItem, CurrencyInfo } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { generateId } from '../utils/billUtils';
import Decimal from 'decimal.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY } from '../constants/currencies';

type ManualScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Manual'>;

interface Props {
  navigation: ManualScreenNavigationProp;
}

const ManualScreen: React.FC<Props> = ({ navigation }) => {
  const [items, setItems] = useState<BillItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [currency, setCurrency] = useState<CurrencyInfo>(DEFAULT_CURRENCY);

  useEffect(() => {
    loadCurrency();
    loadSavedItems();
  }, []);

  const loadCurrency = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedCurrency');
      if (saved) {
        setCurrency(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    }
  };

  const loadSavedItems = async () => {
    try {
      const saved = await AsyncStorage.getItem('billItems');
      if (saved) {
        const savedItems = JSON.parse(saved);
        // Convert price strings back to Decimal objects
        const itemsWithDecimal = savedItems.map((item: any) => ({
          ...item,
          price: new Decimal(item.price)
        }));
        setItems(itemsWithDecimal);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const saveItems = async (newItems: BillItem[]) => {
    try {
      // Convert Decimal objects to strings for storage
      const itemsForStorage = newItems.map(item => ({
        ...item,
        price: item.price.toString()
      }));
      await AsyncStorage.setItem('billItems', JSON.stringify(itemsForStorage));
    } catch (error) {
      console.error('Error saving items:', error);
    }
  };

  const addItem = () => {
    if (!itemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }

    if (!itemPrice.trim() || isNaN(parseFloat(itemPrice))) {
      Alert.alert('Error', 'Please enter valid price');
      return;
    }

    const newItem: BillItem = {
      id: generateId(),
      name: itemName.trim(),
      price: new Decimal(itemPrice),
      assignedTo: [],
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    saveItems(newItems);
    setItemName('');
    setItemPrice('');
  };

  const removeItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    saveItems(newItems);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum.plus(item.price), new Decimal(0));
  };

  const proceedToNext = () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }
    navigation.navigate('PeopleAndSplit');
  };

  const renderItem = ({ item }: { item: BillItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          {currency.symbol}{item.price.toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <Ionicons name="trash" size={20} color="#dc3545" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Add Items</Text>
          <Text style={styles.subtitle}>Enter your bill items manually</Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.nameInput]}
              placeholder="Item name"
              value={itemName}
              onChangeText={setItemName}
              returnKeyType="next"
            />
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>{currency.symbol}</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0.00"
                value={itemPrice}
                onChangeText={setItemPrice}
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={addItem}
              />
            </View>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>Items ({items.length})</Text>
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.itemsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No items added yet</Text>
              </View>
            }
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>
              {currency.symbol}{getTotal().toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.continueButton,
              items.length === 0 && styles.continueButtonDisabled
            ]}
            onPress={proceedToNext}
            disabled={items.length === 0}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
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
  },
  header: {
    paddingTop: 20,
    marginBottom: 24,
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
  },
  inputSection: {
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  nameInput: {
    flex: 1,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingLeft: 16,
    minWidth: 100,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6a7282',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 16,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#1e2939',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  itemsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e2939',
    marginBottom: 12,
  },
  itemsList: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e2939',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6a7282',
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e2939',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e2939',
  },
  continueButton: {
    backgroundColor: '#1e2939',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManualScreen; 