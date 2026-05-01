import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { BackLink } from '../components/ScreenChrome';
import { Colors } from '../theme/colors';

function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('tr-TR');
}

function tryParseDateDisplay(s: string): Date | undefined {
  const t = s.trim();
  if (!t) {
    return undefined;
  }
  const numeric = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(t);
  if (numeric) {
    const day = Number(numeric[1]);
    const month = Number(numeric[2]) - 1;
    const year = Number(numeric[3]);
    const dt = new Date(year, month, day);
    if (
      dt.getFullYear() === year &&
      dt.getMonth() === month &&
      dt.getDate() === day
    ) {
      return dt;
    }
  }
  const ts = Date.parse(t);
  if (!Number.isNaN(ts)) {
    return new Date(ts);
  }
  return undefined;
}

type ManualNav = StackNavigationProp<RootStackParamList, 'Manual'>;

interface Props {
  navigation: ManualNav;
}

const ManualScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [restaurant, setRestaurant] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const [iosDraftDate, setIosDraftDate] = useState(() => new Date());

  useEffect(() => {
    loadMeta();
  }, []);

  const loadMeta = async () => {
    try {
      const r = await AsyncStorage.getItem('receiptRestaurant');
      const d = await AsyncStorage.getItem('receiptDateDisplay');
      if (r) {
        setRestaurant(r);
      }
      if (d) {
        const parsed = tryParseDateDisplay(d);
        setDateStr(parsed ? formatDisplayDate(parsed) : '');
      }
    } catch (_e) {
      /* noop */
    }
  };

  const continueNext = async () => {
    try {
      await AsyncStorage.setItem('receiptRestaurant', restaurant.trim());
      await AsyncStorage.setItem('receiptDateDisplay', dateStr.trim());
    } catch (_e) {
      /* noop */
    }
    navigation.navigate('ReceiptItems');
  };

  const back = () => {
    navigation.goBack();
  };

  const openDatePicker = () => {
    const base = tryParseDateDisplay(dateStr) ?? new Date();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: base,
        mode: 'date',
        onValueChange: (_event, selectedDate) => {
          setDateStr(formatDisplayDate(selectedDate));
        },
        onDismiss: () => {},
      });
      return;
    }

    setIosDraftDate(base);
    setIosPickerOpen(true);
  };

  const confirmIosDate = () => {
    setDateStr(formatDisplayDate(iosDraftDate));
    setIosPickerOpen(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <BackLink onPress={back} />
        <Text style={styles.title}>Manuel Giriş</Text>
        <Text style={styles.subtitle}>
          Fişinizin fotoğrafını çekin veya bir görsel yükleyin
        </Text>

        <Text style={styles.label}>Restoran Adı (isteğe bağlı):</Text>
        <TextInput
          style={styles.input}
          placeholder="örn. Piknik"
          placeholderTextColor={Colors.textMuted}
          value={restaurant}
          onChangeText={setRestaurant}
        />

        <Text style={styles.label}>Tarih (isteğe bağlı):</Text>
        <TouchableOpacity
          style={styles.dateRow}
          onPress={openDatePicker}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Tarih seç"
        >
          <FontAwesome6
            name="calendar"
            size={20}
            color={Colors.primary}
            style={styles.calendarIcon}
          />
          <Text
            style={[styles.dateValue, !dateStr.trim() && styles.datePlaceholder]}
            numberOfLines={1}
          >
            {dateStr.trim() ? dateStr : 'Tarih seçmek için dokunun'}
          </Text>
        </TouchableOpacity>

        {Platform.OS === 'ios' && iosPickerOpen ? (
          <Modal transparent animationType="fade" visible={iosPickerOpen}>
            <View style={styles.modalRoot}>
              <Pressable
                style={styles.modalDismissArea}
                onPress={() => setIosPickerOpen(false)}
                accessibilityLabel="Kapat"
              />
              <View
                style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}
              >
                <View style={styles.modalToolbar}>
                  <TouchableOpacity onPress={() => setIosPickerOpen(false)}>
                    <Text style={styles.modalToolbarBtn}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmIosDate}>
                    <Text style={[styles.modalToolbarBtn, styles.modalToolbarPrimary]}>
                      Tamam
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={iosDraftDate}
                  mode="date"
                  display="spinner"
                  locale="tr_TR"
                  onValueChange={(_event, date) => {
                    setIosDraftDate(date);
                  }}
                  themeVariant="light"
                />
              </View>
            </View>
          </Modal>
        ) : null}

        <View style={{ flex: 1, minHeight: 24 }} />
        <TouchableOpacity
          style={styles.cta}
          onPress={() => {
            void continueNext();
          }}
        >
          <Text style={styles.ctaText}>Devam Et</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom }} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.backgroundAlt,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
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
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 18,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  calendarIcon: {
    marginRight: 8,
  },
  dateValue: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
  },
  datePlaceholder: {
    color: Colors.textMuted,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalDismissArea: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
  },
  modalToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  modalToolbarBtn: {
    fontSize: 17,
    color: Colors.textSecondary,
  },
  modalToolbarPrimary: {
    fontWeight: '700',
    color: Colors.primary,
  },
  cta: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default ManualScreen;
