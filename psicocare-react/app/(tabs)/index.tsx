import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('@/assets/images/3712074.jpg')} // pode trocar pela sua imagem
          style={styles.image}
          contentFit="cover"
        />
      </View>

      <View style={styles.buttonsContainer}>
        <Text style={styles.welcomeTitle}>Bem-vindo</Text>
        <Text style={styles.welcomeSubtitle}>O que deseja fazer hoje?</Text>

        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.buttonText}>Cadastrar-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonsContainer: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 18,
    textAlign: 'left',
    marginBottom: 24,
    color: '#555',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#3478f6',
  },
  signupButton: {
    backgroundColor: '#34c759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
