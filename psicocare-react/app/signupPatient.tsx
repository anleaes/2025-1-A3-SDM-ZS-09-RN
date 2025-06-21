import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';

export default function SignupPatient() {
  const router = useRouter();
  const { userId } = useSearchParams(); // pega o id do usuário criado na etapa anterior

  const [idade, setIdade] = useState('');
  const [genero, setGenero] = useState('');
  const [telefone, setTelefone] = useState('');
  const [planoSaude, setPlanoSaude] = useState('');

  const handleFinishSignup = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/patients/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idade: Number(idade),
          genero,
          telefone,
          plano_saude: planoSaude,
          user: Number(userId),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar cadastro do paciente');
      }

      // Redireciona para a tela do paciente após finalizar
      router.push('/patient');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro no cadastro');
    }
  };

  return (
    <View style={styles.container}>
      {/* Inputs aqui */}
      {/* ... */}
      <Button title="Finalizar Cadastro" onPress={handleFinishSignup} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
});
