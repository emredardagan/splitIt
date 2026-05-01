import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { Colors } from '../theme/colors';

type AdNav = StackNavigationProp<RootStackParamList, 'AdScreen'>;

interface Props {
  navigation: AdNav;
}

const { width } = Dimensions.get('window');

const AdScreen: React.FC<Props> = ({ navigation }) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.85);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const nav = setTimeout(() => {
      navigation.replace('SplitSummary');
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(nav);
    };
  }, []);

  const skipAd = () => {
    if (canSkip) {
      navigation.replace('SplitSummary');
    }
  };

  return (
    <View style={[styles.container, { width }]}>
      <Animated.View
        style={[
          styles.box,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <TouchableOpacity
          style={[styles.skipBtn, !canSkip && styles.skipMuted]}
          onPress={skipAd}
          disabled={!canSkip}
        >
          <Text style={styles.skipTxt}>
            {canSkip ? 'Atlayın' : `${countdown} sn sonra atlayabilirsiniz`}
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <FontAwesome6 name="wand-magic-sparkles" size={40} color={Colors.primary} solid />
          <Text style={styles.title}>Ortak Hesap ile tam deneyime geç</Text>
          <Text style={styles.lead}>Yakında daha fazlası</Text>

          <View style={styles.bullets}>
            <Bullet text="Akıllı fiş çıkarma" />
            <Bullet text="Tam geçmiş" />
          </View>

          <TouchableOpacity activeOpacity={0.9}>
            <View style={styles.ctaGhost}>
              <Text style={styles.ctaGhostTxt}>Yakında</Text>
              <FontAwesome6 name="arrow-right" size={18} color={Colors.white} solid />
            </View>
          </TouchableOpacity>
          <Text style={styles.foot}>
            Geçiş ekranı — hesap özeti bir sonraki adımda
          </Text>
        </View>

        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              { width: `${((5 - Math.max(countdown, 0)) / 5) * 100}%` },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const Bullet = ({ text }: { text: string }) => (
  <View style={styles.bulletRow}>
    <FontAwesome6 name="circle-check" size={18} color={Colors.primary} solid />
    <Text style={styles.bulletTxt}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.backgroundAlt,
    justifyContent: 'center',
  },
  box: {
    flex: 1,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(30,41,57,0.08)',
    marginBottom: 16,
  },
  skipMuted: {
    opacity: 0.5,
  },
  skipTxt: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '600',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EEE9E4',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  lead: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  bullets: {
    alignSelf: 'stretch',
    marginVertical: 12,
    gap: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  bulletTxt: {
    fontSize: 15,
    color: Colors.text,
  },
  ctaGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.text,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 8,
    minWidth: 200,
    opacity: 0.35,
  },
  ctaGhostTxt: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  foot: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 12,
    textAlign: 'center',
  },
  barBg: {
    height: 4,
    backgroundColor: '#E5DFDB',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 22,
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});

export default AdScreen;
