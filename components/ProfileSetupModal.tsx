import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { auth, db, storage } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@firebase/auth';
import { doc, setDoc, getDoc } from '@firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { toast } from 'sonner-native';
import axios from 'axios';
import { Image } from 'expo-image';

interface ProfileData {
  name: string;
  bio: string;
  location: string;
  image: string;
  bgColor: string;
  borderColor: string;
  chatApp: string | null;
  isPublic: boolean;
  userId?: string;
  createdAt?: string;
}

interface AuthData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface ProfileSetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profileData: ProfileData) => void;
  initialData?: Partial<ProfileData>;
}

export const ProfileSetupModal = ({ visible, onClose, onSave, initialData }: ProfileSetupModalProps) => {
  const [profileData, setProfileData] = React.useState<ProfileData>({
    name: initialData?.name || '',
    bio: initialData?.bio || '',
    location: initialData?.location || '',
    image: initialData?.image || '',
    bgColor: initialData?.bgColor || '#26a69a',
    borderColor: initialData?.borderColor || '#4db6ac',
    chatApp: initialData?.chatApp || null,
    isPublic: initialData?.isPublic ?? true
  });

  const [selectedChatApp, setSelectedChatApp] = React.useState<string>('Messenger');
  const [isProfilePublic, setIsProfilePublic] = React.useState<boolean>(true);
  const [isSignIn, setIsSignIn] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [authData, setAuthData] = React.useState<AuthData>({
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
  };  

    const uploadImage = async (file: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/upload`, 
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        const imageUrl = response.data.data.secure_url;
        
        // Update user profile in Firebase if user is authenticated
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            photoURL: imageUrl
          });

          // Update local state
          setProfileData((prev: ProfileData) => ({
            ...prev,
            image: imageUrl
          }));

          toast.success('Profile photo updated successfully!');
        }
        return imageUrl;
      }
      throw new Error('Failed to upload image');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const handleAuth = async (): Promise<void> => {
    if (isSignIn) {
      // Quick mode - just save profile data to state
      if (!profileData.name) {
        toast.error('Please fill in your name');
        return;
      }
      onSave({
        ...profileData,
        chatApp: selectedChatApp,
        isPublic: isProfilePublic,
        createdAt: new Date().toISOString()
      });
      onClose();
      return;
    }

    // Register mode
    if (!authData.email || !authData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!profileData.name) {
      toast.error('Please fill in your profile information');
      return;
    }

    setLoading(true);
    try {
      let userCredential;
      if (isSignIn) {
        userCredential = await signInWithEmailAndPassword(auth, authData.email, authData.password);
        const userDoc = await getDoc(doc(db, 'profiles', userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          onSave(userData);
          toast.success('Signed in successfully!');
          onClose();
        }
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);

        // Initial profile data
        let updatedProfile: ProfileData & { userId: string; createdAt: string } = {
          ...profileData,
          image: profileData.image, // Keep the original image for now
          chatApp: selectedChatApp,
          isPublic: isProfilePublic,
          userId: userCredential.user.uid,
          createdAt: new Date().toISOString(),
        };

        // Try to upload image to Firebase Storage, but don't block on failure
        // try {
        //   if (profileData.image) {
        //     const storageRef = ref(storage, `profile-images/${userCredential.user.uid}`);
        //     const imageResponse = await fetch(profileData.image);
        //     const imageBlob = await imageResponse.blob();
        //     await uploadBytes(storageRef, imageBlob);
        //     const firebaseImageUrl = await getDownloadURL(storageRef);
        //     // Only update the image URL if Firebase upload succeeds
        //     updatedProfile.image = firebaseImageUrl;
        //   }
        // } catch (uploadError) {
        //   console.error('Error uploading image to Firebase:', uploadError);
        //   // Continue with the original image URL
        // }

        // Save profile to Firestore regardless of image upload result
        await setDoc(doc(db, 'profiles', userCredential.user.uid), updatedProfile);
        onSave(updatedProfile);
        toast.success('Account created successfully!');
        onClose();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  // We no longer need handleSave since we handle everything in handleAuth  
  return (
    <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
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
                    contentFit="cover"
                    transition={0}
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
          onChangeText={(text: string) => setProfileData((prev: ProfileData) => ({ ...prev, name: text }))}
        />

        <TextInput
          style={[styles.editInput, styles.bioInput]}
          placeholder="Your Bio"
          value={profileData.bio}
          onChangeText={(text: string) => setProfileData((prev: ProfileData) => ({ ...prev, bio: text }))}
          multiline
        />

        <View style={styles.locationInputContainer}>
          <MaterialIcons name="location-on" size={20} color="#666" />
          <TextInput
            style={[styles.editInput, styles.locationInput]}
            placeholder="Your Location"
            value={profileData.location}
            onChangeText={(text: string) => setProfileData((prev: ProfileData) => ({ ...prev, location: text }))}
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

        {/* Auth Section */}              <View style={styles.authContainer}>
                <View style={styles.authToggle}>
                  <TouchableOpacity 
                    style={[styles.authToggleButton, isSignIn && styles.authToggleButtonActive]}
                    onPress={() => setIsSignIn(true)}
                  >
                    <Text style={[styles.authToggleText, isSignIn && styles.authToggleTextActive]}>Quick</Text>
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
                  onChangeText={(text: string) => setAuthData((prev: AuthData) => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  style={styles.authInput}
                  placeholder="Password"
                  value={authData.password}
                  onChangeText={(text: string) => setAuthData((prev: AuthData) => ({ ...prev, password: text }))}
                  secureTextEntry
                />
              </View>              {loading ? (
                <View style={styles.saveButton}>
                  <ActivityIndicator color="white" />
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleAuth}
                >                  <Text style={styles.saveButtonText}>
                    {isSignIn ? 'Continue' : 'Register & Create Card'}
                  </Text>
                </TouchableOpacity>
              )}



      </View>
    </ScrollView>
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


