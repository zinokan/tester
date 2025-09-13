import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';

const MatchesScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      // Mock data for demo - replace with actual API call
      const mockMatches = [
        {
          id: '1',
          match_id: 'match_1',
          matched_user_id: 'user_1',
          matched_user_name: 'Emma',
          matched_user_last_name: 'Wilson',
          matched_user_photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
          matched_at: '2024-01-15T10:30:00Z',
          last_message_at: '2024-01-15T14:20:00Z',
        },
        {
          id: '2',
          match_id: 'match_2',
          matched_user_id: 'user_2',
          matched_user_name: 'James',
          matched_user_last_name: 'Smith',
          matched_user_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
          matched_at: '2024-01-14T16:45:00Z',
          last_message_at: null,
        },
        {
          id: '3',
          match_id: 'match_3',
          matched_user_id: 'user_3',
          matched_user_name: 'Sophia',
          matched_user_last_name: 'Brown',
          matched_user_photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
          matched_at: '2024-01-13T09:15:00Z',
          last_message_at: '2024-01-13T11:30:00Z',
        },
      ];
      
      setMatches(mockMatches);
      setIsLoading(false);
    } catch (error) {
      showMessage({
        message: 'Failed to load matches',
        type: 'danger',
      });
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'New match!';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const renderMatch = ({ item }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => navigation.navigate('Chat', { match: item })}
    >
      <View style={styles.matchContent}>
        <Image
          source={{ uri: item.matched_user_photo }}
          style={styles.matchPhoto}
        />
        
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>
            {item.matched_user_name} {item.matched_user_last_name}
          </Text>
          <Text style={styles.matchTime}>
            {formatTime(item.last_message_at || item.matched_at)}
          </Text>
        </View>

        <View style={styles.matchActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('UserProfile', { userId: item.matched_user_id })}
          >
            <Ionicons name="person-outline" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Chat', { match: item })}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#FF6B6B" />
      <Text style={styles.emptyTitle}>No matches yet</Text>
      <Text style={styles.emptyText}>
        Start swiping to find your perfect match!
      </Text>
      <TouchableOpacity
        style={styles.startSwipingButton}
        onPress={() => navigation.navigate('Swipe')}
      >
        <Text style={styles.startSwipingButtonText}>Start Swiping</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  matchTime: {
    fontSize: 14,
    color: '#666',
  },
  matchActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 10,
    marginLeft: 5,
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
  startSwipingButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startSwipingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MatchesScreen;