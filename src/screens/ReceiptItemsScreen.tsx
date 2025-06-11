import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

type ReceiptItemsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ReceiptItems'>;

interface Props {
  navigation: ReceiptItemsScreenNavigationProp;
}

const ReceiptItemsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Receipt Items</Text>
        <Text style={styles.subtitle}>This screen will show scanned receipt items</Text>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e2939',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4a5565',
    textAlign: 'center',
  },
});

export default ReceiptItemsScreen; 