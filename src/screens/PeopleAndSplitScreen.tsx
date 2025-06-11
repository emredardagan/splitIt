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
  Switch,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Person, BillItem, CurrencyInfo } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { generateId } from '../utils/billUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import Decimal from 'decimal.js';

type PeopleAndSplitScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PeopleAndSplit'>;

interface Props {
  navigation: PeopleAndSplitScreenNavigationProp;
}

const PeopleAndSplitScreen: React.FC<Props> = ({ navigation }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [personName, setPersonName] = useState('');
  const [splitEvenly, setSplitEvenly] = useState(true);
  const [items, setItems] = useState<BillItem[]>([]);
  const [currency, setCurrency] = useState<CurrencyInfo>(DEFAULT_CURRENCY);
  const [tax, setTax] = useState('0');
  const [tip, setTip] = useState('0');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedPeople, savedItems, savedCurrency, savedTax, savedTip] = await Promise.all([
        AsyncStorage.getItem('people'),
        AsyncStorage.getItem('billItems'),
        AsyncStorage.getItem('selectedCurrency'),
        AsyncStorage.getItem('tax'),
        AsyncStorage.getItem('tip'),
      ]);

      if (savedPeople) {
        setPeople(JSON.parse(savedPeople));
      }

      if (savedItems) {
        const itemsData = JSON.parse(savedItems);
        const itemsWithDecimal = itemsData.map((item: any) => ({
          ...item,
          price: new Decimal(item.price)
        }));
        setItems(itemsWithDecimal);
      }

      if (savedCurrency) {
        setCurrency(JSON.parse(savedCurrency));
      }

      if (savedTax) {
        setTax(savedTax);
      }

      if (savedTip) {
        setTip(savedTip);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const savePeople = async (newPeople: Person[]) => {
    try {
      await AsyncStorage.setItem('people', JSON.stringify(newPeople));
    } catch (error) {
      console.error('Error saving people:', error);
    }
  };

  const saveTaxTip = async (newTax: string, newTip: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('tax', newTax),
        AsyncStorage.setItem('tip', newTip),
      ]);
    } catch (error) {
      console.error('Error saving tax/tip:', error);
    }
  };

  const addPerson = () => {
    if (!personName.trim()) {
      Alert.alert('Error', 'Please enter person name');
      return;
    }

    const newPerson: Person = {
      id: generateId(),
      name: personName.trim(),
    };

    const newPeople = [...people, newPerson];
    setPeople(newPeople);
    savePeople(newPeople);
    setPersonName('');
  };

  const removePerson = (id: string) => {
    const newPeople = people.filter(person => person.id !== id);
    setPeople(newPeople);
    savePeople(newPeople);
  };

  const proceedToNext = async () => {
    if (people.length === 0) {
      Alert.alert('Error', 'Please add at least one person');
      return;
    }

    // Save split settings
    try {
      await AsyncStorage.setItem('splitEvenly', JSON.stringify(splitEvenly));
      saveTaxTip(tax, tip);
      
      // Navigate to ad screen first
      navigation.navigate('AdScreen');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const renderPersonItem = ({ item }: { item: Person }) => (
    <View style={styles.personCard}>
      <View style={styles.personInfo}>
        <Ionicons name="person" size={20} color="#1e2939" />
        <Text style={styles.personName}>{item.name}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removePerson(item.id)}
      >
        <Ionicons name="trash" size={18} color="#dc3545" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>People & Split</Text>
          <Text style={styles.subtitle}>Add people and choose how to split</Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Person name"
              value={personName}
              onChangeText={setPersonName}
              returnKeyType="done"
              onSubmitEditing={addPerson}
            />
            <TouchableOpacity style={styles.addButton} onPress={addPerson}>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.peopleSection}>
          <Text style={styles.sectionTitle}>People ({people.length})</Text>
          <FlatList
            data={people}
            renderItem={renderPersonItem}
            keyExtractor={(item) => item.id}
            style={styles.peopleList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color="#9ca3af" />
                <Text style={styles.emptyText}>No people added yet</Text>
              </View>
            }
          />
        </View>

        <View style={styles.settingsSection}>
          <View style={styles.splitOption}>
            <Text style={styles.optionLabel}>Split evenly</Text>
            <Switch
              value={splitEvenly}
              onValueChange={setSplitEvenly}
              trackColor={{ false: '#e5e7eb', true: '#1e2939' }}
              thumbColor={splitEvenly ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.extraCharges}>
            <Text style={styles.sectionTitle}>Additional Charges</Text>
            <View style={styles.chargeRow}>
              <Text style={styles.chargeLabel}>Tax:</Text>
              <View style={styles.chargeInputContainer}>
                <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                <TextInput
                  style={styles.chargeInput}
                  placeholder="0.00"
                  value={tax}
                  onChangeText={setTax}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <View style={styles.chargeRow}>
              <Text style={styles.chargeLabel}>Tip:</Text>
              <View style={styles.chargeInputContainer}>
                <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                <TextInput
                  style={styles.chargeInput}
                  placeholder="0.00"
                  value={tip}
                  onChangeText={setTip}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            people.length === 0 && styles.continueButtonDisabled
          ]}
          onPress={proceedToNext}
          disabled={people.length === 0}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
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
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addButton: {
    backgroundColor: '#1e2939',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  peopleSection: {
    flex: 1,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e2939',
    marginBottom: 12,
  },
  peopleList: {
    flex: 1,
  },
  personCard: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e2939',
    marginLeft: 12,
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
  settingsSection: {
    marginBottom: 24,
  },
  splitOption: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e2939',
  },
  extraCharges: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  chargeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chargeLabel: {
    fontSize: 16,
    color: '#1e2939',
    flex: 1,
  },
  chargeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingLeft: 12,
    minWidth: 100,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6a7282',
    marginRight: 4,
  },
  chargeInput: {
    flex: 1,
    paddingVertical: 8,
    paddingRight: 12,
    fontSize: 16,
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
    marginBottom: 20,
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

export default PeopleAndSplitScreen; 