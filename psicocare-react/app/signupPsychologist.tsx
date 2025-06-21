import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function SignUpPsychologist() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();

  // Agora specialties é um array de objetos { id, nome }
  const [specialties, setSpecialties] = useState<{ id: number; nome: string }[]>([]);
  const [especialidade, setEspecialidade] = useState<number | null>(null);
  const [crp, setCrp] = useState('');
  const [curriculo, setCurriculo] = useState('');
  const [telefone, setTelefone] = useState('');

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/specialties/');
        const data = await response.json();
        setSpecialties(data); // assume que data é [{id:..., nome:...}, ...]
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar as especialidades');
      }
    };

    fetchSpecialties();
  }, []);

  const handleSubmit = async () => {
    if (!especialidade) {
      Alert.alert('Erro', 'Por favor, selecione uma especialidade');
      return;
    }

    try {
      // 1. Cria o psicólogo
      const responsePsychologist = await fetch('http://127.0.0.1:8000/api/psychologists/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crp,
          curriculo,
          telefone,
          user: parseInt(userId as string),
        }),
      });

      if (!responsePsychologist.ok) {
        throw new Error('Erro ao cadastrar psicólogo');
      }

      const createdPsychologist = await responsePsychologist.json();
      const psicologoId = createdPsychologist.id; // Ajuste conforme a resposta do backend

      // 2. Cria a relação psicólogo-especialidade
      const responseRelation = await fetch('http://127.0.0.1:8000/api/psychologist-specialties/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          psicologo: psicologoId,
          especialidade: especialidade,
        }),
      });

      if (!responseRelation.ok) {
        throw new Error('Erro ao salvar especialidade do psicólogo');
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

      <Text style={styles.label}>Especialidade</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={especialidade}
          onValueChange={(itemValue) => setEspecialidade(itemValue)}
        >
          <Picker.Item label="Selecione uma especialidade" value={null} />
          {specialties.map((esp) => (
            <Picker.Item key={esp.id} label={esp.nome} value={esp.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>CRP</Text>
      <TextInput
        placeholder="CRP (ex: 123456-SP)"
        style={styles.input}
        value={crp}
        onChangeText={setCrp}
      />

      <Text style={styles.label}>Currículo</Text>
      <TextInput
        placeholder="Currículo"
        style={styles.input}
        value={curriculo}
        onChangeText={setCurriculo}
        multiline
      />

      <Text style={styles.label}>Telefone</Text>
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
  label: { marginBottom: 4, marginTop: 12, fontSize: 16, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
