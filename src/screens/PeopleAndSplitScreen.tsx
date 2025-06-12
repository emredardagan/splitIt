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
  Modal,
  ScrollView,
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
  const [selectedItem, setSelectedItem] = useState<BillItem | null>(null);
  const [showPersonSelector, setShowPersonSelector] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedPeople, savedItems, savedCurrency] = await Promise.all([
        AsyncStorage.getItem('people'),
        AsyncStorage.getItem('billItems'),
        AsyncStorage.getItem('selectedCurrency'),
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



  const saveItems = async (newItems: BillItem[]) => {
    try {
      const itemsForStorage = newItems.map(item => ({
        ...item,
        price: item.price.toString()
      }));
      await AsyncStorage.setItem('billItems', JSON.stringify(itemsForStorage));
    } catch (error) {
      console.error('Error saving items:', error);
    }
  };

  const openPersonSelector = (item: BillItem) => {
    setSelectedItem(item);
    setShowPersonSelector(true);
  };

  const togglePersonAssignment = (personId: string) => {
    if (!selectedItem) return;

    const updatedItems = items.map(item => {
      if (item.id === selectedItem.id) {
        const assignedTo = item.assignedTo.includes(personId)
          ? item.assignedTo.filter(id => id !== personId)
          : [...item.assignedTo, personId];
        return { ...item, assignedTo };
      }
      return item;
    });

    setItems(updatedItems);
    saveItems(updatedItems);
    
    const updatedSelectedItem = updatedItems.find(item => item.id === selectedItem.id);
    if (updatedSelectedItem) {
      setSelectedItem(updatedSelectedItem);
    }
  };

  const getAssignedPeopleNames = (assignedTo: string[]) => {
    return assignedTo
      .map(id => people.find(person => person.id === id)?.name)
      .filter(Boolean)
      .join(', ');
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
      Alert.alert('Hata', 'Lütfen en az bir kişi ekleyin');
      return;
    }

    // Check item assignments if not splitting evenly
    if (!splitEvenly) {
      const unassignedItems = items.filter(item => item.assignedTo.length === 0);
      
      if (unassignedItems.length > 0) {
        Alert.alert(
          'Eksik Atama',
          `Şu kalemler henüz kimseye atanmamış: ${unassignedItems.map(item => item.name).join(', ')}. Devam etmek istiyor musunuz?`,
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Devam Et', onPress: () => navigateToNext() }
          ]
        );
        return;
      }
    }

    navigateToNext();
  };

  const navigateToNext = async () => {
    try {
      await AsyncStorage.setItem('splitEvenly', JSON.stringify(splitEvenly));
      // Set default tax and tip to 0
      await Promise.all([
        AsyncStorage.setItem('tax', '0'),
        AsyncStorage.setItem('tip', '0'),
      ]);
      navigation.navigate('AdScreen');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };



    return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Kişiler ve Bölme</Text>
          <Text style={styles.subtitle}>Kişileri ekleyin ve nasıl böleceğinizi seçin</Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Kişi adı"
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
          <Text style={styles.sectionTitle}>Kişiler ({people.length})</Text>
          {people.length > 0 ? (
            people.map((person) => (
              <View key={person.id} style={styles.personCard}>
                <View style={styles.personInfo}>
                  <Ionicons name="person" size={20} color="#1e2939" />
                  <Text style={styles.personName}>{person.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePerson(person.id)}
                >
                  <Ionicons name="trash" size={18} color="#dc3545" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>Henüz kimse eklenmemiş</Text>
            </View>
          )}
        </View>

        <View style={styles.settingsSection}>
          <View style={styles.splitOption}>
            <View style={styles.optionContent}>
              <Text style={styles.optionLabel}>Eşit Olarak Böl</Text>
              <Text style={styles.optionDescription}>
                {splitEvenly 
                  ? 'Tüm kalemler eşit olarak bölünecek' 
                  : 'Her kalemi hangi kişilerin paylaşacağını seçebilirsiniz'
                }
              </Text>
            </View>
            <Switch
              value={splitEvenly}
              onValueChange={setSplitEvenly}
              trackColor={{ false: '#e5e7eb', true: '#1e2939' }}
              thumbColor={splitEvenly ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          {!splitEvenly && items.length > 0 && (
            <View style={styles.itemAssignmentSection}>
              <Text style={styles.sectionTitle}>Kalem Ataması</Text>
              <Text style={styles.assignmentDescription}>
                Her kalemi hangi kişilerin paylaşacağını seçin:
              </Text>
              {items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      {currency.symbol}{item.price.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.assignmentInfo}>
                    <Text style={styles.assignmentLabel}>
                      Atanan Kişiler ({item.assignedTo.length}):
                    </Text>
                    <Text style={styles.assignedPeople}>
                      {item.assignedTo.length > 0 
                        ? getAssignedPeopleNames(item.assignedTo)
                        : 'Henüz kimse atanmamış'
                      }
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.assignButton}
                    onPress={() => openPersonSelector(item)}
                  >
                    <Ionicons name="people" size={16} color="white" />
                    <Text style={styles.assignButtonText}>Kişi Seç</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            people.length === 0 && styles.continueButtonDisabled
          ]}
          onPress={proceedToNext}
          disabled={people.length === 0}
        >
          <Text style={styles.continueButtonText}>Devam Et</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showPersonSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPersonSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedItem?.name} - Kişi Seçimi
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPersonSelector(false)}
              >
                <Ionicons name="close" size={24} color="#1e2939" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Bu kalemi paylaşacak kişileri seçin:
            </Text>

            <FlatList
              data={people}
              keyExtractor={(item) => item.id}
              renderItem={({ item: person }) => {
                const isSelected = selectedItem?.assignedTo.includes(person.id) || false;
                return (
                  <TouchableOpacity
                    style={[
                      styles.personOption,
                      isSelected && styles.personOptionSelected
                    ]}
                    onPress={() => togglePersonAssignment(person.id)}
                  >
                    <View style={styles.personInfo}>
                      <View style={[
                        styles.personAvatar,
                        isSelected && styles.personAvatarSelected
                      ]}>
                        <Text style={[
                          styles.personInitial,
                          isSelected && styles.personInitialSelected
                        ]}>
                          {person.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[
                        styles.personName,
                        isSelected && styles.personNameSelected
                      ]}>
                        {person.name}
                      </Text>
                    </View>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShowPersonSelector(false)}
            >
              <Text style={styles.doneButtonText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4eeec',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e2939',
    marginBottom: 12,
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
  optionContent: {
    flex: 1,
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e2939',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6a7282',
    lineHeight: 18,
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
  itemAssignmentSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#6a7282',
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e2939',
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e2939',
  },
  assignmentInfo: {
    marginBottom: 8,
  },
  assignmentLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6a7282',
    marginBottom: 2,
  },
  assignedPeople: {
    fontSize: 14,
    color: '#1e2939',
    fontStyle: 'italic',
  },
  assignButton: {
    backgroundColor: '#1e2939',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  assignButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e2939',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#4a5565',
    marginBottom: 20,
  },
  personOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  personOptionSelected: {
    backgroundColor: '#e8f4fd',
    borderWidth: 1,
    borderColor: '#1e2939',
  },
  personAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  personAvatarSelected: {
    backgroundColor: '#1e2939',
  },
  personInitial: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  personInitialSelected: {
    color: 'white',
  },
  personNameSelected: {
    color: '#1e2939',
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1e2939',
    borderColor: '#1e2939',
  },
  doneButton: {
    backgroundColor: '#1e2939',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PeopleAndSplitScreen; 