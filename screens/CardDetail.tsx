import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';

export default function CardDetail() {
  const navigation = useNavigation();
  const route = useRoute();

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out my digital business card!',
        url: `https://yourapp.com/card/${route.params?.cardId}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Details</Text>
        <TouchableOpacity onPress={handleShare}>
          <MaterialIcons name="share" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.title}>Software Engineer</Text>
          <Text style={styles.company}>Tech Company Inc.</Text>
        </View>

        <View style={styles.qrContainer}>
          <QRCode
            value="https://yourapp.com/card/1"
            size={200}
            color="#333"
            backgroundColor="white"
          />
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MaterialIcons name="email" size={20} color="#666" />
            <Text style={styles.detailText}>john.doe@example.com</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="phone" size={20} color="#666" />
            <Text style={styles.detailText}>+1 234 567 8900</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="language" size={20} color="#666" />
            <Text style={styles.detailText}>www.example.com</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton}>
          <MaterialIcons name="edit" size={20} color="white" />
          <Text style={styles.editButtonText}>Edit Card</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#26a69a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: '#999',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  details: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
  },
  actions: {
    padding: 16,
  },
  editButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});