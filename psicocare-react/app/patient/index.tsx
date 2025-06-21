import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { Card } from '@/components/Cards';  
import { CardBlog } from '@/components/CardBlog';

export default function PatientHome() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.pageTitle}>O que você deseja{'\n'}fazer hoje?</Text>

      {/* Cards principais */}
      <Card title="Agendar uma nova consulta" onPress={() => router.push('/patient/schedule')}>
        <Text>Marque sua próxima sessão com facilidade.</Text>
      </Card>

      <Card title="Visualizar agendamentos anteriores" onPress={() => router.push('/patient/appointments')}>
        <Text>Veja seu histórico de consultas realizadas.</Text>
      </Card>

      {/* Seção de blog */}
      <Text style={styles.sectionTitle}>Conteúdos para você</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <CardBlog
          title="Como lidar com ansiedade"
          image={require('@/assets/images/blog/blog1.jpeg')}
        />
        <CardBlog
          title="Importância da rotina"
          image={require('@/assets/images/blog/blog2.jpeg')}
        />
        <CardBlog
          title="Sono e saúde mental"
          image={require('@/assets/images/blog/blog3.jpeg')}
        />
      </ScrollView>

      {/* Seção de ajuda */}
      <Text style={styles.sectionTitle}>Precisa de ajuda?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <CardBlog
          title="Como agendar uma sessão"
          image={require('@/assets/images/help/help1.jpg')}
        />
        <CardBlog
          title="Alterar dados da conta"
          image={require('@/assets/images/help/help2.jpeg')}
        />
        <CardBlog
          title="Contato com suporte"
          image={require('@/assets/images/help/help3.jpeg')}
        />
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: '#222',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 32,
    marginBottom: 12,
    color: '#333',
  },
  horizontalScroll: {
    marginBottom: 16,
  },
});
