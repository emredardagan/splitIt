import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { BackLink } from '../components/ScreenChrome';
import { Colors } from '../theme/colors';

type Nav = StackNavigationProp<RootStackParamList, 'Camera'>;

interface Props {
  navigation: Nav;
}

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const goProcess = () => {
    navigation.navigate('ReceiptItems');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.inner}>
        <BackLink onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Fişi Tara</Text>
        <Text style={styles.subtitle}>
          Fişinizin fotoğrafını çekin veya bir görsel yükleyin
        </Text>

        <View style={styles.card}>
          <View style={styles.dashed}>
            <View style={styles.camWrap}>
              <FontAwesome6 name="camera" size={56} color={Colors.brownIcon} solid />
              <FontAwesome6
                name="wand-magic-sparkles"
                size={18}
                color={Colors.primary}
                style={styles.sparkleL}
                solid
              />
              <FontAwesome6
                name="wand-magic-sparkles"
                size={14}
                color={Colors.salmon}
                style={styles.sparkleR}
                solid
              />
            </View>
            <Text style={styles.boldHint}>Fotoğraf çek</Text>
            <TouchableOpacity onPress={goProcess} activeOpacity={0.7}>
              <Text style={styles.link}>veya fiş yükle</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1, minHeight: 12 }} />

        <TouchableOpacity style={styles.primary} onPress={goProcess}>
          <Text style={styles.primaryTxt}>Fişi İşle</Text>
        </TouchableOpacity>

        <View style={{ height: insets.bottom }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9F4F1',
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  dashed: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1C9C2',
    borderRadius: 14,
    paddingVertical: 36,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  camWrap: {
    position: 'relative',
    marginBottom: 16,
  },
  sparkleL: {
    position: 'absolute',
    left: -8,
    top: 4,
  },
  sparkleR: {
    position: 'absolute',
    right: -10,
    bottom: 2,
  },
  boldHint: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  link: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  primary: {
    backgroundColor: Colors.salmonMuted,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryTxt: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 17,
  },
});

export default CameraScreen;
