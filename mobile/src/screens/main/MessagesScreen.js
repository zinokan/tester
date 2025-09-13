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

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      // Mock data for demo - replace with actual API call
      const mockConversations = [
        {
          match_id: 'match_1',
          matched_user_id: 'user_1',
          matched_user_name: 'Emma',
          matched_user_last_name: 'Wilson',
          matched_user_photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200',
          last_message: 'Hey! How was your day?',
          last_message_type: 'text',
          last_message_created_at: '2024-01-15T14:20:00Z',
          last_message_sender_id: 'user_1',
          unread_count: 2,
        },
        {
          match_id: 'match_2',
          matched_user_id: 'user_2',
          matched_user_name: 'James',
          matched_user_last_name: 'Smith',
          matched_user_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
          last_message: 'Thanks for the great conversation!',
          last_message_type: 'text',
          last_message_created_at: '2024-01-14T16:45:00Z',
          last_message_sender_id: 'current_user',
          unread_count: 0,
        },
        {
          match_id: 'match_3',
          matched_user_id: 'user_3',
          matched_user_name: 'Sophia',
          matched_user_last_name: 'Brown',
          matched_user_photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
          last_message: '😊',
          last_message_type: 'emoji',
          last_message_created_at: '2024-01-13T11:30:00Z',
          last_message_sender_id: 'user_3',
          unread_count: 1,
        },
      ];
      
      setConversations(mockConversations);
      setIsLoading(false);
    } catch (error) {
      showMessage({
        message: 'Failed to load conversations',
        type: 'danger',
      });
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getMessagePreview = (message, type) => {
    if (type === 'image') return '📷 Photo';
    if (type === 'gif') return '🎬 GIF';
    if (type === 'emoji') return message;
    return message;
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => navigation.navigate('Chat', { match: item })}
    >
      <View style={styles.conversationContent}>
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: item.matched_user_photo }}
            style={styles.conversationPhoto}
          />
          {item.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unread_count > 9 ? '9+' : item.unread_count}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName}>
              {item.matched_user_name} {item.matched_user_last_name}
            </Text>
            <Text style={styles.conversationTime}>
              {formatTime(item.last_message_created_at)}
            </Text>
          </View>
          
          <View style={styles.messagePreview}>
            <Text
              style={[
                styles.lastMessage,
                item.unread_count > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}
            >
              {getMessagePreview(item.last_message, item.last_message_type)}
            </Text>
            {item.last_message_sender_id !== 'current_user' && item.unread_count > 0 && (
              <View style={styles.unreadDot} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={80} color="#FF6B6B" />
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptyText}>
        Start chatting with your matches!
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.match_id}
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
  searchButton: {
    padding: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  conversationCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  conversationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 15,
  },
  conversationPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  conversationTime: {
    fontSize: 12,
    color: '#666',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadMessage: {
    color: '#333',
    fontWeight: '500',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
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
  },
});

export default MessagesScreen;