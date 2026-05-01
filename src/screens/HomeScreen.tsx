import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { Colors } from '../theme/colors';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.flex}>
        <View style={styles.hero}>
          <Image
            source={require('../../assets/home-hero.png')}
            style={styles.heroIcon}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Ortak Hesap uygulama simgesi"
          />
          <Text style={styles.title}>Tara. Dokun. Bölüş.</Text>
          <Text style={styles.subtitle}>
            Fişin fotoğrafını çekin, ürünlerinize dokunun, kimin ne kadar borcu
            olduğunu görün. Kayıt yok, hesap kitap yok, dert yok.
          </Text>
        </View>
        <View style={styles.spacer} />
        <View style={styles.buttonBlock}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Camera')}
            activeOpacity={0.92}
          >
            <FontAwesome6 name="camera" size={20} color={Colors.white} solid />
            <Text style={styles.primaryButtonText}>Fişi Tara</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Manual')}
            activeOpacity={0.92}
          >
            <Text style={styles.secondaryButtonText}>Manuel Giriş Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tertiaryLink}
            onPress={() => navigation.navigate('CurrencySelector')}
          >
            <FontAwesome6 name="coins" size={18} color={Colors.textSecondary} solid />
            <Text style={styles.tertiaryLinkText}>Para birimi seç</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  flex: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 28,
  },
  heroIcon: {
    width: 128,
    height: 128,
  },
  spacer: {
    flex: 1,
    minHeight: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 28,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  buttonBlock: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    paddingBottom: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    gap: 10,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  tertiaryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  tertiaryLinkText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});

export default HomeScreen;
