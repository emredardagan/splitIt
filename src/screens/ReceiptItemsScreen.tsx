import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, BillItem, CurrencyInfo } from '../types';
import { generateId } from '../utils/billUtils';
import Decimal from 'decimal.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { BackLink } from '../components/ScreenChrome';
import { Colors } from '../theme/colors';

type NavProp = StackNavigationProp<RootStackParamList, 'ReceiptItems'>;

interface Props {
  navigation: NavProp;
}

const parseMoneyInput = (raw: string): Decimal => {
  const cleaned = raw.replace(',', '.').replace(/[^\d.-]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? new Decimal(n) : new Decimal(0);
};

interface ItemPriceFieldProps {
  itemId: string;
  decimal: Decimal;
  onCommit: (value: Decimal) => void | Promise<void>;
}

const ItemPriceField: React.FC<ItemPriceFieldProps> = ({
  itemId,
  decimal,
  onCommit,
}) => {
  const [text, setText] = useState(() =>
    decimal.isZero() ? '' : decimal.toFixed(2),
  );

  useEffect(() => {
    setText(decimal.isZero() ? '' : decimal.toFixed(2));
  }, [decimal.toString(), itemId]);

  return (
    <TextInput
      style={styles.priceField}
      placeholder="0,00"
      placeholderTextColor={Colors.textMuted}
      keyboardType="decimal-pad"
      value={text}
      onChangeText={setText}
      onBlur={() => void onCommit(parseMoneyInput(text))}
    />
  );
};

const ReceiptItemsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<BillItem[]>([]);
  const [tip, setTip] = useState('');
  const [tax, setTax] = useState('');
  const [currency, setCurrency] = useState<CurrencyInfo>(DEFAULT_CURRENCY);

  const persistBillItems = useCallback(async (next: BillItem[]) => {
    const forStore = next.map((it) => ({
      ...it,
      price: it.price.toString(),
    }));
    await AsyncStorage.setItem('billItems', JSON.stringify(forStore));
    setItems(next);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [savedCur, savedItems, t, tx] = await Promise.all([
          AsyncStorage.getItem('selectedCurrency'),
          AsyncStorage.getItem('billItems'),
          AsyncStorage.getItem('tip'),
          AsyncStorage.getItem('tax'),
        ]);
        if (savedCur) {
          setCurrency(JSON.parse(savedCur));
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
        if (t) {
          setTip(normalizeStoredMoney(t));
        }
        if (tx) {
          setTax(normalizeStoredMoney(tx));
        }
      } catch (_e) {
        /* noop */
      }
    };
    void bootstrap();
  }, []);

  const normalizeStoredMoney = (s: string) => {
    const d = parseMoneyInput(s);
    return d.isZero() ? '' : d.toFixed(2);
  };

  const addItem = async () => {
    const placeholder: BillItem = {
      id: generateId(),
      name: '',
      price: new Decimal(0),
      assignedTo: [],
    };
    await persistBillItems([...items, placeholder]);
  };

  const setNameFor = async (id: string, name: string) => {
    const next = items.map((it) => (it.id === id ? { ...it, name } : it));
    await persistBillItems(next);
  };

  const commitPriceFor = async (id: string, amount: Decimal) => {
    const next = items.map((it) =>
      it.id === id ? { ...it, price: amount } : it,
    );
    await persistBillItems(next);
  };

  const removeRow = async (id: string) => {
    await persistBillItems(items.filter((it) => it.id !== id));
  };

  const itemsSubtotal = items.reduce(
    (sum, it) => sum.plus(it.price),
    new Decimal(0),
  );
  const tipDec = tip.trim() === '' ? new Decimal(0) : parseMoneyInput(tip);
  const taxDec = tax.trim() === '' ? new Decimal(0) : parseMoneyInput(tax);
  const total = itemsSubtotal.plus(tipDec).plus(taxDec);

  const continueFlow = async () => {
    const ready = items.filter((it) => it.name.trim().length > 0);
    if (ready.length === 0) {
      Alert.alert(
        'Tamamlanmadı',
        'En az bir kalem için ad yazın ve tutar girin.',
      );
      return;
    }
    await AsyncStorage.multiSet([
      ['tip', tipDec.toString()],
      ['tax', taxDec.toString()],
    ]);
    navigation.navigate('PeopleAndSplit');
  };

  const renderRow = ({ item }: { item: BillItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemRow}>
        <TextInput
          style={[styles.whiteInput, styles.nameField]}
          placeholder="Kalem adı"
          placeholderTextColor={Colors.textMuted}
          value={item.name}
          onChangeText={(t) => {
            void setNameFor(item.id, t);
          }}
        />
        <View style={styles.priceWrap}>
          <Text style={styles.currencyHint}>{currency.symbol}</Text>
          <ItemPriceField
            itemId={item.id}
            decimal={item.price}
            onCommit={(amt) => commitPriceFor(item.id, amt)}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            void removeRow(item.id);
          }}
          style={styles.trashMini}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome6 name="trash-can" size={18} color={Colors.brown} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.outer}>
        <BackLink onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Fiş Kalemleri</Text>
        <Text style={styles.subtitle}>
          Fişinizdeki tüm kalemleri listeleyin
        </Text>

        <TouchableOpacity style={styles.addBar} onPress={() => void addItem()}>
          <FontAwesome6 name="plus" size={22} color={Colors.textSecondary} solid />
          <Text style={styles.addBarText}>Kalem Ekle</Text>
        </TouchableOpacity>

        <FlatList
          data={items}
          keyExtractor={(r) => r.id}
          renderItem={renderRow}
          style={styles.list}
          ListEmptyComponent={null}
        />

        <View style={styles.rule} />

        <View style={styles.taxRow}>
          <View style={styles.taxCol}>
            <Text style={styles.miniLabel}>Bahşiş:</Text>
            <View style={styles.pill}>
              <Text style={styles.pillSy}>{currency.symbol}</Text>
              <TextInput
                style={styles.pillInput}
                placeholder="0,00"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={tip}
                onChangeText={setTip}
              />
            </View>
          </View>
          <View style={styles.taxCol}>
            <Text style={styles.miniLabel}>Vergi:</Text>
            <View style={styles.pill}>
              <Text style={styles.pillSy}>{currency.symbol}</Text>
              <TextInput
                style={styles.pillInput}
                placeholder="0,00"
                placeholderTextColor={Colors.textMuted}
                keyboardType="decimal-pad"
                value={tax}
                onChangeText={setTax}
              />
            </View>
          </View>
        </View>

        <Text style={styles.totalLine}>
          <Text style={styles.totalLabel}>Toplam: </Text>
          <Text style={styles.totalMuted}>{currency.symbol} </Text>
          <Text style={styles.totalVal}>{total.toFixed(2)}</Text>
        </Text>

        <TouchableOpacity
          style={styles.contBtn}
          onPress={() => void continueFlow()}
        >
          <Text style={styles.contBtnTxt}>Devam Et</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom }} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  outer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBE8E5',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 4,
  },
  addBarText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  list: {
    flex: 1,
    marginTop: 12,
  },
  itemCard: {
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whiteInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  nameField: {
    flex: 1,
    marginRight: 8,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 104,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: 10,
    paddingVertical: 0,
  },
  currencyHint: {
    color: Colors.textMuted,
    fontSize: 15,
    marginRight: 4,
  },
  priceField: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 0,
    paddingRight: 8,
    fontSize: 15,
    color: Colors.text,
  },
  trashMini: {
    marginLeft: 6,
    padding: 8,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  taxRow: {
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: -6,
  },
  taxCol: {
    flex: 1,
    marginHorizontal: 6,
  },
  miniLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
  },
  pillSy: {
    color: Colors.textMuted,
    marginRight: 4,
    fontSize: 15,
  },
  pillInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 12,
    minWidth: 0,
  },
  totalLine: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    fontSize: 18,
  },
  totalLabel: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 18,
  },
  totalMuted: {
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: 16,
  },
  totalVal: {
    color: Colors.text,
    fontWeight: '800',
    fontSize: 20,
  },
  contBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  contBtnTxt: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 17,
  },
});

export default ReceiptItemsScreen;
