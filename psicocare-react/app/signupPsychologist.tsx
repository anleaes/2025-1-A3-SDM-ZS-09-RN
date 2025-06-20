import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function SignUpPsychologist() {
  const router = useRouter();
  const { userId } = useLocalSearchParams(); // recebido da etapa anterior

  const [especialidade, setEspecialidade] = useState('');
  const [crp, setCrp] = useState('');
  const [curriculo, setCurriculo] = useState('');
  const [telefone, setTelefone] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/psychologists/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          especialidade,
          crp,
          curriculo,
          telefone,
          user: parseInt(userId as string),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar psicólogo');
      }

      Alert.alert('Sucesso', 'Cadastro concluído com sucesso!');
      router.push('/psychologist');

    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao cadastrar');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informações do Psicólogo</Text>

      <TextInput
        placeholder="Especialidade"
        style={styles.input}
        value={especialidade}
        onChangeText={setEspecialidade}
      />
      <TextInput
        placeholder="CRP (ex: 123456-SP)"
        style={styles.input}
        value={crp}
        onChangeText={setCrp}
      />
      <TextInput
        placeholder="Currículo"
        style={styles.input}
        value={curriculo}
        onChangeText={setCurriculo}
        multiline
      />
      <TextInput
        placeholder="Telefone"
        style={styles.input}
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
      />

      <Button title="Finalizar Cadastro" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
});
