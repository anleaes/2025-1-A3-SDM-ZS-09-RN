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
import { toast } from 'react-toastify';


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

type Patient = {
  id: number;
  user: number;
};

type User = {
  id: number;
  name: string;
  email: string;
};

export default function PsychologistAppointments() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [psychologistId, setPsychologistId] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        if (!storedId) {
          Alert.alert('Erro', 'Usuário não identificado.');
          return;
        }

        const userId = Number(storedId);

        // Buscar o psicólogo associado ao user
        const psychologistRes = await fetch(`http://127.0.0.1:8000/api/psychologists/?user=${userId}`);
        const psychologistData = await psychologistRes.json();
        if (!psychologistData.length) throw new Error('Psicólogo não encontrado');

        const psychId = psychologistData[0].id;
        setPsychologistId(psychId);

        // Carregar sessões, usuários e pacientes
        const [sessionsRes, usersRes, patientsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/sessions/'),
          fetch('http://127.0.0.1:8000/api/users/'),
          fetch('http://127.0.0.1:8000/api/patients/'),
        ]);

        const allSessions = await sessionsRes.json();
        const allUsers = await usersRes.json();
        const allPatients = await patientsRes.json();

        const filteredSessions = allSessions.filter(
          (s: Session) => Number(s.psicologo) === psychId
        );

        const sortedSessions = [...filteredSessions].sort((a, b) => {
          const dateA = new Date(`${a.data}T${a.horario}`);
          const dateB = new Date(`${b.data}T${b.horario}`);
          return dateA.getTime() - dateB.getTime();
        });

        setSessions(sortedSessions);
        setUsers(allUsers);
        setPatients(allPatients);
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        Alert.alert('Erro', 'Falha ao carregar os agendamentos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPatientName = (patientId: number) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return 'Paciente não encontrado';

    const user = users.find((u) => u.id === patient.user);
    return user?.name || 'Nome não disponível';
  };

  const confirmDeleteSession = (sessionId: number) => {
      handleDeleteSession(sessionId);
      toast.success('Sessão excluída com sucesso!');
  };

    const handleDeleteSession = async (sessionId: number) => {
    const url = `http://127.0.0.1:8000/api/sessions/delete/${sessionId}/`;

    console.log('🛑 Tentando deletar sessão...');
    console.log('👉 ID da sessão:', sessionId);
    console.log('🔗 URL chamada:', url);

    try {
      const response = await fetch(url, { method: 'DELETE' });

      console.log('📡 Status da resposta:', response.status);
      const text = await response.text();
      console.log('📦 Corpo da resposta:', text);

      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        Alert.alert('Sucesso', 'Sessão cancelada com sucesso.');
        toast.success('Sessão excluída com sucesso!');
      } else {
        Alert.alert('Erro', 'Não foi possível cancelar a sessão.');
      }
    } catch (err) {
      console.error('❌ Erro de conexão ao tentar cancelar sessão:', err);
      Alert.alert('Erro', 'Erro de conexão ao tentar cancelar.');
    }
  };

  const renderCard = ({ item, index }: { item: Session; index: number }) => {
    const isNextSession = index === 0;

    return (
      <View style={[styles.cardWrapper, isNextSession && styles.cardWrapperHighlight]}>
        {isNextSession && (
          <View style={styles.highlightHeader}>
            <Text style={styles.highlightText}>🗓 {item.data} às {item.horario}</Text>
          </View>
        )}

        <View style={[styles.card, !isNextSession && styles.cardSimple]}>
          <Image
            source={require('@/assets/images/psychologist/avatar.jpeg')}
            style={styles.avatar}
          />
          <View style={styles.info}>
            <Text style={styles.name}>{getPatientName(item.paciente)}</Text>
            {!isNextSession && (
              <Text style={styles.specialty}>🗓 {item.data} às {item.horario}</Text>
            )}
            <Text style={styles.status}>Status: {item.status}</Text>
            <Text style={styles.obs}>Obs: {item.observacoes}</Text>

            {isNextSession && item.status.toLowerCase() !== 'cancelada' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => confirmDeleteSession(item.id)}
              >
                <Text style={styles.cancelButtonText}>Cancelar Sessão</Text>
              </TouchableOpacity>
            )}
          </View>
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
      <Text style={styles.title}>Sessões Agendadas</Text>

      {loading ? (
          renderSkeleton()
        ) : sessions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma sessão agendada.</Text>
        ) : (
          <View>
            {/* Sessão mais próxima */}
            <FlatList
              data={[sessions[0]]}
              keyExtractor={(item) => `first-${item.id}`}
              renderItem={({ item }) => renderCard({ item, index: 0 })}
            />

            {/* Título de próximas sessões (caso haja mais) */}
            {sessions.length > 1 && (
              <Text style={styles.sectionTitle}>Próximas Sessões</Text>
            )}

            {/* Demais sessões */}
            <FlatList
              data={sessions.slice(1)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => renderCard({ item, index: index + 1 })}
              scrollEnabled={false}
            />
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 32 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  cardWrapper: {
  marginBottom: 12,
  },
  cardWrapperHighlight: {
    borderTopWidth: 4,
    borderTopColor: '#007bff', // azul
    borderRadius: 8,
    paddingTop: 4,
  },
  highlightHeader: {
    backgroundColor: '#e6f0ff',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#007bff',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 12,
    marginLeft: 4,
  },
  card: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#dedede',
    alignItems: 'center',
  },
  cardSimple: {
    backgroundColor: '#dedede',
  },

  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  specialty: { fontSize: 14, color: '#555', marginTop: 2 },
  status: { fontSize: 14, color: '#007bff', marginTop: 4 },
  obs: { fontSize: 13, color: '#777', marginTop: 2 },

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
  emptyText: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 40 },
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
