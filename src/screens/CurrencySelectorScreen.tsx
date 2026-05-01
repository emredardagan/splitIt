import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, CurrencyInfo } from '../types';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants/currencies';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { BackLink } from '../components/ScreenChrome';
import { Colors } from '../theme/colors';

type NavProp = StackNavigationProp<RootStackParamList, 'CurrencySelector'>;

interface Props {
  navigation: NavProp;
}

const CurrencySelectorScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedCurrency, setSelectedCurrency] =
    useState<CurrencyInfo>(DEFAULT_CURRENCY);

  useEffect(() => {
    void (async () => {
      try {
        const saved = await AsyncStorage.getItem('selectedCurrency');
        if (saved) {
          setSelectedCurrency(JSON.parse(saved));
        }
      } catch (_e) {
        /* noop */
      }
    })();
  }, []);

  const saveCurrency = async (currency: CurrencyInfo) => {
    try {
      await AsyncStorage.setItem('selectedCurrency', JSON.stringify(currency));
      setSelectedCurrency(currency);
      navigation.goBack();
    } catch (_e) {
      /* noop */
    }
  };

  const renderItem = ({ item }: { item: CurrencyInfo }) => {
    const on = selectedCurrency.code === item.code;
    return (
      <TouchableOpacity
        style={[styles.currencyItem, on && styles.currencyItemSel]}
        onPress={() => void saveCurrency(item)}
      >
        <View style={styles.currencyInfo}>
          <Text style={styles.currencySymbol}>{item.symbol}</Text>
          <View>
            <Text style={styles.currencyCode}>{item.code}</Text>
            <Text style={styles.currencyName}>{item.name}</Text>
          </View>
        </View>
        {on ? (
          <FontAwesome6 name="circle-check" size={26} color={Colors.primary} solid />
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.shell, { paddingTop: insets.top }]}>
      <BackLink onPress={() => navigation.goBack()} />
      <Text style={styles.title}>Para Birimi Seç</Text>
      <Text style={styles.sub}>
        Hesap özeti için kullanılacak sembolü ve birimi seçin
      </Text>
      <FlatList
        data={CURRENCIES}
        renderItem={renderItem}
        keyExtractor={(item) => item.code}
        style={styles.list}
      />
      <View style={{ height: insets.bottom }} />
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  list: { flex: 1 },
  currencyItem: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  currencyItemSel: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF8F3',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 16,
    minWidth: 40,
    textAlign: 'center',
  },
  currencyCode: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  currencyName: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },
});

export default CurrencySelectorScreen;
