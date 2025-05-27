import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Camera, CameraType } from 'expo-camera';
import { toast } from 'sonner-native';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function ScanQR() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    
    try {
      const parsedData = JSON.parse(data);
      
      // Validate the scanned data format
      if (!parsedData.userId || !parsedData.name) {
        throw new Error('Invalid card format');
      }

      toast.success('Card scanned successfully!');
      
      // Navigate back to home and trigger save
      navigation.navigate('Home', { 
        scannedData: {
          ...parsedData,
          scannedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      toast.error('Invalid QR code format');
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}>
      <Text style={styles.text}>Requesting camera permission...</Text>
    </View>;
  }

  if (hasPermission === false) {
    return <View style={styles.container}>
      <Text style={styles.text}>No access to camera</Text>
    </View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          style={styles.closeButton}
        >
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <View style={{ width: 24 }} />
      </View>      <View style={styles.cameraContainer}>
        <Camera
          type={CameraType.back}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          barCodeScannerSettings={{
            barCodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={styles.cornerTL} />
              <View style={styles.cornerTR} />
              <View style={styles.cornerBL} />
              <View style={styles.cornerBR} />
            </View>
          </View>
        </Camera>
      </View>

      <View style={styles.footer}>
        <Text style={styles.instructions}>
          Position the QR code within the frame to scan
        </Text>
        {scanned && (
          <TouchableOpacity 
            style={styles.rescanButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.rescanButtonText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderColor: '#26a69a',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderColor: '#26a69a',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#26a69a',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#26a69a',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  instructions: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  rescanButton: {
    backgroundColor: '#26a69a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  rescanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});