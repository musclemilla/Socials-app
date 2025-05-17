import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface ProfileSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profileData: any) => void;
  initialData?: any;
}

export const ProfileSetupModal = ({ visible, onClose, onSave, initialData }: ProfileSetupModalProps) => {
  const [profileData, setProfileData] = React.useState({
    name: '',
    bio: '',
    location: '',
    image: '',
    bgColor: '#26a69a',
    borderColor: '#4db6ac',
    chatApp: null,
    isPublic: true
  });

  const [selectedChatApp, setSelectedChatApp] = React.useState('Messenger');  const [isProfilePublic, setIsProfilePublic] = React.useState(true);
  const [isSignIn, setIsSignIn] = React.useState(true);
  const [authData, setAuthData] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const chatApps = [
    { name: 'WhatsApp', image: { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965610/whatsAppicon_ksnxcr.png' } },
    { name: 'Messenger', image: { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965610/messanger_orvw6q.png' } },
    { name: 'Telegram', image: { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965610/telegram_synfdv.png' } },
    { name: 'Viber', image: { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1747063516/viber_jth6pp.png' } },
  ];

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };  const handleSave = () => {
    if (!profileData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    const updatedProfile = {
      ...profileData,
      chatApp: selectedChatApp,
      isPublic: isProfilePublic,
    };
    onSave(updatedProfile);
    onClose();
    
    // Clear the form
    setProfileData({
      name: '',
      bio: '',
      location: '',
      image: '',
      bgColor: '#26a69a',
      borderColor: '#4db6ac',
      chatApp: selectedChatApp,
      isPublic: isProfilePublic
    });
  };

  return (
    <View style={styles.modalScrollView}>
      <View style={styles.modalContentEdit}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Your Card</Text>
        </View>              <TouchableOpacity style={styles.profileImageEdit} onPress={pickImage}>
                {profileData.image ? (
                  <Image
                    source={{ uri: profileData.image }}
                    style={styles.editProfileImage}
                  />
                ) : (
                  <View style={styles.emptyImageContainer}>
                    <MaterialIcons name="person-outline" size={40} color="#ccc" />
                  </View>
                )}
                <View style={styles.editImageOverlay}>
                  <MaterialIcons name="camera-alt" size={20} color="white" />
                </View>
              </TouchableOpacity>
        <TextInput
          style={styles.editInput}
          placeholder="Your Name"
          value={profileData.name}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
        />

        <TextInput
          style={[styles.editInput, styles.bioInput]}
          placeholder="Your Bio"
          value={profileData.bio}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
          multiline
        />

        <View style={styles.locationInputContainer}>
          <MaterialIcons name="location-on" size={20} color="#666" />
          <TextInput
            style={[styles.editInput, styles.locationInput]}
            placeholder="Your Location"
            value={profileData.location}
            onChangeText={(text) => setProfileData(prev => ({ ...prev, location: text }))}
          />
        </View>

        <Text style={styles.sectionTitle}>Select Chat App</Text>
        <View style={styles.chatAppsContainer}>
          {chatApps.map((app) => (
            <TouchableOpacity
              key={app.name}
              style={[
                styles.chatAppButton,
                selectedChatApp === app.name && styles.chatAppButtonSelected
              ]}
              onPress={() => setSelectedChatApp(app.name)}
            >
              <Image source={app.image} style={styles.chatAppIcon} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Auth Section */}
              <View style={styles.authContainer}>
                <View style={styles.authToggle}>
                  <TouchableOpacity 
                    style={[styles.authToggleButton, isSignIn && styles.authToggleButtonActive]}
                    onPress={() => setIsSignIn(true)}
                  >
                    <Text style={[styles.authToggleText, isSignIn && styles.authToggleTextActive]}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.authToggleButton, !isSignIn && styles.authToggleButtonActive]}
                    onPress={() => setIsSignIn(false)}
                  >
                    <Text style={[styles.authToggleText, !isSignIn && styles.authToggleTextActive]}>Register</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.authInput}
                  placeholder="Email"
                  value={authData.email}
                  onChangeText={(text) => setAuthData(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  style={styles.authInput}
                  placeholder="Password"
                  value={authData.password}
                  onChangeText={(text) => setAuthData(prev => ({ ...prev, password: text }))}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Create Card</Text>
              </TouchableOpacity>



      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalScrollView: {
    width: '100%',
    padding: 16,
  },
  modalContentEdit: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageEdit: {
    position: 'relative',
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  editProfileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editImageOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#26a69a',
    borderRadius: 15,
    padding: 8,
  },
  editInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  locationInput: {
    flex: 1,
    marginLeft: 8,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  chatAppsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  chatAppButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  chatAppButtonSelected: {
    borderColor: '#26a69a',
    backgroundColor: 'rgba(38, 166, 154, 0.1)',
  },
  chatAppIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  privacyToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  privacyLabel: {
    fontSize: 16,
    color: '#4b5563',
  },
  privacyToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  privacyToggleText: {
    color: 'white',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#26a69a',
    width: '100%',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
  },  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  authContainer: {
    width: '100%',
    marginBottom: 20,
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  authToggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  authToggleButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  authToggleText: {
    fontSize: 14,
    color: '#666',
  },
  authToggleTextActive: {
    color: '#26a69a',
    fontWeight: '600',
  },
  authInput: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  emptyImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});