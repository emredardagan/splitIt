import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RootStackParamList,
  BillForm,
  BillItem,
  Person,
  CurrencyInfo,
} from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY } from '../constants/currencies';
import {
  calculateSplitAmounts,
  getTotal,
  formatCurrency,
} from '../utils/billUtils';
import Decimal from 'decimal.js';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { Colors } from '../theme/colors';

type NavProp = StackNavigationProp<RootStackParamList, 'SplitSummary'>;

interface Props {
  navigation: NavProp;
}

const SplitSummaryScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [billData, setBillData] = useState<BillForm | null>(null);
  const [splitAmounts, setSplitAmounts] = useState<Decimal[]>([]);

  useEffect(() => {
    void loadBillData();
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

      const parsedItems: BillItem[] = savedItems
        ? JSON.parse(savedItems).map((item: Record<string, unknown>) => ({
            ...item,
            price: new Decimal(String(item.price ?? '0')),
          }))
        : [];

      const people: Person[] = savedPeople ? JSON.parse(savedPeople) : [];
      const currency: CurrencyInfo = savedCurrency
        ? JSON.parse(savedCurrency)
        : DEFAULT_CURRENCY;
      const tax = new Decimal(savedTax || '0');
      const tip = new Decimal(savedTip || '0');
      const splitEvenly = savedSplitEvenly ? JSON.parse(savedSplitEvenly) : true;

      const formData: BillForm = {
        billItems: parsedItems,
        people,
        tax,
        tip,
        splitEvenly,
        currency,
      };

      setBillData(formData);
      if (people.length > 0) {
        setSplitAmounts(calculateSplitAmounts(formData));
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Veriler yüklenemedi');
    }
  };

  const shareResults = async () => {
    if (!billData || splitAmounts.length === 0) {
      return;
    }
    const total = getTotal(billData);
    const lines = billData.people
      .map((person, index) => {
        const amount = splitAmounts[index] || new Decimal(0);
        return `• ${person.name}: ${formatCurrency(
          amount,
          billData.currency.symbol,
        )}`;
      })
      .join('\n');
    const formattedString = `Bölüştürme özeti\n\n${lines}\n\nToplam: ${formatCurrency(
      total,
      billData.currency.symbol,
    )}\n\nOrtak Hesap ile paylaşıldı.`;

    try {
      await Share.share({
        message: formattedString,
        title: 'Bölüştürme özeti',
      });
    } catch (_e) {
      /* noop */
    }
  };

  const startNewSplit = async () => {
    try {
      await AsyncStorage.multiRemove([
        'billItems',
        'people',
        'tax',
        'tip',
        'splitEvenly',
        'receiptRestaurant',
        'receiptDateDisplay',
      ]);
      navigation.navigate('Home');
    } catch (_e) {
      /* noop */
    }
  };

  if (!billData) {
    return (
      <View style={[styles.shell, { paddingTop: insets.top }]}>
        <Text style={styles.loadingTxt}>Yükleniyor…</Text>
      </View>
    );
  }

  const total = getTotal(billData);

  return (
    <View style={[styles.shell, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backGhost}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <FontAwesome6 name="chevron-left" size={22} color={Colors.text} solid />
          <Text style={styles.backGhostTxt}>Geri</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Bölüştürme Özeti</Text>
        <Text style={styles.subtitle}>
          Faturayı şu şekilde bölüştürmelisiniz:
        </Text>

        <View style={{ marginTop: 8 }}>
          {billData.people.map((person, index) => {
            const amount = splitAmounts[index] || new Decimal(0);
            return (
              <View key={person.id} style={styles.sumCard}>
                <Text style={styles.nameCell}>{person.name}</Text>
                <View style={styles.amtCell}>
                  <Text style={styles.curSmall}>{billData.currency.symbol}</Text>
                  <Text style={styles.amtBold}>{amount.toFixed(2)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.totalNote}>
          Toplam:{' '}
          <Text style={styles.totalMut}>
            {billData.currency.symbol} {total.toFixed(2)}
          </Text>
        </Text>

        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => void shareResults()}
        >
          <FontAwesome6 name="share-nodes" size={20} color={Colors.white} solid />
          <Text style={styles.shareBtnTxt}>Paylaş</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => void startNewSplit()}
        >
          <FontAwesome6 name="house" size={20} color={Colors.text} />
          <Text style={styles.homeBtnTxt}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  loadingTxt: {
    marginTop: 40,
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 16,
  },
  scroll: { flex: 1 },
  scrollInner: { paddingBottom: 24 },
  backGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backGhostTxt: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: -4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  sumCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EEE9E4',
  },
  nameCell: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  amtCell: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  curSmall: {
    fontSize: 15,
    color: Colors.textMuted,
    marginRight: 4,
  },
  amtBold: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.text,
  },
  totalNote: {
    marginTop: 12,
    marginBottom: 24,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  totalMut: {
    fontWeight: '700',
    color: Colors.text,
  },
  shareBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  shareBtnTxt: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 17,
  },
  homeBtn: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  homeBtnTxt: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 17,
  },
});

export default SplitSummaryScreen;
