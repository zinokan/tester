import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage } from 'react-native-flash-message';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.7;

const SwipeScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Mock data for demo - replace with actual API call
      const mockUsers = [
        {
          id: '1',
          firstName: 'Emma',
          lastName: 'Wilson',
          age: 25,
          bio: 'Love hiking and coffee ☕️',
          photos: [
            { photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400' },
            { photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400' },
          ],
          isVerified: true,
        },
        {
          id: '2',
          firstName: 'James',
          lastName: 'Smith',
          age: 28,
          bio: 'Photographer and travel enthusiast 📸',
          photos: [
            { photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
            { photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
          ],
          isVerified: true,
        },
        {
          id: '3',
          firstName: 'Sophia',
          lastName: 'Brown',
          age: 23,
          bio: 'Artist and yoga instructor 🧘‍♀️',
          photos: [
            { photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
            { photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400' },
          ],
          isVerified: false,
        },
      ];
      
      setUsers(mockUsers);
      setIsLoading(false);
    } catch (error) {
      showMessage({
        message: 'Failed to load users',
        type: 'danger',
      });
      setIsLoading(false);
    }
  };

  const handleSwipe = (direction) => {
    if (currentIndex >= users.length) return;

    const currentUser = users[currentIndex];
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (direction === 'right') {
      // Like
      showMessage({
        message: `Liked ${currentUser.firstName}!`,
        type: 'success',
      });
    } else {
      // Pass
      showMessage({
        message: `Passed on ${currentUser.firstName}`,
        type: 'info',
      });
    }

    // Move to next card
    setCurrentIndex(currentIndex + 1);
    resetCardPosition();
  };

  const handleSuperLike = () => {
    if (currentIndex >= users.length) return;

    const currentUser = users[currentIndex];
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    showMessage({
      message: `Super liked ${currentUser.firstName}! ⭐`,
      type: 'success',
    });

    setCurrentIndex(currentIndex + 1);
    resetCardPosition();
  };

  const resetCardPosition = () => {
    translateX.setValue(0);
    translateY.setValue(0);
    rotate.setValue(0);
    scale.setValue(1);
  };

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY, velocityX } = event.nativeEvent;
      
      if (Math.abs(translationX) > 100 || Math.abs(velocityX) > 500) {
        // Swipe threshold reached
        const direction = translationX > 0 ? 'right' : 'left';
        handleSwipe(direction);
      } else {
        // Return to center
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const renderCard = (user, index) => {
    const isCurrentCard = index === currentIndex;
    const isNextCard = index === currentIndex + 1;

    if (index < currentIndex) return null;

    const cardStyle = {
      transform: [
        { translateX: isCurrentCard ? translateX : 0 },
        { translateY: isCurrentCard ? translateY : 0 },
        { 
          rotate: isCurrentCard ? 
            translateX.interpolate({
              inputRange: [-width, 0, width],
              outputRange: ['-15deg', '0deg', '15deg'],
            }) : '0deg'
          },
        { scale: isNextCard ? 0.95 : 1 },
      ],
      zIndex: users.length - index,
    };

    return (
      <Animated.View
        key={user.id}
        style={[styles.card, cardStyle]}
      >
        <Image
          source={{ uri: user.photos[0]?.photo_url }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        />
        
        <View style={styles.cardContent}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.firstName}, {user.age}
            </Text>
            {user.isVerified && (
              <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
            )}
          </View>
          <Text style={styles.userBio} numberOfLines={2}>
            {user.bio}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('UserProfile', { user })}
        >
          <Ionicons name="person-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Finding amazing people...</Text>
      </View>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-outline" size={80} color="#FF6B6B" />
        <Text style={styles.emptyTitle}>No more profiles</Text>
        <Text style={styles.emptyText}>
          Check back later for new people to discover!
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            setCurrentIndex(0);
            loadUsers();
          }}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {users.map((user, index) => renderCard(user, index))}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton]}
          onPress={() => handleSwipe('left')}
        >
          <Ionicons name="close" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={handleSuperLike}
        >
          <Ionicons name="star" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleSwipe('right')}
        >
          <Ionicons name="heart" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 10,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 60,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
  },
  userBio: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  profileButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#FF6B6B',
  },
  superLikeButton: {
    backgroundColor: '#4ECDC4',
  },
  likeButton: {
    backgroundColor: '#4ECDC4',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SwipeScreen;