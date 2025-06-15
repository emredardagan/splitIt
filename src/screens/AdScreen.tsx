import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import Ionicons from 'react-native-vector-icons/Ionicons';

type AdScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdScreen'>;

interface Props {
  navigation: AdScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const AdScreen: React.FC<Props> = ({ navigation }) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Start countdown
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

    // Auto navigate after 5 seconds
    const autoNavigate = setTimeout(() => {
      navigation.replace('SplitSummary');
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(autoNavigate);
    };
  }, []);

  const skipAd = () => {
    if (canSkip) {
      navigation.replace('SplitSummary');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Skip Button */}
        <TouchableOpacity
          style={[
            styles.skipButton,
            !canSkip && styles.skipButtonDisabled
          ]}
          onPress={skipAd}
          disabled={!canSkip}
        >
          <Text style={styles.skipButtonText}>
            {canSkip ? 'Skip Ad' : `Skip in ${countdown}s`}
          </Text>
        </TouchableOpacity>

        {/* Ad Content */}
        <View style={styles.adContent}>
          <View style={styles.adIcon}>
            {/* Icon content remains unchanged */}
          </View>
          
          <Text style={styles.adTitle}>
            🎉 Special Offer! 🎉
          </Text>
          
          <Text style={styles.adSubtitle}>
            Get Premium Features
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text style={styles.featureText}>Unlimited bill splits</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text style={styles.featureText}>Advanced receipt scanning</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text style={styles.featureText}>Export to PDF</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
              <Text style={styles.featureText}>No ads</Text>
            </View>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.originalPrice}>$9.99/month</Text>
            <Text style={styles.discountPrice}>$4.99/month</Text>
            <Text style={styles.discountBadge}>50% OFF</Text>
          </View>

          <TouchableOpacity style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Get Premium Now</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Limited time offer • Cancel anytime
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: `${((5 - countdown) / 5) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      </Animated.View>
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
    paddingVertical: 20,
  },
  skipButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(30, 41, 57, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  skipButtonDisabled: {
    backgroundColor: 'rgba(156, 163, 175, 0.3)',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#1e2939',
    fontWeight: '500',
  },
  adContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  adIcon: {
    marginBottom: 20,
  },
  adTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e2939',
    textAlign: 'center',
    marginBottom: 8,
  },
  adSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4a5565',
    textAlign: 'center',
    marginBottom: 30,
  },
  featuresList: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#1e2939',
    marginLeft: 12,
    flex: 1,
  },
  priceSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  originalPrice: {
    fontSize: 16,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  discountPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e2939',
    marginBottom: 8,
  },
  discountBadge: {
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ctaButton: {
    backgroundColor: '#1e2939',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    minWidth: 200,
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#6a7282',
    textAlign: 'center',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1e2939',
    borderRadius: 2,
  },
});

export default AdScreen; 