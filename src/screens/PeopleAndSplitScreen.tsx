import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Person, BillItem, CurrencyInfo } from '../types';
import { generateId } from '../utils/billUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import Decimal from 'decimal.js';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { BackLink } from '../components/ScreenChrome';
import { Colors } from '../theme/colors';

type NavProp = StackNavigationProp<RootStackParamList, 'PeopleAndSplit'>;

interface Props {
  navigation: NavProp;
}

const PeopleAndSplitScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [people, setPeople] = useState<Person[]>([]);
  const [items, setItems] = useState<BillItem[]>([]);
  const [currency, setCurrency] = useState<CurrencyInfo>(DEFAULT_CURRENCY);
  const [splitEvenly, setSplitEvenly] = useState(false);

  const savePeopleStorage = async (next: Person[]) => {
    await AsyncStorage.setItem('people', JSON.stringify(next));
    setPeople(next);
  };

  const saveItemsStorage = useCallback(async (next: BillItem[]) => {
    const forStorage = next.map((item) => ({
      ...item,
      price: item.price.toString(),
    }));
    await AsyncStorage.setItem('billItems', JSON.stringify(forStorage));
    setItems(next);
  }, []);

  useEffect(() => {
    const boot = async () => {
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
          const parsed = JSON.parse(savedItems) as Record<string, unknown>[];
          setItems(
            parsed.map((row) => ({
              id: String(row.id),
              name: String(row.name ?? ''),
              price: new Decimal(String(row.price ?? '0')),
              assignedTo: Array.isArray(row.assignedTo)
                ? (row.assignedTo as string[])
                : [],
            })),
          );
        }
        if (savedCurrency) {
          setCurrency(JSON.parse(savedCurrency));
        }
      } catch (e) {
        console.warn(e);
      }
    };
    void boot();
  }, []);

  const addEmptyPersonRow = async () => {
    const next: Person[] = [...people, { id: generateId(), name: '' }];
    await savePeopleStorage(next);
  };

  const updatePersonLabel = async (id: string, name: string) => {
    const next = people.map((p) => (p.id === id ? { ...p, name } : p));
    await savePeopleStorage(next);
  };

  const removePersonRow = async (id: string) => {
    const filtered = people.filter((p) => p.id !== id);
    const clearedItems = items.map((item) => ({
      ...item,
      assignedTo: item.assignedTo.filter((aid) => aid !== id),
    }));
    await savePeopleStorage(filtered);
    await saveItemsStorage(clearedItems);
  };

  const toggleEvenSplit = () => {
    setSplitEvenly((prev) => !prev);
  };

  const toggleAssign = async (billId: string, personId: string) => {
    setSplitEvenly(false);
    const next = items.map((item) => {
      if (item.id !== billId) {
        return item;
      }
      const has = item.assignedTo.includes(personId);
      return {
        ...item,
        assignedTo: has
          ? item.assignedTo.filter((id) => id !== personId)
          : [...item.assignedTo, personId],
      };
    });
    await saveItemsStorage(next);
  };

  const namedPeople = people.filter((p) => p.name.trim().length > 0);

  const navigateToNext = async () => {
    try {
      await AsyncStorage.setItem('splitEvenly', JSON.stringify(splitEvenly));
      navigation.navigate('AdScreen');
    } catch (_e) {
      /* noop */
    }
  };

  const proceedToNext = () => {
    if (namedPeople.length === 0) {
      Alert.alert(
        'Eksik bilgi',
        'Devam etmek için en az bir kişinin adını yazın.',
      );
      return;
    }

    if (!splitEvenly) {
      const bad = items.filter((it) => it.assignedTo.length === 0);
      if (bad.length > 0) {
        Alert.alert(
          'Eksik atama',
          `Şu kalemler için kimse seçilmedi:\n${bad
            .map((b) => b.name)
            .join(', ')}\n\nDevam etmek için atama yapın veya “Eşit bölüştür”e dokunun.`,
        );
        return;
      }
    }

    navigateToNext().catch(() => undefined);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <BackLink onPress={() => navigation.goBack()} />

        <Text style={styles.title}>Kimler Paylaşıyor?</Text>
        <Text style={styles.sub}>
          İsimleri girin ve ürünleri paylaştırın
        </Text>

        {people.map((p) => (
          <View key={p.id} style={styles.personRow}>
            <TextInput
              style={styles.personInput}
              placeholder="Kişi adı"
              placeholderTextColor={Colors.textMuted}
              value={p.name}
              onChangeText={(t) => {
                void updatePersonLabel(p.id, t);
              }}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={() => {
                void removePersonRow(p.id);
              }}
              style={styles.trash}
            >
              <FontAwesome6 name="trash-can" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.outlineWide}
          onPress={() => {
            void addEmptyPersonRow();
          }}
        >
          <Text style={styles.outlineWideText}>+ Kişi Ekle</Text>
        </TouchableOpacity>

        {items.length > 0 ? (
          <View style={{ marginTop: 28 }}>
            <View style={styles.assignHead}>
              <Text style={styles.assignTitle}>Ürünleri Ata</Text>
              <TouchableOpacity
                style={[styles.pillSmall, splitEvenly && styles.pillSmallOn]}
                onPress={toggleEvenSplit}
                accessibilityRole="switch"
                accessibilityState={{ checked: splitEvenly }}
              >
                <Text
                  style={[styles.pillSmallTxt, splitEvenly && styles.pillSmallTxtOn]}
                >
                  Eşit bölüştür
                </Text>
              </TouchableOpacity>
            </View>
            {splitEvenly ? (
              <Text style={styles.hintEven}>
                Toplam, belirtilen kişiler arasında eşit paylaşılacak.
              </Text>
            ) : null}
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    {currency.symbol}
                    {item.price.toFixed(2)}
                  </Text>
                </View>
                {!splitEvenly && namedPeople.length > 0 ? (
                  <View style={styles.tagRow}>
                    {namedPeople.map((person) => {
                      const on = item.assignedTo.includes(person.id);
                      return (
                        <TouchableOpacity
                          key={person.id}
                          style={[styles.tag, on && styles.tagOn]}
                          onPress={() => {
                            void toggleAssign(item.id, person.id);
                          }}
                        >
                          <Text style={[styles.tagTxt, on && styles.tagTxtOn]}>
                            {person.name.trim() || '?'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.continueBtn,
            namedPeople.length === 0 && styles.continueOff,
          ]}
          onPress={() => proceedToNext()}
          disabled={namedPeople.length === 0}
        >
          <Text style={styles.continueTxt}>Devam Et</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  sub: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  personInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  trash: {
    padding: 10,
  },
  outlineWide: {
    borderWidth: 1,
    borderColor: '#CAC4BE',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  outlineWideText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  assignHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  assignTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  pillSmall: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pillSmallTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  pillSmallOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillSmallTxtOn: {
    color: Colors.white,
  },
  hintEven: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginHorizontal: -4,
    marginBottom: -6,
  },
  tag: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginBottom: 6,
    backgroundColor: Colors.white,
  },
  tagOn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tagTxtOn: {
    color: Colors.white,
  },
  continueBtn: {
    marginTop: 28,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueOff: {
    backgroundColor: '#A8CED3',
  },
  continueTxt: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
});

export default PeopleAndSplitScreen;
