import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

const loggedUserId = 2; // Substitua pelo ID real do usuário logado

type Psychologist = {
  id: number;
  especialidade: string;
  crp: string;
  curriculo: string;
  telefone: string;
  user: number;
};

type Specialty = {
  id: number;
  nome: string;
  descricao: string;
};

type PsychologistSpecialty = {
  id: number;
  psicologo: number;
  especialidade: number;
};

type User = {
  id: number;
  name: string;
  email: string;
};

export default function ScheduleScreen() {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [relations, setRelations] = useState<PsychologistSpecialty[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPsychologist, setSelectedPsychologist] = useState<Psychologist | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [planDescription, setPlanDescription] = useState('');
  const [planObjectives, setPlanObjectives] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resPsych, resSpecs, resRelations, resUsers] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/psychologists/'),
          fetch('http://127.0.0.1:8000/api/specialties/'),
          fetch('http://127.0.0.1:8000/api/psychologist-specialties/'),
          fetch('http://127.0.0.1:8000/api/users/'),
        ]);

        const dataPsych = await resPsych.json();
        const dataSpecs = await resSpecs.json();
        const dataRelations = await resRelations.json();
        const dataUsers = await resUsers.json();

        setPsychologists(dataPsych);
        setSpecialties(dataSpecs);
        setRelations(dataRelations);
        setUsers(dataUsers);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || 'Nome não encontrado';
  };

  const getSpecialtyName = (psychologistId: number) => {
    const relation = relations.find((r) => r.psicologo === psychologistId);
    const specialty = specialties.find((s) => s.id === relation?.especialidade);
    return specialty?.nome || 'Especialidade não encontrada';
  };

  const openModal = (psychologist: Psychologist) => {
    setSelectedPsychologist(psychologist);
    setModalVisible(true);
  };

  const renderCard = ({ item }: { item: Psychologist }) => (
    <TouchableOpacity onPress={() => openModal(item)} style={styles.card}>
      <Image
        source={require('@/assets/images/psychologist/avatar.jpeg')}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{getUserName(item.user)}</Text>
        <Text style={styles.specialty}>{getSpecialtyName(item.id)}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={28} color="#888" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Psicólogos disponíveis</Text>
        {[...Array(5)].map((_, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.skeletonInfo}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: '60%' }]} />
            </View>
            <View style={styles.skeletonIcon} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Psicólogos disponíveis</Text>

      <FlatList
        data={psychologists}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCard}
      />

      {selectedPsychologist && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{getUserName(selectedPsychologist.user)}</Text>
              <Text style={styles.modalSubtitle}>{getSpecialtyName(selectedPsychologist.id)}</Text>

              {step === 1 && (
                <>
                  <Text style={styles.modalText}>CRP: {selectedPsychologist.crp}</Text>
                  <Text style={styles.modalText}>{selectedPsychologist.curriculo}</Text>

                  <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Selecione a data:</Text>
                  <Calendar
                    onDayPress={(day) => setSelectedDate(day.dateString)}
                    markedDates={{
                      [selectedDate]: { selected: true, selectedColor: '#007bff' },
                    }}
                  />

                  <Text style={{ marginTop: 12 }}>Horário disponível:</Text>
                  <TextInput
                    placeholder="Ex: 14:00:00"
                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginTop: 4 }}
                    value={selectedTime}
                    onChangeText={setSelectedTime}
                  />

                  <TouchableOpacity
                    style={{ backgroundColor: '#007bff', marginTop: 16, padding: 12, borderRadius: 6 }}
                    onPress={() => {
                      if (!selectedDate || !selectedTime) {
                        Alert.alert('Erro', 'Selecione a data e o horário!');
                      } else {
                        setStep(2);
                      }
                    }}
                  >
                    <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                      Avançar para Plano Terapêutico
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {step === 2 && (
                <>
                  <Text style={{ fontWeight: 'bold' }}>Descrição do plano:</Text>
                  <TextInput
                    placeholder="Ex: Plano para acompanhamento semanal"
                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginVertical: 8 }}
                    value={planDescription}
                    onChangeText={setPlanDescription}
                  />

                  <Text style={{ fontWeight: 'bold' }}>Objetivos:</Text>
                  <TextInput
                    placeholder="Ex: Reduzir ansiedade"
                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }}
                    value={planObjectives}
                    onChangeText={setPlanObjectives}
                  />

                  <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Data fim (opcional):</Text>
                  <TextInput
                    placeholder="Ex: 2025-09-01"
                    style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }}
                    value={selectedEndDate}
                    onChangeText={setSelectedEndDate}
                  />

                  <TouchableOpacity
                    style={{ backgroundColor: '#28a745', marginTop: 16, padding: 12, borderRadius: 6 }}
                    onPress={() => {
                      if (!planDescription || !planObjectives) {
                        Alert.alert('Erro', 'Preencha os campos do plano!');
                      } else {
                        setStep(3);
                      }
                    }}
                  >
                    <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                      Avançar para Pagamento
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {step === 3 && (
                <>
                  <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Valor: R$200,00</Text>

                  <TouchableOpacity
                    style={{ backgroundColor: '#ffc107', marginTop: 16, padding: 12, borderRadius: 6, opacity: isSubmitting ? 0.7 : 1 }}
                    onPress={async () => {
                      setIsSubmitting(true);
                      try {
                        const therapyPayload: any = {
                          descricao: planDescription,
                          objetivos: planObjectives,
                          data_inicio: selectedDate,
                          paciente: loggedUserId,
                          psicologo: selectedPsychologist.id,
                        };

                        if (selectedEndDate.trim()) {
                          therapyPayload.data_fim = selectedEndDate;
                        }

                        const therapyRes = await fetch('http://127.0.0.1:8000/api/therapy-plans/create/', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(therapyPayload),
                        });

                        if (!therapyRes.ok) throw new Error('Erro ao criar plano terapêutico');
                        const therapyPlan = await therapyRes.json();

                        const sessionRes = await fetch('http://127.0.0.1:8000/api/sessions/create/', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            data: selectedDate,
                            horario: selectedTime,
                            status: 'agendada',
                            observacoes: 'Primeira sessão',
                            paciente: loggedUserId,
                            psicologo: selectedPsychologist.id,
                            plano: therapyPlan.id,
                          }),
                        });
                        if (!sessionRes.ok) throw new Error('Erro ao criar sessão');
                        const session = await sessionRes.json();

                        const paymentRes = await fetch('http://127.0.0.1:8000/api/payments/create/', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            valor: 200.0,
                            metodo: 'pix',
                            status: 'pago',
                            data: selectedDate,
                            sessao: session.id,
                          }),
                        });

                        if (!paymentRes.ok) throw new Error('Erro ao criar pagamento');

                        Alert.alert('Sucesso', 'Agendamento concluído com sucesso!');
                        setModalVisible(false);
                        setStep(1);
                        setSelectedDate('');
                        setSelectedTime('');
                        setPlanDescription('');
                        setPlanObjectives('');
                        setSelectedEndDate('');
                      } catch (error) {
                        console.error(error);
                        Alert.alert('Erro', 'Falha ao concluir o agendamento.');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    <Text style={{ color: '#000', textAlign: 'center', fontWeight: 'bold' }}>
                      {isSubmitting ? 'Processando...' : 'Finalizar e Pagar'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setStep(1);
                  setSelectedDate('');
                  setSelectedTime('');
                  setPlanDescription('');
                  setPlanObjectives('');
                  setSelectedEndDate('');
                }}
                style={styles.closeButton}
              >
                <Text style={{ color: '#fff' }}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  specialty: { fontSize: 14, color: '#555' },
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
  skeletonIcon: {
    width: 28,
    height: 28,
    backgroundColor: '#ccc',
    borderRadius: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  modalSubtitle: { fontSize: 16, color: '#666', marginBottom: 12 },
  modalText: { fontSize: 14, marginBottom: 8 },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
});
