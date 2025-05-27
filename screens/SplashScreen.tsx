import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const navigation = useNavigation();

  return (
    <LinearGradient
      colors={['#26a69a', '#4db6ac']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={{ 
            uri: 'https://api.a0.dev/assets/image?text=modern%20digital%20business%20card%20app%20logo%20with%20gradient%20and%20minimalist%20design&aspect=1:1'
          }}
          style={styles.logo}
        />
        <Text style={styles.title}>Digital Cards</Text>
        <Text style={styles.subtitle}>Connect & Share Instantly</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 30,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  continueButton: {
    backgroundColor: 'white',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  continueText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#26a69a',
  },
});