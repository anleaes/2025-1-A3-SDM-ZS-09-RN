import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function PsychologistHome() {
  // Exemplo simples de boas vindas e um botão para futuras ações
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo, Psicólogo!</Text>
      <Text style={styles.subtitle}>Aqui você pode gerenciar suas consultas, pacientes e planos terapêuticos.</Text>
      
      <Button
        title="Ver minhas consultas"
        onPress={() => {
          // Aqui você pode navegar para uma tela de consultas, por exemplo
          alert('Funcionalidade em construção!');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
});
