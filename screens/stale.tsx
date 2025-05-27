import { StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, Modal, TextInput, View, Animated, ImageSourcePropType } from 'react-native';
import { Text } from '../components/Themed';

import React, { useState, useRef, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, getDocs, deleteDoc } from '@firebase/firestore';
import axios from 'axios';
import { toast } from 'sonner-native';

interface Profile {
  name: string;
  bio: string;
  location: string;
  image: ImageSourcePropType;
  bgColor: string;
  borderColor: string;
  chatApp: string | null;
  isPublic: boolean;
}
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { ButtonGroup } from '../components/button-group';
import { ProfileSetupModal } from '../components/ProfileSetupModal';
import { Card, CardContent } from '../components/ui/card'; // Import Card and CardContent
import { QRCodeSVG } from 'qrcode.react'; // Import QRCodeSVG'
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker

// Add this near other imports

const { width } = Dimensions.get('window');

const LogoImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1747063504/shortle_vfevds.jpg' };
const FacebookImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965603/facebook_zrilsb.png' };
const XImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965553/xlogo_frqeln.png' };
const InstagramImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965614/instagram_n02qc9.png' };
const LinkedinImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1747063504/linkedIn_hwnthq.png' };
const GithubImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965605/github_uttkut.png' };
const YoutubeImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965613/youtube_fmdqvt.png' };
const TikTokImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965612/tiktok_bivjsf.png' };
const TelegramImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965610/telegram_synfdv.png' };
const WhatsAppImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965610/whatsAppicon_ksnxcr.png' };
const SpotifyImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965606/Spotify_euj0f0.png' };
const SnapchatImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965606/snapchat_e2tyn7.png' };
const ViberImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1747063516/viber_jth6pp.png' };
const MessengerImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965610/messanger_orvw6q.png' };

// Backgrounded images
const FaceBookBackgrounded = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965549/facebook_pfxbfx.png' };
const InstagramBackgrounded = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965560/instagram_sonjsd.png' };
const LinkedInBackgrounded = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965546/linkedIn_fgrs4k.png' };
const XBackgrounded = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965553/xlogo_frqeln.png' };
const SnapChatBackgrounded = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965550/snapchat_vo2ukn.png' };
const PinterestBackgrounded = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965549/pinterest_tidtcy.png' };
const TikTokBackgrounded = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965554/tiktok_nj9wiw.png' };
const YoutubeBackgrounded = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965552/youtube_dsu8hi.png' };
const GithubBackgrounded = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965558/github_b2ihfv.png' };

// Importing profile images for saved cards
const LandoImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965548/lando_jw8hnj.jpg' };
const OllieImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965560/ollie_pvmmhq.jpg' };
const OscarImage = { uri: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965557/Oscar_mukcv7.jpg' };


export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user) {
        // Fetch user profile
        fetchUserProfile(user.uid);
        // Fetch user's social media tags
        fetchUserTags(user.uid);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profileData = docSnap.data();
        setProfiles([profileData]);
        setProfileData(profileData);
        setSelectedChatApp(profileData.chatApp || 'Messenger');
        setIsProfilePublic(profileData.isPublic);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserTags = async (userId) => {
    try {
      const tagsRef = collection(db, 'users', userId, 'social_tags');
      const querySnapshot = await getDocs(tagsRef);
      const fetchedTags = [];
      querySnapshot.forEach((doc) => {
        fetchedTags.push(doc.data());
      });
      setTags(fetchedTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState<{ name: string; image: any; color: string }[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [selectedChatApp, setSelectedChatApp] = useState('Messenger');
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [ShowAllTagsLogo, setShowAllTagsLogo] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showSearchPreview, setShowSearchPreview] = useState(false);

  const [selectedTag, setSelectedTag] = useState<{ 
    name: string; 
    image: any; 
    color: string; 
    qrData?: string 
  } | null>(null);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: "Ollie Bearman",
    bio: "✨ I really like Formula 1 ✨",
    location: "Chelmsford",
    image: 'https://res.cloudinary.com/dnwnokn5t/image/upload/v1746965560/ollie_pvmmhq.jpg',
    bgColor: '#e53935',
    borderColor: '#ef5350',
    chatApp: null,
    isPublic: true
});

// Mock data for saved cards
const mockSavedCards = [
  {
    name: "Lando Norris",
    location: "Monaco",
    image: LandoImage,
    bio: "Photography enthusiast 📸",
    bgColor: '#5c6bc0',
    borderColor: '#7986cb',
    chatApp: "Telegram",
    isPublic: true,
    socialPlatforms: ["X", "Instagram", "YouTube", "TikTok"]
  },
  
  {
    name: "Airrack",
    location: "Los Angeles, CA",
    image: { uri: "https://res.cloudinary.com/dnwnokn5t/image/upload/v1747912600/airrack_xaldwc.jpg" },
    bio: "Content Creator & Entrepreneur 🎥",
    bgColor: '#FDD835', // Yellow color
    borderColor: '#FFEE58', // Lighter yellow for border
    chatApp: "WhatsApp",
    isPublic: true,
    socialPlatforms: ["YouTube", "Instagram", "TikTok"],
    followers: "500k",
    promos: [
      { code: "AIRRACK10", platform: "PrizePicks", discount: "$50 Match" },
      { code: "AIRRACK", platform: "Ticketmaster", discount: "VIP Upgrade" }
    ]
  },
  {
    name: "Ollie Bearman",
    location: "Monaco",
    image: OllieImage,
    bio: "✨ I really like Formula 1 ✨",
    bgColor: '#e53935',
    borderColor: '#ef5350',
    chatApp: "WhatsApp",
    isPublic: true,
    socialPlatforms: ["Instagram", "X", "Spotify", "YouTube"]
  },
    {
    name: "Oscar Piastri",
    location: "Monaco",
    image: OscarImage,
    bio: "Digital Artist 🎨",
    bgColor: '#ff5722',
    borderColor: '#ff7043',
    chatApp: "Viber",
    isPublic: true,
    socialPlatforms: ["Instagram", "X", "Facebook", "LinkedIn"]
  },
  {
    name: "MKBHD",
    location: "Maplewood, New Jersey",
    image: { uri: "https://res.cloudinary.com/dnwnokn5t/image/upload/v1747912616/Marques_Brownlee_hpvnvs.jpg" },
    bio: "Tech Reviewer & Content Creator 📱",
    bgColor: '#673AB7',
    borderColor: '#7E57C2',
    chatApp: "Telegram",
    isPublic: true,
    socialPlatforms: ["YouTube", "X", "Instagram"],
    followers: "1.6M",
    promos: [
      { code: "MKBHD15", platform: "dbrand", discount: "15% off" },
      { code: "MKBHD20", platform: "Peak Design", discount: "20% off" }
    ]
  },
  
  {
    name: "RayAsianBoy",
    location: "Atlanta",
    image: { uri: "https://res.cloudinary.com/dnwnokn5t/image/upload/v1747912600/ray_y9qmoe.jpg" },
    bio: "Gaming & Lifestyle Creator 🎮",
    bgColor: '#CDDC39', // Lime color
    borderColor: '#DCE775', // Lighter lime for border
    chatApp: "Messenger",
    isPublic: true,
    socialPlatforms: ["TikTok", "YouTube", "Instagram"],
    followers: "3.4M",
    promos: [
      { code: "RAYBOY", platform: "Fortnite", discount: "20% off V-Bucks" }
    ]
  },
];

// Initialize SavedCards state with mock data
// const [SavedCards, setSavedCards] = useState<Profile[]>(mockSavedCards);
const [SavedCards, setSavedCards] = useState(mockSavedCards);

  const [followedPlatforms, setFollowedPlatforms] = useState<{ [key: string]: boolean }>({});


  const handleFollow = (platformName: string) => {
    setFollowedPlatforms(prev => ({
      ...prev,
      [platformName]: !prev[platformName]
    }));
  };

  const [pressedChat, setPressedChat] = useState<{[key: string]: boolean}>({});


  const handleChatPress = (profileId: string) => {
    setPressedChat(prev => ({
      ...prev,
      [profileId]: true
    }));
    
    // Reset the pressed state after a short delay
    setTimeout(() => {
      setPressedChat(prev => ({
        ...prev,
        [profileId]: false
      }));
    }, 200);
  };  

  const [profiles, setProfiles] = useState<Profile[]>([]);  
  const [showMoreCards, setShowMoreCards] = useState(false);
const [showPromos, setShowPromos] = useState(false);  
const [otherCards, setOtherCards] = useState([]);

  // Add function to fetch saved cards
  const fetchSavedCards = async () => {
    if (!auth.currentUser) return;
    
    try {
      const savedCardsRef = collection(db, 'users', auth.currentUser.uid, 'saved_cards');
      const querySnapshot = await getDocs(savedCardsRef);
      const firebaseCards: Profile[] = [];
      
      querySnapshot.forEach((doc) => {
        const cardData = doc.data() as Profile;
        firebaseCards.push({
          ...cardData,
          id: doc.id
        });
      });
      
      // Merge Firebase cards with mock data
      const allCards = [...mockSavedCards, ...firebaseCards];
      
      // Update both SavedCards and otherCards states
      setSavedCards(allCards);
      setOtherCards(allCards);
    } catch (error) {
      console.error('Error fetching saved cards:', error);
      toast.error('Error fetching saved cards');
    }
  };  // Add useEffect to fetch saved cards on mount and auth state change
  useEffect(() => {
    if (auth.currentUser) {
      fetchSavedCards();
    }
  }, [auth.currentUser]);

  // Split saved cards into main display and other cards
  useEffect(() => {
    const mainCards = SavedCards.slice(0, 3);
    const remainingCards = SavedCards.slice(3);
    setOtherCards(remainingCards);
  }, [SavedCards]);


  const socialMediaLinks = [
    { 
      name: 'Facebook', 
      image: FacebookImage, 
      url: 'https://facebook.com', 
      gradient: ['#1877F2', '#0A4FA8']  // Facebook blue gradient
    },
    { 
      name: 'X', 
      image: XImage, 
      url: 'https://x.com', 
      gradient: ['#1DA1F2', '#0C85D0']  // x blue gradient
    },
    { 
      name: 'Instagram', 
      image: InstagramImage, 
      url: 'https://instagram.com', 
      gradient: ['#E4405F', '#D81F5A']  // Instagram pink gradient
    },
    { 
      name: 'LinkedIn', 
      image: LinkedinImage, 
      url: 'https://linkedin.com', 
      gradient: ['#0A66C2', '#004182']  // LinkedIn blue gradient
    },
    { 
      name: 'GitHub', 
      image: GithubImage, 
      url: 'https://github.com', 
      color: '#181717' 
    },
    { 
      name: 'YouTube', 
      image: YoutubeImage, 
      url: 'https://youtube.com', 
      color: '#FF0000' 
    },
    { 
      name: 'TikTok', 
      image: TikTokImage, 
      url: 'https://tiktok.com', 
      color: '#000000' 
    },
    { 
      name: 'Spotify', 
      image: SpotifyImage, 
      url: 'https://spotify.com', 
      color: '#BD081C' 
    },
    { 
      name: 'Snapchat', 
      image: SnapchatImage, 
      url: 'https://snapchat.com', 
      color: '#FFFC00' 
    }, // Added Snapchat
  ];

  const SocialMediaLogos = [
    { 
      name: 'Facebook', 
      image: FaceBookBackgrounded, 
      url: 'https://facebook.com', 
      gradient: ['#1877F2', '#0A4FA8']  // Facebook blue gradient
    },
    { 
      name: 'X', 
      image: XBackgrounded, 
      url: 'https://x.com', 
      gradient: ['#1DA1F2', '#0C85D0']  // x blue gradient
    },
    { 
      name: 'Instagram', 
      image: InstagramBackgrounded, 
      url: 'https://instagram.com', 
      gradient: ['#E4405F', '#D81F5A']  // Instagram pink gradient
    },
    { 
      name: 'LinkedIn', 
      image: LinkedInBackgrounded, 
      url: 'https://linkedin.com', 
      gradient: ['#0A66C2', '#004182']  // LinkedIn blue gradient
    },
    { 
      name: 'Pinterest', 
      image: PinterestBackgrounded, 
      url: 'https://pinterest.com', 
      gradient: ['#BD081C', '#8B0000']  // Pinterest red gradient
    },
    { 
      name: 'Snapchat', 
      image: SnapChatBackgrounded, 
      url: 'https://snapchat.com', 
      gradient: ['#FFFC00', '#FDEE00']  // Snapchat yellow gradient
    },
    { 
      name: 'TikTok', 
      image: TikTokBackgrounded, 
      url: 'https://tiktok.com', 
      gradient: ['#000000', '#000000']  // TikTok black gradient
    },
    { 
      name: 'YouTube', 
      image: YoutubeBackgrounded, 
      url: 'https://youtube.com', 
      gradient: ['#FF0000', '#FF0000']  // YouTube red gradient
    },
    { 
      name: 'GitHub', 
      image: GithubBackgrounded, 
      url: 'https://github.com', 
      gradient: ['#181717', '#181717']  // GitHub black gradient
    }
  ];

  const chatApps = [
    { name: 'WhatsApp', image: WhatsAppImage },
    { name: 'Messenger', image: MessengerImage },
    { name: 'Telegram', image: TelegramImage },
    { name: 'Viber', image: ViberImage },
  ]; 
  
    const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      toast.error('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        // First update the UI immediately with the local image
        const localImageUri = result.assets[0].uri;
        
        // Update both profileData and profiles[0] with local image right away
        const localUpdatedData = {
          ...profileData,
          image: localImageUri
        };
        
        // Update both modal and card with local image immediately
        setProfileData(localUpdatedData);
        setProfiles((currentProfiles: Profile[]) => 
          currentProfiles.map((p: Profile, idx: number) => 
            idx === currentIndex ? { ...p, image: { uri: localImageUri } } : p
          )
        );

        // Upload to server
        const response = await fetch(localImageUri);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('file', blob, 'profile-image.jpg');

        // Use a hardcoded or config-based URL for now
        const uploadResponse = await axios.post(
          'https://api.cloudinary.com/v1_1/your-cloud-name/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (uploadResponse.data.url) {
          const imageUrl = uploadResponse.data.url;
          
          // Update both modal and card with server URL
          const serverUpdatedData = {
            ...profileData,
            image: imageUrl
          };
          
          setProfileData(serverUpdatedData);
          setProfiles((currentProfiles: Profile[]) => 
            currentProfiles.map((p: Profile, idx: number) => 
              idx === currentIndex ? { ...p, image: { uri: imageUrl } } : p
            )
          );

          // Update database if user is authenticated
          if (currentUser) {
            const updatedProfile = {
              ...serverUpdatedData,
              chatApp: selectedChatApp,
              isPublic: isProfilePublic
            };
            await handleProfileUpdate(updatedProfile);
          }
          
          toast.success('Profile image updated successfully!');
        }
      } catch (error) {
        toast.error('Failed to update profile image');
        console.error('Error updating profile image:', error);
      }
    }
  }; 
  
  // const uploadImage = async (uri: string) => {
  //   try {
  //     const response = await fetch(uri);
  //     const blob = await response.blob();
  //     const formData = new FormData();
  //     formData.append('file', blob, 'profile-image.jpg');

  //     const uploadResponse = await axios.post(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/upload`, 
  //       formData,
  //       {
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       }
  //     );

  //     if (uploadResponse.data.url) {
  //       const imageUrl = uploadResponse.data.url;
  //       toast.success('Image uploaded successfully!');
  //       return imageUrl;
  //     } else {
  //       throw new Error('Failed to upload image');
  //     }
  //   } catch (error) {
  //     toast.error('Error uploading image: ' + error.message);
  //     return null;
  //   }
  // };


  
    // Add function to save scanned card
  const handleScannedCard = async (scannedData: any) => {
    if (!auth.currentUser) return;

    try {
      // First, fetch the scanned user's profile
      const scannedUserProfileRef = doc(db, 'profiles', scannedData.userId);
      const scannedUserProfileSnap = await getDoc(scannedUserProfileRef);
      
      if (scannedUserProfileSnap.exists()) {
        const profileData = scannedUserProfileSnap.data();
        
        // Save to current user's saved_cards collection
        const cardRef = doc(db, 'users', auth.currentUser.uid, 'saved_cards', scannedData.userId);
        await setDoc(cardRef, {
          ...profileData,
          savedAt: new Date().toISOString(),
          originalUserId: scannedData.userId
        });
        
        toast.success('Card saved successfully!');
        await fetchSavedCards(); // Refresh the saved cards list
      } else {
        toast.error('Profile not found');
      }
    } catch (error: any) {
      toast.error('Error saving card: ' + error.message);
    }
  };
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  
  const slideAnimation = useRef(new Animated.Value(0)).current;const handleSaveProfile = (newProfileData: Profile) => {
    setProfiles([newProfileData]);
    setSelectedChatApp(newProfileData.chatApp || 'Messenger');
    setIsProfilePublic(newProfileData.isPublic);
    setShowProfileSetup(false);
  };
  // Add function to handle profile updates
  const handleProfileUpdate = async (updatedProfile: Profile) => {
    if (!currentUser) return;

    try {
      // Update in Firestore
      await setDoc(doc(db, 'profiles', currentUser.uid), {
        ...updatedProfile,
        updatedAt: new Date().toISOString()
      });

      // Update all profile states to ensure consistency
      setProfileData(updatedProfile);
      
      // Update the profiles array while maintaining other profiles
      type ProfileWithIndex = Profile & { index?: number };

      setProfiles((currentProfiles: ProfileWithIndex[]) => 
        currentProfiles.map((profile: ProfileWithIndex, idx: number) => 
          idx === currentIndex ? {
            ...profile,
            ...updatedProfile,
            image: { uri: updatedProfile.image } // Convert image URI to proper format
          } : profile
        )
      );

      setIsEditProfileModalVisible(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error('Error updating profile: ' + (error.message || 'Unknown error'));
    }
  };
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Function to handle card transitions
  const handleNextCard = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      // Only show first 4 cards (0,1,2,3) then cycle back
      const maxVisibleCards = 4;
      setCurrentIndex((prevIndex) => (prevIndex + 1) % maxVisibleCards);
      setTimeout(() => setIsAnimating(false), 300); // Match with animation duration
    }
  };  const handleAddTag = async () => {
    if (!currentUser) {
      setShowProfileSetup(true);
      return;
    }
    if (tag && selectedIcon) {
      const selectedSocial = socialMediaLinks.find(social => social.name === selectedIcon);
      if (selectedSocial) {
        const newTag = {
          name: tag,
          image: selectedSocial.image,
          color: selectedSocial.gradient ? selectedSocial.gradient[0] : selectedSocial.color || '#000000',
          platform: selectedIcon,
          userId: currentUser?.uid || null,
          createdAt: new Date().toISOString()
        };

        try {
          // Save to Firestore
          await setDoc(
            doc(db, 'users', currentUser.uid, 'social_tags', selectedIcon.toLowerCase()),
            newTag
          );

          setTags([...tags, newTag]);
          setTag('');
          setSelectedIcon(null);
          setModalVisible(false);
          toast.success('Tag added successfully!');
        } catch (error) {
          toast.error('Error adding tag: ' + error.message);
        }
      }
    }
  };


const handleTagClick = (tag: { name: string; image: any; color: string }) => {
  setSelectedTag({ ...tag, qrData: tag.name });
   // Set the selected tag for QR code display
};


  const selectIcon = (name: string) => {
    setSelectedIcon(name === selectedIcon ? null : name);
  };

  return (
    <View style={styles.container}>      
      <View style={styles.header}>      
        <View style={styles.searchContainer}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                setShowSearchPreview(text.length > 0);
              }}
            />
            {showSearchPreview && (
  <View style={styles.searchPreview}>
    {/* Skeleton loading state */}
    <View style={styles.searchResultSkeleton}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '60%' }]} />
      </View>
    </View>
    
    {/* Divider */}
    <View style={styles.searchDivider} />

    {/* Invite Container */}
    <View style={styles.inviteContainer}>
      <Text style={styles.inviteText}>Invite friends</Text>
      <TouchableOpacity 
        style={styles.inviteButton}
        onPress={() => {
          alert('Invitation sent!');
          setShowSearchPreview(false);
          setSearchText('');
        }}
      >
        <Text style={styles.inviteButtonText}>Share</Text>
      </TouchableOpacity>
    </View>
  </View>
)}
          </View>
        </View>
        <Image source={LogoImage} style={styles.logo} resizeMode="cover" />      
        </View>

      {/* Fixed QR Scanner Button */}
      <TouchableOpacity
        style={styles.fixedQrButton}
        onPress={() => navigation.navigate('ScanQR')}
      >
        <LinearGradient
          colors={['#26a69a', '#4db6ac']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.qrButtonGradient}
        >
          <MaterialIcons name="qr-code-scanner" size={24} color="white" />
          <Text style={styles.qrButtonText}>Scan</Text>
        </LinearGradient>
      </TouchableOpacity>   

       {/* Tags Container */}
      <View style={styles.tagsContainer}>        
        <View style={styles.tagItem}>         
           <TouchableOpacity onPress={() => {
              if (profiles.length === 0) {
                setShowProfileSetup(true);
              } else {
                setModalVisible(true);
              }
            }}>
            <View style={styles.addtagButton}>
              <MaterialIcons name="add" size={24} color="white" />
            </View>
            <Text style={styles.tagText}>Add tag</Text>
          </TouchableOpacity>
        </View>

        {/* Render placeholders if no tags are added */}
        {tags.length === 0 && (
          <>
            <View style={styles.placeholder} />
            <View style={styles.placeholder} />
            <View style={styles.placeholder} />

          </>
        )}

        {/* Render added tags in a Card */}
        <Card style={styles.card}>
          <CardContent style={styles.cardContentBox}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} // Hide default scrollbar
              contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 5 }} // Add padding for better spacing
            >
              {tags.map((platform, index) => (
                <TouchableOpacity key={index} onPress={() => {handleTagClick(platform); setShowAllTagsLogo(false)}}> {/* Handle tag click */}
                  <View style={styles.tagItem}>
                    <View style={styles.tagRing}>
                      <Image source={platform.image} style={styles.tagImage} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </CardContent>
        </Card>
      </View>

      {/* Modal for adding a tag */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tags</Text>
            {/* Social Media Icons at the top of the modal */}
            <View style={styles.iconGrid}>
              {socialMediaLinks.map((social) => (
                <TouchableOpacity
                  key={social.name}
                  onPress={() => selectIcon(social.name)}
                  style={[
                    styles.iconButton,
                    selectedIcon === social.name ? styles.iconSelected : styles.iconDefault,
                  ]}
                  aria-label={`Select ${social.name}`}
                  aria-pressed={selectedIcon === social.name}
                >
                  <Image
                    source={social.image} // Use the local image
                    style={styles.iconImage} // Apply styles to the image
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[styles.input, { paddingLeft: 26, borderRadius: 12 }]}
                  placeholder="(e.g., @username)"
                  value={tag}
                  onChangeText={setTag}
                />
                <Text style={{ 
                  position: 'absolute', 
                  left: 10,
                  top: '40%',
                  transform: [{ translateY: -8 }],
                  fontSize: 16,
                  color: '#ccc'
                }}>@</Text>
              </View>
            </View>
            
            {/* Connect Button */}
            <View style={styles.connectButtonBox}>
              <TouchableOpacity 
              style={styles.connectButton} 
              onPress={() => {
                handleAddTag(); // Call the function to add the tag
                setModalVisible(false); // Close the modal
              }}
            >
              <Text style={styles.connectButtonText}>
                {selectedIcon ? `Connect ${selectedIcon}` : 'Connect'} {/* Dynamic button text */}
              </Text>
            </TouchableOpacity>
            </View>
            
            <ButtonGroup 
              onSubmit={handleAddTag}
              onCancel={() => setModalVisible(false)} 
            />
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditProfileModalVisible}
        onRequestClose={() => setIsEditProfileModalVisible(false)}
      >
        <View style={styles.modalView}>
          <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalContentContainer}>
            <View style={styles.modalContentEdit}>
            <View style={styles.modalHeader}>
            <TouchableOpacity 
                  style={styles.closeButtonProfile}
                  onPress={() => setIsEditProfileModalVisible(false)}
                >
                  <MaterialIcons 
                    name="close" 
                    size={24} 
                    color="#666" 
                    style={styles.closeIcon}
                  />
                </TouchableOpacity>
              </View>
              {/* Profile Picture Edit */}
              <TouchableOpacity style={styles.profileImageEdit} onPress={pickImage}>
                {profileData.image ? (
                  <Image
                    source={typeof profileData.image === 'string' ? { uri: profileData.image } : profileData.image}
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

              {/* Name Input */}
              <TextInput
                style={styles.editInput}
                placeholder="Name"
                value={profileData.name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
              />

              {/* Bio Input */}
              <TextInput
                style={[styles.editInput, styles.bioInput]}
                placeholder="Bio"
                value={profileData.bio}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
                multiline
              />

              {/* Location Input */}
              <View style={styles.locationInputContainer}>
                <MaterialIcons name="location-on" size={20} color="#666" />
                <TextInput
                  style={[styles.editInput, styles.locationInput]}
                  placeholder="Location"
                  value={profileData.location}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, location: text }))}
                />
              </View>

              {/* Chat Apps Selection */}
              <Text style={styles.sectionTitle}>Select Chat</Text>
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

              {/* Privacy Toggle */}
              <View style={styles.privacyToggleContainer}>
                <Text style={styles.privacyLabel}>Share Chat</Text>
                <TouchableOpacity
                  style={[
                    styles.privacyToggle,
                    { backgroundColor: isProfilePublic ? '#26a69a' : '#666' }
                  ]}
                  onPress={() => setIsProfilePublic(!isProfilePublic)}
                >
                  <Text style={styles.privacyToggleText}>
                    {isProfilePublic ? 'Public' : 'Private'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Save Button */}              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => {
                  const updatedProfile = {
                    ...profileData,
                    chatApp: selectedChatApp,
                    isPublic: isProfilePublic
                  };
                  handleProfileUpdate(updatedProfile);
                }}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsEditProfileModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>    

        {/* Profile Card or Fill Your Card Button */}
      <View style={styles.profileCardContainer}>        {profiles.length === 0 ? (
          <TouchableOpacity
            style={styles.fillCardButton}
            onPress={() => setShowProfileSetup(true)}
          >
            <LinearGradient
              colors={['#26a69a', '#4db6ac']}
              style={styles.fillCardGradient}
            >
              <MaterialIcons name="add-circle-outline" size={40} color="white" />
              <Text style={styles.fillCardText}>Fill Your Card</Text>
              <Text style={styles.fillCardSubtext}>Create your digital card</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          [...profiles].concat(SavedCards.slice(0, 4)).slice(0, 4).map((profile, index) => {
            const offset = index - currentIndex;
            const isVisible = offset >= 0 && offset < 3; // Show only next 3 cards

            if (!isVisible) return null;

            return (
              <Animated.View
                key={index}
                style={[
                  styles.profileCard,
                  {
                    backgroundColor: profile.bgColor,
                    borderColor: profile.borderColor,
                    position: 'absolute',
                    transform: [
                      { translateY: offset * 20 },
                      { translateX: offset * 20 },
                      { scale: 1 - (offset * 0.05) },
                    ],
                    opacity: 1 - (offset * 0.2),
                    zIndex: profiles.length - offset,
                  }
                ]}
              >

                {index === 0 ? (
          // Original layout for the first card
                  <>                    <TouchableOpacity 
                      style={[
                        styles.settingsButton, 
                        { 
                          backgroundColor: profile.borderColor,
                          position: 'absolute', 
                          top: 12, 
                          right: 12, 
                          width: 36, 
                          height: 36, 
                          borderRadius: 18, 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          zIndex: 1, 
                          shadowColor: '#000', 
                          shadowOffset: { width: 0, height: 2 }, 
                          shadowOpacity: 0.25, 
                          shadowRadius: 3.84, 
                          elevation: 5 
                        }
                      ]}
                      onPress={() => {
                        setProfileData(profile);
                        setSelectedChatApp(profile.chatApp || 'Messenger');
                        setIsProfilePublic(profile.isPublic);
                        setIsEditProfileModalVisible(true);
                      }}
                    >
                      <MaterialIcons name="settings" size={19} color="white" />
                    </TouchableOpacity>

                    <View style={[styles.profileImageContainer, { borderColor: profile.borderColor, borderWidth: 5 }]}>
                      <Image
                        source={typeof profile.image === 'string' ? { uri: profile.image } : profile.image}
                        style={styles.profileImageFirst}
                      />
                    </View>

                    <View style={styles.profileContent}>
                      <Text style={styles.profileName}>{profile.name}</Text>
                      <Text style={styles.profileBioFirst}>{profile.bio}</Text>
                      <TouchableOpacity 
                        style={[
                          styles.locationContainerFirst,
                          {
                            backgroundColor: profile.borderColor,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                            shadowColor: '#000',
                            shadowOffset: {
                              width: 0,
                              height: 2,
                            },
                            shadowOpacity: 0.10,
                            shadowRadius: 3.84,
                            elevation: 5,
                          }
                        ]}
                        onPress={() => {/* handle location press */}}
                      >
                        <MaterialIcons name="location-on" size={16} color="white" />
                        <Text style={[styles.locationText, { color: 'white' }]}>{profile.location}</Text>
                      </TouchableOpacity>
                      <View style={styles.actionButtonsContainer}>
                        <View style={styles.actionButtonsWrapper}>
                          <View style={styles.buttonSpacer} />
                          
                          <TouchableOpacity
                                                    style={[
                                                      styles.qrButton, 
                                                      { 
                                                        backgroundColor: profile.borderColor,
                                                        width: 48, 
                                                        height: 48, 
                                                        borderRadius: 24, 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
                                                        shadowColor: '#000', 
                                                        shadowOffset: { width: 0, height: 2 }, 
                                                        shadowOpacity: 0.25, 
                                                        shadowRadius: 3.84, 
                                                        elevation: 5 
                                                      }
                                                    ]}
                                                    onPress={() => {
                                                      if (tags.length > 0) {
                                                        const tagsData = tags.map(tag => tag.name).join('\n');
                                                        setSelectedTag({ name: 'All tags', image: null, color: profile.borderColor, qrData: tagsData });
                                                      } else {
                                                        setModalVisible(true);
                                                      }
                                                    }}
                                                  >
                                                    <MaterialIcons name="qr-code" size={24} color="white" />
                                                  </TouchableOpacity>

                          {isProfilePublic && selectedChatApp && (
                            <TouchableOpacity
                              style={[
                                styles.chatButtonFirst,
                                { backgroundColor: profile.borderColor }
                              ]}
                              onPress={() => {/* handle chat app action */}}
                            >
                              <Image 
                                source={chatApps.find(app => app.name === selectedChatApp)?.image}
                                style={styles.chatIconFirst}
                              />
                            </TouchableOpacity>
                          )}
                          {(!isProfilePublic || !selectedChatApp) && <View style={styles.buttonSpacer} />}
                        </View>
                      </View>
                    </View>
                  </>    
                ) : (            
                  // New layout for subsequent cards
                            <>
                              <View style={styles.newCardHeader}>
                                <View style={styles.newCardInfo}>
                                  <View style={styles.nameLocationContainer}>
                                    <Text style={styles.profileName}>{profile.name}</Text>
                                    <View style={styles.locationContainer}>
                                      <MaterialIcons name="location-on" size={16} color="white" />
                                      <Text style={[styles.locationText, { color: 'white' }]}>{profile.location}</Text>
                                    </View>
                                    <TouchableOpacity
                                      style={[
                                        styles.chatButton,
                                        pressedChat[profile.name] && styles.chatButtonPressed
                                      ]}
                                      onPress={() => handleChatPress(profile.name)}
                                    >
                                      <Text style={styles.chatButtonText}>Chat</Text>
                                      <Image 
                                        source={index === 2 ? ViberImage : TelegramImage} 
                                        style={styles.chatIcon} 
                                      />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                                <View style={[styles.newProfileImageContainer, { borderColor: profile.borderColor, borderWidth: 3 }]}>
                                  <Image
                                    source={profile.image}
                                    style={[
                                      styles.profileImage,
                                      {
                                        borderWidth: 3,
                                        borderColor: profile.borderColor,
                                        borderRadius: 50,
                                      }
                                    ]}
                                  />
                                </View>
                              </View>
                              
                              <Text style={styles.profileBio}>{profile.bio}</Text>
                              
                              <View style={styles.socialButtonsContainer}>
                                {SocialMediaLogos.slice(0, 4).map((platform, idx) => (
                                  <TouchableOpacity
                                    key={idx}
                                    style={styles.socialButtonWrapper}
                                    onPress={() => handleFollow(platform.name)}
                                  >
                                    {followedPlatforms[platform.name] ? (
                                      <View style={[styles.socialButton, styles.socialButtonFollowed]}>
                                        <Image source={platform.image} style={styles.socialButtonIcon} />
                                        <Text style={styles.socialButtonTextFollowed}>Followed</Text>
                                      </View>
                                    ) : (
                                      <LinearGradient
                                        colors={platform.gradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.socialButton}
                                      >
                                        <Image source={platform.image} style={styles.socialButtonIcon} />
                                        <Text style={styles.socialButtonText}>Follow</Text>
                                      </LinearGradient>
                                    )}
                                  </TouchableOpacity>
                                ))}
                              </View>
                  
                              <View style={styles.closedButtonContainer}>
                                <TouchableOpacity
                                  style={[
                                    styles.closedButton,
                                    {
                                      backgroundColor: profile.borderColor,
                                      shadowColor: '#000',
                                      shadowOffset: {
                                        width: 0,
                                        height: 2,
                                      },
                                      shadowOpacity: 0.15,
                                      shadowRadius: 3.84,
                                      elevation: 5,
                                    }
                                  ]}
                                  onPress={() => {/* handle save press */}}
                                >
                                  <Text style={styles.closedButtonText}>Saves
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </>
                )}
              </Animated.View>
            );
          })
        )}        
        
        {profiles.length > 0 && (
          <TouchableOpacity 
            style={[styles.nextButton, isAnimating && styles.nextButtonDisabled]}
            onPress={handleNextCard}
          >
            <MaterialIcons name="chevron-right" size={24} color="#000" />
          </TouchableOpacity>
        )}  

        {/* Accordion for More Cards */}
        <Animated.View 
          style={[
            styles.accordionContainer,
            {
              transform: [{
                translateY: slideAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 58] // Now slides up 20px from bottom position
                })
              }],              
              zIndex: 100 // Ensure accordion stays on top
            }
          ]}
        >          <View style={styles.accordionHeaderContainer}>
            <TouchableOpacity 
              style={styles.accordionButton}
              onPress={() => {
                setShowMoreCards(!showMoreCards);
                // Close promos when opening more cards
                if (!showMoreCards) {
                  setShowPromos(false);
                }
                Animated.spring(slideAnimation, {
                  toValue: !showMoreCards ? 1 : 0,
                  useNativeDriver: true,
                  friction: 8,
                  tension: 40
                }).start()}}
            >
              <View style={styles.accordionHeader}>
                <Text style={styles.accordionText}>More Cards</Text>
                <TouchableOpacity 
                  style={styles.promosButton}
                  onPress={() => {
                    setShowPromos(!showPromos);
                    // Close more cards when opening promos
                    if (!showPromos) {
                      setShowMoreCards(false);
                      Animated.spring(slideAnimation, {
                        toValue: 0,
                        useNativeDriver: true,
                        friction: 8,
                        tension: 40
                      }).start();
                    }
                  }}
                >
                  <Text style={styles.promosButtonText}>Promo Codes</Text>
                </TouchableOpacity>
                <MaterialIcons 
                  name={showMoreCards ? "expand-less" : "expand-more"} 
                  size={24} 
                  color="#666" 
                />
              </View>
            </TouchableOpacity>
          </View>

          {showPromos && (
            <View style={styles.promosContainer}>
              <TextInput
                style={styles.promoSearchInput}
                placeholder="Search promos..."
                placeholderTextColor="#999"
              />
              
              {/* Example Influencer Cards with Promo Codes */}
              <ScrollView style={styles.promosList}>
                {[
                  
                  {
                    name: "Airrack",
                    image: "https://res.cloudinary.com/dnwnokn5t/image/upload/v1747912600/airrack_xaldwc.jpg",
                    followers: "500k",
                    promos: [
                      { code: "AIRRACK10", platform: "PrizePicks", discount: "$50 Match" },
                      { code: "AIRRACK", platform: "Ticketmaster", discount: "VIP Upgrade" }

                    ],
                    following: false
                  },
                  {
                    name: "RayAsianBoy", 
                    image: "https://res.cloudinary.com/dnwnokn5t/image/upload/v1747912600/ray_y9qmoe.jpg",
                    followers: "3.4M",
                    promos: [
                      { code: "RAYBOY", platform: "Fortnite", discount: "20% off V-Bucks" },
                    ],
                    following: true
                  },
                  {
                    name: "MKBHD",
                    image: "https://res.cloudinary.com/dnwnokn5t/image/upload/v1747912616/Marques_Brownlee_hpvnvs.jpg", 
                    followers: "1.6M",
                    promos: [
                      { code: "MKBHD15", platform: "dbrand", discount: "15% off" },
                      { code: "MKBHD20", platform: "Peak Design", discount: "20% off" }
                    ],
                    following: true
                  }
                ].map((influencer, index) => (
                  <View key={index} style={styles.promoCard}>
                    <View style={styles.promoCardHeader}>
                      <Image source={{ uri: influencer.image }} style={styles.promoCardImage} />
                      <View style={styles.promoCardInfo}>
                        <Text style={styles.promoCardName}>{influencer.name}</Text>
                        <Text style={styles.promoCardFollowers}>{influencer.followers} Clicks</Text>
                      </View>
                      <TouchableOpacity 
                        style={[
                          styles.followButton,
                          influencer.following && styles.followingButton
                        ]}
                      >
                        <Text style={[
                          styles.followButtonText,
                          influencer.following && styles.followingButtonText
                        ]}>
                          {influencer.following ? 'Following' : 'View'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.promoCodes}>
                      {influencer.promos.map((promo, idx) => (
                        <View key={idx} style={styles.promoCodeContainer}>
                          <View style={styles.promoCodeInfo}>
                            <Text style={styles.promoPlatform}>{promo.platform}</Text>
                            <Text style={styles.promoDiscount}>{promo.discount}</Text>
                          </View>
                          <TouchableOpacity 
                            style={styles.copyCodeButton}
                            onPress={() => {
                              // Copy to clipboard functionality would go here
                              toast.success(`Code ${promo.code} copied!`);
                            }}
                          >
                            <Text style={styles.promoCode}>{promo.code}</Text>
                            <MaterialIcons name="content-copy" size={16} color="#26a69a" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {showMoreCards && (
                      <View style={styles.moreCardsContainer}>             
                       {otherCards.length > 0 ? (otherCards.map((card, index) => (                  
                        <View key={index} style={[styles.miniCard, {
                              shadowColor: 'rgba(0, 0, 0, 0.1)',
                              shadowOffset: {
                                width: 0,
                                height: 4,
                              },
                              shadowOpacity: 1,
                              shadowRadius: 8,
                              elevation: 4,
                              position: 'relative',
                              borderWidth: 1,
                              borderColor: '#e0e0e0',
                            }]}>
                                <TouchableOpacity
                                style={styles.shareButton}
                                onPress={() => {/* handle QR code */}}
                              >                      <LinearGradient
                                  colors={['#26a69a', '#4db6ac']}
                                  style={[styles.shareButtonGradient, { 
                                    padding: 14,
                                    marginTop: 8,
                                  }]}
                                >
                                  <MaterialIcons name="qr-code" size={16} color="#fff" />
                                </LinearGradient>
                              </TouchableOpacity>
                              
                              <Image source={card.image} style={styles.miniCardImage} />
                              <View style={styles.miniCardContent}>
                                <Text style={styles.miniCardName}>{card.name}</Text>
                                <Text style={styles.miniCardLocation}>{card.location}</Text>
                                <View style={styles.miniCardActions}>
                                  <TouchableOpacity
                                    style={[
                                      styles.miniChatButton,
                                      pressedChat[card.name] && styles.chatButtonPressed,
                                      { backgroundColor: "#5c6bc0" }
                                    ]}
                                    onPress={() => handleChatPress(card.name)}
                                  >
                                    <Text style={styles.miniChatButtonText}>Chat</Text>
                                    <Image 
                                      source={
                                        card.chatApp === 'Telegram' ? TelegramImage :
                                        card.chatApp === 'WhatsApp' ? WhatsAppImage :
                                        card.chatApp === 'Viber' ? ViberImage :
                                        MessengerImage
                                      }
                                      style={styles.miniChatIcon} 
                                    />
                                  </TouchableOpacity>
                                  <TouchableOpacity 
                                    style={[
                                      styles.miniFollowButton,
                                      { borderColor: "#7986cb" }
                                    ]}
                                    onPress={() => {/* handle follow */}}
                                  >
                                    <Text style={[styles.miniFollowButtonText, { color: "#7986cb" }]}>
                                      View
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              </View>
                            </View>
                          ))
                        ) : (
                          <View style={styles.emptyCard}>
                            <View style={styles.emptyCardContent}>
                              <View style={styles.emptyImagePlaceholder}>
                                <MaterialIcons name="person-outline" size={32} color="#ddd" />
                              </View>
                              <View style={styles.emptyCardDetails}>
                                <View style={styles.emptyTextPlaceholder} />
                                <View style={[styles.emptyTextPlaceholder, { width: '60%' }]} />
                                <View style={styles.emptyButtonPlaceholder} />
                              </View>
                            </View>
                            <Text style={styles.emptyCardsText}>None available </Text>
                          </View>
                        )}
                      </View>
                    )}

        </Animated.View>

      </View>  
          <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedTag}
        onRequestClose={() => setSelectedTag(null)}
      >
        <View style={styles.modalViewQR}>
          <View style={[styles.modalContentwo, {backgroundColor: '#fff'}]}>
            {selectedTag?.image && (
              <Image
                source={selectedTag.image}
                style={styles.modalLogo}
                resizeMode="contain"
              />
            )}

            {ShowAllTagsLogo ? (
              <Text style={styles.modalTitle}>{selectedTag?.name}</Text>
            ) : (
              <Text style={styles.modalTitle}>@{selectedTag?.name}</Text>
            )}
                {ShowAllTagsLogo ? (
                  <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsScrollContainer}
            >
              {tags.map((tag, index) => (
                <Image
                  key={index}
                  source={tag.image}
                  style={styles.qrTagLogo}
                  resizeMode="contain"
                />
              ))}
            </ScrollView>
                )
              :
              (<></>)}
              
            <QRCodeSVG
              value={selectedTag?.qrData || selectedTag?.name || ''}
              size={150}
              bgColor={"#fff"}
              fgColor={'#000000'}
              level={"L"}
              includeMargin={false}
            />
            {/* <TouchableOpacity onPress={() => {setSelectedTag(null); setShowAllTagsLogo(true)}} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity> */}
            <View style={styles.modalHeaderActions}>
              <TouchableOpacity style={styles.fillerButton}>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {setSelectedTag(null); setShowAllTagsLogo(true)}} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              
              {!ShowAllTagsLogo && (
                <TouchableOpacity 
                  onPress={async () => {
                    if (!currentUser || !selectedTag) return;
                    try {
                      // Delete from Firestore
                      await deleteDoc(doc(db, 'users', currentUser.uid, 'social_tags', selectedTag.platform.toLowerCase()));
                      
                      // Update local state
                      setTags(prev => prev.filter(tag => tag.name !== selectedTag.name));
                      setSelectedTag(null);
                      setShowAllTagsLogo(true);
                      toast.success('Tag deleted successfully!');
                    } catch (error) {
                      toast.error('Error deleting tag');
                    }
                  }} 
                  style={styles.deleteButton}
                >
                  <MaterialIcons name="delete" size={20} color="#FF5252" />
                </TouchableOpacity>
              )}
            </View>
        </View>  
          </View>
              
        </Modal>

      {/* Profile Setup Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showProfileSetup}
        onRequestClose={() => setShowProfileSetup(false)}
      >
        <View style={styles.modalView}>
          <ProfileSetupModal
            visible={showProfileSetup}
            onClose={() => setShowProfileSetup(false)}
            onSave={handleSaveProfile}
          />
        </View>      
        </Modal>    
        </View>
  );
}

const styles = StyleSheet.create({  
  shareButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 2,
  },
  shareButtonGradient: {
    width: 28,
    height: 28,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fixedQrButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    zIndex: 20,
    shadowColor: '#000',
    paddingLeft: 4,
    paddingTop: 3,
    paddingBottom: 3,
    paddingRight: 4,
    borderRadius: 30,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  qrButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  qrButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },  
searchPreview: {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: 'white',
  borderRadius: 20,
  marginTop: 8,
  marginHorizontal: -12,
  padding: 14,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 16,
  elevation: 8,
  zIndex: 10,
  minHeight: 100, // Increased height
},

searchResultSkeleton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
},

skeletonAvatar: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#f0f0f0',
},

skeletonContent: {
  marginLeft: 12,
  flex: 1,
},

skeletonLine: {
  height: 12,
  backgroundColor: '#f0f0f0',
  borderRadius: 6,
  marginBottom: 8,
  width: '80%',
},

searchDivider: {
  height: 1,
  backgroundColor: '#f0f0f0',
  marginVertical: 12,
},
  inviteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inviteText: {
    fontSize: 16,
    color: '#333',
  },  inviteButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  addCardButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  addCardText: {
    color: '#26a69a',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  qrScannerButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  qrScannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  qrScannerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start', // Align items at the start
    alignItems: 'center',
    width: width > 600 ? '100%' : 'auto',
    paddingTop: 2,
  },  header: {
    flexDirection: 'row',
    width: '92%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 30,
  },  searchContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flex: 1,
    marginRight: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  qrButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
},
qrButtonText: {
  color: 'white',
  marginLeft: 8,
  fontSize: 16,
  fontWeight: '500',
},

  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  tagsContainer: {
    flexDirection: 'row', // Use flex direction for horizontal scrolling
    paddingVertical: 2,
    paddingHorizontal: 0,
    marginLeft: -10, 
    marginTop: 14,
    width: 310, // Set to 100% to allow full width
  },
    card: {
    padding: 0,
    minWidth: 64,
    height: 64,
    borderRadius: 20,
    borderWidth: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
cardContentBox: {
    padding: 0,
    backgroundColor: '#fff',
    borderRadius: 0,
    borderWidth: 0,
    shadowColor: 'none',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
},  tagItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    position: 'relative',
  },
  tagItem: {
    alignItems: 'center',
    marginRight: 14,
  },
  deleteTagButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 1,
  },
  settingsButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingsIcon: {
    // opacity: 0.8,
  },
  modalLogo: {
    width: 60,
    height: 60,
    marginBottom: 10,
    borderRadius: 30,
  },
  qrTagLogo: {
    width: 40,
    height: 40,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  tagsScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  addtagButton: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#26a69a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  tagRing: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tagImage: {
    width: 50, // Set the width for the icon image
    height: 50, // Set the height for the icon image
    resizeMode: 'contain', // Ensure the image scales properly
    borderRadius: 15,
  },
  tagText: {
    fontSize: 12,
    textAlign: 'center',
  },
  feed: {
    flex: 1,
  },
  post: {
    width: '100%',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    // alignItems: 'center',
    paddingBottom: 20,
    position: 'relative',
  },
  closeButtonProfile: {
    position: 'relative',
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(229, 231, 235, 0.6)', // bg-gray-200 with opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: '#666', // text-gray-600
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallProfilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff8501',
  },
  username: {
    fontSize: 14,
    fontWeight: '500',
  },
  chatAppsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  
  chatAppButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  
  chatAppButtonSelected: {
    borderColor: '#26a69a',
    backgroundColor: 'rgba(38, 166, 154, 0.1)',
  },
  
  chatAppIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    borderRadius: 15,
  },
  
  privacyToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 15,
  },
  
  privacyLabel: {
    fontSize: 16,
    color: '#666',
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
  
  actionButtonsContainer: {
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },

  actionButtonsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  buttonSpacer: {
    width: 48, // Same width as buttons for symmetry
  },
  
  chatButtonFirst: {
    width: 38,
    height: 38,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatIconFirst: {
    width: 22,
    height: 22,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: [{ scale: 0.96 }],
  },
  chatIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  imageGrid: {
    flexDirection: 'row',
    height: 400,
    gap: 2,
    paddingHorizontal: 16,
  },
  mainImage: {
    flex: 2,
    backgroundColor: '#dedede',
    borderRadius: 4,
  },
  sideImages: {
    flex: 1,
    gap: 2,
  },
  sideImage: {
    flex: 1,
    backgroundColor: '#dedede',
    borderRadius: 4,
  },
  logo: {
    width: 90,
    height: 60,
    borderRadius: 40,
  },
  iconCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }], // Adjust based on icon size
  },
  modalViewQR: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginTop: -48,
  },
    modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  modalContent: {
    width: '80%', // Adjusted width for the modal
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
    borderWidth: 1,
    borderColor: '#d3d3d3',
  },
  modalScrollView: {
    width: '100%',
    maxHeight: '90%',
  },
  editInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  
  locationInput: {
    flex: 1,
    marginLeft: 8,
    marginBottom: 0,
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
    emptyImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#26a69a',
    borderRadius: 15,
    padding: 6,
  },
  
  saveButton: {
    backgroundColor: '#26a69a',
    width: '100%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  cancelButton: {
    backgroundColor: '#f5f5f5',
    width: '100%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContentEdit: {
    width: '90%',
    maxWidth: 420,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },  modalTitleEdit: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 24,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  accordionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  promosButton: {
    position: 'absolute',
    right: 66,
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  promosButtonText: {
    fontWeight: '500',
    fontSize: 13,
  },
  promosContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  promoSearchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  promosList: {
    maxHeight: 400,
  },
  promoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  promoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  promoCardImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  promoCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  promoCardName: {
    fontSize: 16,
    fontWeight: '600',
  },
  promoCardFollowers: {
    fontSize: 13,
    color: '#666',
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#26a69a',
  },
  followingButton: {
    backgroundColor: '#e0e0e0',
  },
  followButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#666',
  },
  promoCodes: {
    gap: 8,
  },
  promoCodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
  },
  promoCodeInfo: {
    flex: 1,
  },
  promoPlatform: {
    fontSize: 12,
    color: '#666',
  },
  promoDiscount: {
    fontSize: 14,
    fontWeight: '600',
  },
  copyCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  promoCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#26a69a',
  },
  modalContentwo: {
    width: '80%', // Adjusted width for the modal
    maxWidth: 420,
    borderRadius: 40,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    marginTop: 5
  },
  submitButton: {
    color: 'blue',
    marginBottom: 10,
  },
  closeButton: {
    // marginTop: 16,
    backgroundColor: '#e0e0e0', // Example color for close button
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  fillerButton: {
    paddingHorizontal: 24,
  },
  closeButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 64, // Set a standard width for the placeholder
    height: 64, // Set a standard height for the placeholder
    borderWidth: 2,
    borderColor: 'gray',
    borderStyle: 'dotted', // Dotted border style
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconButton: {
    width: 64, // Set the width for the icon button
    height: 64, // Set the height for the icon button
    borderRadius: 32, // Make it circular
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // Add border width
    borderColor: 'transparent', // Default border color
    margin: 5, // Add margin between buttons
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.5, // Shadow radius
    elevation: 5, // For Android shadow
  },
  iconSelected: {
    borderColor: 'blue', // Change border color to blue when selected
  },
  iconDefault: {
    // Default styles for unselected icons
  },
  iconImage: {
    width: 38, // Set the width for the icon image
    height: 38, // Set the height for the icon image
    resizeMode: 'contain',
    borderRadius: 10,
  },
  gridContainer: {
    flexDirection: 'row', // Equivalent to grid layout
    flexWrap: 'wrap', // Allow items to wrap to the next line
    justifyContent: 'space-between', // Space between items
    paddingVertical: 16, // Equivalent to py-4
    paddingHorizontal: 8, // Adjust as needed for horizontal spacing
  },
  iconGrid: {
    flexDirection: 'row', // Use flex direction for grid layout
    flexWrap: 'wrap', // Allow items to wrap to the next line
    justifyContent: 'space-between', // Space between items
    paddingVertical: 16, // Equivalent to py-4
    paddingHorizontal: 8, // Adjust as needed for horizontal spacing
  },
  connectButtonBox: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButton: {
    backgroundColor: '#26a69a', // Button color
    borderRadius: 12, // Rounded corners
    paddingVertical: 12, // Vertical padding
    paddingHorizontal: 20, // Horizontal padding
    marginVertical: 10, // Margin for spacing
    alignItems: 'center', // Center the text
    width: '90%', // Full width
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.2, // Shadow opacity
    shadowRadius: 4, // Shadow radius
  },
  connectButtonText: {
    color: 'white', // Text color
    fontSize: 16, // Font size
    fontWeight: 'bold', // Bold text
  },// Add to the existing styles object
  profileCardContainer: {
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    height: 450, // Increased height to accommodate stacked cards
    position: 'relative',
},
profileCard: {
  borderRadius: 32,
  padding: 20,
  width: '90%',
  maxWidth: 320,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 10,
  },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 8,
  // React Native doesn't support CSS transitions
},

nextButton: {
  position: 'absolute',
  bottom: 36,
  right: 20,
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: 'rgba(255, 255, 255, 0.25)',
  justifyContent: 'center',
  alignItems: 'center',
  backdropFilter: 'blur(10px)',
  zIndex: 10,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.15,
  shadowRadius: 3.84,
  elevation: 5,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.3)',
},
  
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
  },
  
  profileImageFirst: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  
  profileContent: {
    alignItems: 'center',
    width: '100%',
  },
  profileBioFirst: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 6,
    marginTop: 8,
    textAlign: 'center',
  },
  profileEmoji: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    textAlign: 'center',
  },
  
  locationContainerFirst: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#eee',
    marginTop: 20,
  },
  profileStatus: {
    fontSize: 12,
    color: '#666',
  },
  newCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 20,
  },
  newCardInfo: {
    flex: 1,
    paddingRight: 16,
  },
  newProfileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 10,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  socialButtonWrapper: {
    width: '46%',
    shadowColor: '#000',
    borderRadius: 20,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  socialButtonFollowed: {
    backgroundColor: '#E5E7EB',
  },
  socialButtonIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    borderRadius: 10
  },
  socialButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  socialButtonTextFollowed: {
    color: '#4B5563',
  },
  profileBio: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  nameLocationContainer: {
    alignItems: 'flex-start',
    marginLeft: -8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 8,
  },
  closedButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  closedButton: {
    width: 80,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  closedButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },  modalCloseButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  fillCardButton: {
    width: '90%',
    maxWidth: 320,
    height: 200,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  fillCardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fillCardText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  fillCardSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: 8,
  }, 
  accordionTouchable: {
  width: '100%',
  backgroundColor: 'white',
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  overflow: 'hidden',
},
   accordionContainer: {
    width: '99%',
    alignSelf: 'center',
    minHeight: 100,
    position: 'absolute',
    bottom: -62,
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: 'none',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  accordionButton: {
    width: '100%',
  },
  accordionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  moreCardsContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  miniCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  miniCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  miniCardLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  miniChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  miniChatButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    marginRight: 6,
  },
  miniChatIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  miniCardImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  miniFollowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'white',
  },
  miniFollowButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#fff', //f5f5f5
    borderRadius: 20,
    borderColor: '#eee',
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  emptyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emptyCardDetails: {
    flex: 1,
    gap: 8,
  },
  emptyTextPlaceholder: {
    height: 14,
    backgroundColor: '#eee',
    borderRadius: 7,
    width: '80%',
  },
  emptyButtonPlaceholder: {
    height: 32,
    backgroundColor: '#eee',
    borderRadius: 16,
    width: 100,
    marginTop: 8,
  },
  emptyCardsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});

