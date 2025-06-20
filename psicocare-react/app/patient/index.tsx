import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function PatientHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo, Paciente!</Text>
      <Text style={styles.subtitle}>Aqui você pode agendar consultas, acompanhar seu plano terapêutico e fazer pagamentos.</Text>
      
      <Button
        title="Agendar Consulta"
        onPress={() => {
          // Futuramente aqui pode abrir a tela de agendamento
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
