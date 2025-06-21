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
  paciente: number;
  psicologo: number;
};

type User = {
  id: number;
  name: string;
  email: string;
};

export default function PsychologistDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedPsychId, setLoggedPsychId] = useState<number | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storedId = await AsyncStorage.getItem('userId');
        if (!storedId) {
          Alert.alert('Erro', 'Usuário não autenticado.');
          return;
        }

        const userId = Number(storedId);
        setLoggedPsychId(userId);

        const [sessionsRes, usersRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/sessions/'),
          fetch('http://127.0.0.1:8000/api/users/'),
        ]);

        const sessionsData: Session[] = await sessionsRes.json();
        const usersData: User[] = await usersRes.json();

        const today = new Date();
        const futureSessions = sessionsData.filter(
          (session) =>
            session.psicologo === userId &&
            new Date(session.data + 'T' + session.horario) >= today
        );

        // Ordenar por data/hora
        futureSessions.sort(
          (a, b) =>
            new Date(`${a.data}T${a.horario}`).getTime() -
            new Date(`${b.data}T${b.horario}`).getTime()
        );

        setSessions(futureSessions);
        setUsers(usersData);
      } catch (error) {
        console.error('Erro ao buscar sessões:', error);
        Alert.alert('Erro', 'Falha ao carregar sessões.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getPatientName = (patientId: number) => {
    const user = users.find((u) => u.id === patientId);
    return user?.name || 'Paciente não encontrado';
  };

  const confirmDeleteSession = (sessionId: number) => {
    Alert.alert(
      'Cancelar Sessão',
      'Tem certeza que deseja cancelar esta sessão?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', onPress: () => handleDelete(sessionId) },
      ]
    );
  };

  const handleDelete = async (sessionId: number) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/sessions/delete/${sessionId}/`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        Alert.alert('Sucesso', 'Sessão cancelada.');
      } else {
        const errorText = await res.text();
        console.error('Erro:', errorText);
        Alert.alert('Erro', 'Não foi possível cancelar a sessão.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      Alert.alert('Erro', 'Erro de conexão ao cancelar.');
    }
  };

  const renderCard = ({
    item,
    isPrimary = false,
  }: {
    item: Session;
    isPrimary?: boolean;
  }) => {
    if (isPrimary) {
      // Card COMPLETO (mais próximo)
      return (
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.headerText}>
              📅 {formatDate(item.data)} às {item.horario}
            </Text>
          </View>
          <View style={styles.cardContentAlignedLeft}>
            <View style={styles.cardRow}>
              <Image
                source={require('@/assets/images/psychologist/avatar.jpeg')}
                style={styles.avatar}
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.patientName}>{getPatientName(item.paciente)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.declineBtnAligned}
              onPress={() => confirmDeleteSession(item.id)}
            >
              <Text style={styles.declineText}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Card SIMPLES
    return (
      <View style={[styles.cardContainer, { backgroundColor: '#f9f9f9', elevation: 0 }]}>
        <View style={styles.cardContentAlignedLeft}>
          <View style={styles.cardRow}>
            <Image
              source={require('@/assets/images/psychologist/avatar.jpeg')}
              style={styles.avatar}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.patientName}>{getPatientName(item.paciente)}</Text>
              <Text style={{ color: '#555' }}>
                {formatDate(item.data)} às {item.horario}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSkeleton = () =>
    [...Array(3)].map((_, index) => (
      <View key={index} style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <View style={[styles.skeletonLine, { width: '70%', height: 16, backgroundColor: '#a6c8ff' }]} />
        </View>
        <View style={[styles.cardContent, { alignItems: 'center' }]}>
          <View style={styles.skeletonAvatar} />
          <View style={{ height: 12 }} />
          <View style={[styles.skeletonLine, { width: '50%' }]} />
          <View style={[styles.skeletonLine, { width: '30%', marginTop: 8 }]} />
        </View>
      </View>
    ));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo de volta</Text>

      {loading ? (
        renderSkeleton()
      ) : sessions.length === 0 ? (
        <Text style={styles.empty}>Nenhuma sessão agendada.</Text>
      ) : (
        <>
          {renderCard({ item: sessions[0], isPrimary: true })}

          {sessions.length > 1 && (
            <>
              <Text style={styles.subtitle}>Próximas sessões</Text>
              {sessions.slice(1).map((session) =>
                renderCard({ item: session, isPrimary: false })
              )}
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 32 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  empty: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },

  cardContainer: {
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#007bff',
    padding: 10,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 12,
    alignItems: 'center',
  },
  cardContentAlignedLeft: {
    padding: 12,
    alignItems: 'flex-start',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  declineBtnAligned: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  declineText: {
    color: '#000',
    fontWeight: 'bold',
  },

  // Skeletons
  skeletonAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
  },
  skeletonLine: {
    height: 14,
    backgroundColor: '#ccc',
    borderRadius: 6,
    marginTop: 6,
  },
});
