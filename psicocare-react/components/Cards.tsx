// components/Card.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type CardProps = {
  title: string;
  onPress: () => void;
  children?: React.ReactNode;
};

export function Card({ title, onPress, children }: CardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.content}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {children}
        </View>
        <MaterialIcons name="keyboard-arrow-right" size={28} color="#333" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#dedede',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    // sombra simples para iOS/Android
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
});
