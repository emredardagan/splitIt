import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { Colors } from '../theme/colors';

interface BackLinkProps {
  onPress: () => void;
}

export const BackLink: React.FC<BackLinkProps> = ({ onPress }) => (
  <TouchableOpacity
    style={styles.backRow}
    onPress={onPress}
    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
  >
    <FontAwesome6 name="chevron-left" size={22} color={Colors.text} solid />
    <Text style={styles.backText}>Geri</Text>
  </TouchableOpacity>
);

export function commonScreenPadding() {
  return { paddingHorizontal: 20 };
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    marginLeft: -4,
  },
});
