import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Share,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Person, BillItem, CurrencyInfo } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import { calculateSplitAmounts, getTotal, formatCurrency } from '../utils/billUtils';
import Decimal from 'decimal.js';
import ConfettiCannon from 'react-native-confetti-cannon';
import Ionicons from 'react-native-vector-icons/Ionicons';

type SplitSummaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SplitSummary'>;

interface Props {
  navigation: SplitSummaryScreenNavigationProp;
}

interface BillFormData {
  billItems: BillItem[];
  people: Person[];
  tax: Decimal;
  tip: Decimal;
  splitEvenly: boolean;
  currency: CurrencyInfo;
}

const SplitSummaryScreen: React.FC<Props> = ({ navigation }) => {
  const [billData, setBillData] = useState<BillFormData | null>(null);
  const [splitAmounts, setSplitAmounts] = useState<Decimal[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadBillData();
  }, []);

  useEffect(() => {
    // Show confetti on first load
    const timer = setTimeout(() => {
      setShowConfetti(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const loadBillData = async () => {
    try {
      const [
        savedItems,
        savedPeople,
        savedCurrency,
        savedTax,
        savedTip,
        savedSplitEvenly,
      ] = await Promise.all([
        AsyncStorage.getItem('billItems'),
        AsyncStorage.getItem('people'),
        AsyncStorage.getItem('selectedCurrency'),
        AsyncStorage.getItem('tax'),
        AsyncStorage.getItem('tip'),
        AsyncStorage.getItem('splitEvenly'),
      ]);

      const items: BillItem[] = savedItems 
        ? JSON.parse(savedItems).map((item: any) => ({
            ...item,
            price: new Decimal(item.price)
          }))
        : [];

      const people: Person[] = savedPeople ? JSON.parse(savedPeople) : [];
      const currency: CurrencyInfo = savedCurrency ? JSON.parse(savedCurrency) : DEFAULT_CURRENCY;
      const tax = new Decimal(savedTax || '0');
      const tip = new Decimal(savedTip || '0');
      const splitEvenly = savedSplitEvenly ? JSON.parse(savedSplitEvenly) : true;

      const formData: BillFormData = {
        billItems: items,
        people,
        tax,
        tip,
        splitEvenly,
        currency,
      };

      setBillData(formData);
      
      if (people.length > 0) {
        const amounts = calculateSplitAmounts(formData);
        setSplitAmounts(amounts);
      }
    } catch (error) {
      console.error('Error loading bill data:', error);
      Alert.alert('Error', 'Failed to load bill data');
    }
  };

  const shareResults = async () => {
    if (!billData || splitAmounts.length === 0) return;

    const total = getTotal(billData);
    const formattedString = `
🧾 Bill Split Summary

${billData.people
  .map((person, index) => {
    const amount = splitAmounts[index] || new Decimal(0);
    return `• ${person.name}: ${formatCurrency(amount, billData.currency.symbol)}`;
  })
  .join('\n')}

💰 Total: ${formatCurrency(total, billData.currency.symbol)}

Split with SplitIt App! 📱`;

    try {
      await Share.share({
        message: formattedString,
        title: 'Bill Split Summary',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const startNewSplit = async () => {
    try {
      // Clear all saved data
      await Promise.all([
        AsyncStorage.removeItem('billItems'),
        AsyncStorage.removeItem('people'),
        AsyncStorage.removeItem('tax'),
        AsyncStorage.removeItem('tip'),
        AsyncStorage.removeItem('splitEvenly'),
      ]);
      
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const renderPersonSplit = ({ item, index }: { item: Person; index: number }) => {
    const amount = splitAmounts[index] || new Decimal(0);
    
    return (
      <View style={styles.personCard}>
        <View style={styles.personInfo}>
          <View style={styles.personAvatar}>
            <Text style={styles.personInitial}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.personName}>{item.name}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>
            {billData?.currency.symbol}
          </Text>
          <Text style={styles.amount}>
            {amount.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  if (!billData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const total = getTotal(billData);

  return (
    <SafeAreaView style={styles.container}>
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={60} color="#22c55e" />
          </View>
          <Text style={styles.title}>Split Complete! 🎉</Text>
          <Text style={styles.subtitle}>Here's how everyone should pay:</Text>
        </View>

        <View style={styles.summarySection}>
          <FlatList
            data={billData.people}
            renderItem={renderPersonSplit}
            keyExtractor={(item) => item.id}
            style={styles.splitList}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Bill</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(total, billData.currency.symbol)}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={shareResults}
          >
            <Ionicons name="share" size={20} color="#1e2939" />
            <Text style={styles.shareButtonText}>Share Results</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newSplitButton}
            onPress={startNewSplit}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.newSplitButtonText}>New Split</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6a7282',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    marginBottom: 30,
  },
  successIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e2939',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5565',
    textAlign: 'center',
  },
  summarySection: {
    flex: 1,
    marginBottom: 20,
  },
  splitList: {
    flex: 1,
  },
  personCard: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e2939',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  personInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  personName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e2939',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6a7282',
    marginRight: 2,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e2939',
  },
  totalSection: {
    marginBottom: 24,
  },
  totalCard: {
    backgroundColor: '#1e2939',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  shareButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e2939',
  },
  newSplitButton: {
    flex: 1,
    backgroundColor: '#1e2939',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newSplitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default SplitSummaryScreen; 