import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // IMPORTANTE

type User = {
  id: number;
  name: string;
  email: string;
  senha: string;
  tipo: string;
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/');
      const users: User[] = await response.json();

      const foundUser = users.find(
        (user) => user.email === email && user.senha === senha
      );

      if (foundUser) {
        // Salvar o ID do usuário no AsyncStorage
        await AsyncStorage.setItem('userId', foundUser.id.toString());

        Alert.alert('Login realizado com sucesso!', `Bem-vindo(a), ${foundUser.name}`);

        if (foundUser.tipo === 'psicologo') {
          router.push('/psychologist');
        } else if (foundUser.tipo === 'paciente') {
          router.push('/patient');
        } else {
          Alert.alert('Erro', 'Tipo de usuário desconhecido.');
        }
      } else {
        Alert.alert('Erro de login', 'E-mail ou senha incorretos.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar à API.');
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: 'center' }}>Login</Text>

      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 5,
          marginBottom: 10,
        }}
      />

      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 5,
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: '#34dcf6',
          padding: 15,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}
