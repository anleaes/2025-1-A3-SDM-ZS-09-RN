import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Session = {
  id: number;
  data: string;
  horario: string;
  status: string;
  psicologo: number;
  paciente: number;
  observacoes: string;
};

type Psychologist = {
  id: number;
  user: number;
};

type User = {
  id: number;
  name: string;
  email: string;
};

export default function Appointments() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedUserId, setLoggedUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        if (!storedId) {
          Alert.alert('Erro', 'Usuário não identificado.');
          return;
        }

        const userId = Number(storedId);
        setLoggedUserId(userId);

        /* */
        const patientRes = await fetch(`http://127.0.0.1:8000/api/patients/?user=${userId}`);
        if (!patientRes.ok) throw new Error('Erro ao buscar paciente');
        
        const patientData = await patientRes.json();
        if (patientData.length === 0) throw new Error('Paciente não encontrado');
        /* */

        const [sessionsRes, psychsRes, usersRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/sessions/'),
          fetch('http://127.0.0.1:8000/api/psychologists/'),
          fetch('http://127.0.0.1:8000/api/users/'),
        ]);

        if (!sessionsRes.ok || !psychsRes.ok || !usersRes.ok) {
          throw new Error('Erro na resposta da API');
        }

        const allSessions = await sessionsRes.json();
        const psychs = await psychsRes.json();
        const allUsers = await usersRes.json();

        const filteredSessions = allSessions.filter(
          (s: Session) => Number(s.paciente) === patientData[0].id
        );

        console.log('Dados carregados:', {
          userId,
          filteredSessions,
          psicologos: psychs,
          usuarios: allUsers,
        });

        setSessions(filteredSessions);
        setPsychologists(psychs);
        setUsers(allUsers);
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        Alert.alert('Erro', 'Falha ao carregar os agendamentos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPsychologistName = (psychId: number) => {
    const psicologo = psychologists.find((p) => p.id === psychId);
    if (!psicologo) return 'Psicólogo não encontrado';

    const user = users.find((u) => u.id === psicologo.user);
    return user?.name || 'Nome não disponível';
  };

  const confirmDeleteSession = (sessionId: number) => {
    Alert.alert(
      'Cancelar sessão',
      'Você tem certeza que deseja cancelar esta sessão?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', onPress: () => handleDeleteSession(sessionId) },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteSession = async (sessionId: number) => {
    try {
      const url = `http://127.0.0.1:8000/api/sessions/delete/${sessionId}/`;
      const response = await fetch(url, { method: 'DELETE' });

      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        Alert.alert('Sucesso', 'Sessão cancelada com sucesso.');
      } else {
        Alert.alert('Erro', 'Não foi possível cancelar a sessão.');
      }
    } catch (err) {
      console.error('Erro ao deletar sessão:', err);
      Alert.alert('Erro', 'Erro de conexão ao tentar cancelar.');
    }
  };

  const renderCard = ({ item }: { item: Session }) => {
    console.log('Renderizando sessão:', item);

    return (
      <View style={styles.card}>
        <Image
          source={require('@/assets/images/psychologist/avatar.jpeg')}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{getPsychologistName(item.psicologo)}</Text>
          <Text style={styles.specialty}>🗓 {item.data} às {item.horario}</Text>
          <Text style={styles.status}>Status: {item.status}</Text>
          <Text style={styles.obs}>Obs: {item.observacoes}</Text>

          {item.status.toLowerCase() !== 'cancelada' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => confirmDeleteSession(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancelar Sessão</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderSkeleton = () => (
    [...Array(3)].map((_, i) => (
      <View key={i} style={styles.card}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonInfo}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '50%' }]} />
          <View style={[styles.skeletonLine, { width: '70%' }]} />
          <View style={[styles.skeletonLine, { width: '40%', marginTop: 12, height: 30, borderRadius: 6 }]} />
        </View>
      </View>
    ))
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Agendamentos</Text>

      {loading ? (
        renderSkeleton()
      ) : sessions.length === 0 ? (
        <Text style={styles.emptyText}>Você ainda não possui agendamentos.</Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 32 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#dedede',
    marginBottom: 12,
    alignItems: 'center',
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  specialty: { fontSize: 14, color: '#555', marginTop: 2 },
  status: { fontSize: 14, color: '#007bff', marginTop: 4 },
  obs: { fontSize: 13, color: '#777', marginTop: 2 },
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 40 },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  skeletonAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
    marginRight: 12,
  },
  skeletonInfo: { flex: 1, justifyContent: 'center' },
  skeletonLine: {
    height: 14,
    backgroundColor: '#ccc',
    borderRadius: 6,
    marginBottom: 8,
    width: '80%',
  },
});
