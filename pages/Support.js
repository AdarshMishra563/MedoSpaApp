import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';

const API_BASE_URL = 'http://192.168.33.118:5000';

const API_ENDPOINTS = {
  startChat: `${API_BASE_URL}/chat/start`,
  getChatMessages: (token) => `${API_BASE_URL}/chat/${token}`,
  sendMessage: `${API_BASE_URL}/chat/send`,
  getUserChats: `${API_BASE_URL}/chat/user/chats`,
  getBookings: `${API_BASE_URL}/data/book`
};

const ChatSupportScreen = ({ navigation }) => {
  const token = useSelector(state => state.user.userToken);
  const userId = useSelector(state => state.user.userInfo.id);
  const [activeView, setActiveView] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedBookingForChat, setSelectedBookingForChat] = useState(null);
  const [messageStatus, setMessageStatus] = useState({});
  const flatListRef = useRef(null);
  const refreshIntervalRef = useRef(null);
const currentChatRef = useRef(currentChat);
  // Memoized API endpoints
  const memoizedEndpoints = useMemo(() => API_ENDPOINTS, []);
useEffect(() => {
  currentChatRef.current = currentChat;
}, [currentChat]);
  // Fetch bookings with useCallback
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(memoizedEndpoints.getBookings, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      const formattedBookings = data.bookings.map(booking => ({
        id: booking._id,
        image: booking.picture || booking.service?.imageSource || 'https://via.placeholder.com/50',
        name: booking.serviceFor,
        appointmentDate: moment(booking.appointmentDate).format('DD MMM YYYY, hh:mm A'),
        serviceType: booking.serviceType,
        status: booking.status || 'active',
        createdAt: moment(booking.createdAt).format('DD MMM YYYY')
      }));
      
      setBookings(formattedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, memoizedEndpoints]);

  // Fetch chats with useCallback
  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(memoizedEndpoints.getUserChats, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, memoizedEndpoints]);

  // Load chat with useCallback
  const loadChat = useCallback(async (chat) => {
    try {
      const newChat = {
      token: chat.token,
      serviceType: chat.serviceType,
      status: chat.status
    };
    
    setCurrentChat(newChat);
    currentChatRef.current = newChat;
      const response = await fetch(memoizedEndpoints.getChatMessages(chat.token), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
   
      const data = await response.json();
      setMessages(data.messages || []);
      setActiveView('chat');
      
      // Start refresh interval for this chat
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      refreshIntervalRef.current = setInterval(() => {
        refreshCurrentChat();
      }, 10000); // Refresh every 10 seconds
    } catch (err) {
      console.error('Error loading chat:', err);
    }
  }, [token, memoizedEndpoints]);

  
  const refreshCurrentChat = useCallback(async () => {
   console.log("refreshed")
      const currentChat = currentChatRef.current;
        if (!currentChat?.token) return;
    try {
      const response = await fetch(memoizedEndpoints.getChatMessages(currentChat.token), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error refreshing chat:', err);
    }
  }, [currentChat, token, memoizedEndpoints]);

  // Start new chat with useCallback
  const startNewChat = useCallback(async (reason) => {
    try {
      setLoading(true);
      const response = await fetch(memoizedEndpoints.startChat, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceType: reason,
          bookingId: selectedBookingForChat?.id
        })
      });
      
      const data = await response.json();
      console.log(data)
    
      const initialMessage = {
        _id: data.initialMessage._id || Date.now().toString(),
        text: data.initialMessage.text,
        sender: 'support',
        timestamp: new Date().toISOString(),
        status: 'delivered'
      };
      
      const newChat = {
        token: data.token,
        serviceType: reason,
        status: 'active',
        lastMessage: initialMessage,
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setChats(prev => [...prev, newChat]);
      setActiveView('chat');
      setCurrentChat({
        token: data.token,
        serviceType: reason,
        messages: [data.initialMessage]
      });
      setMessages([initialMessage]);
   
      // Start refresh interval for this new chat
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      refreshIntervalRef.current = setInterval(() => {
        refreshCurrentChat();
      }, 10000); // Refresh every 10 seconds
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setLoading(false);
    }
  }, [token, selectedBookingForChat, memoizedEndpoints, refreshCurrentChat]);

  // Send message with useCallback
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentChat) return;

    try {
      const tempId = Date.now().toString();
      const tempMessage = {
        _id: tempId,
        text: newMessage,
        sender: 'user',
        status: 'sending',
        timestamp: new Date().toISOString()
      };
      
      // Optimistic update
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      setMessageStatus(prev => ({ ...prev, [tempId]: 'sending' }));
      
      const response = await fetch(memoizedEndpoints.sendMessage, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          token: currentChat.token,
          text: newMessage
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      const { message } = await response.json();
      
      // Replace temp message with server response
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { 
          ...message,
          _id: message._id || tempId,
          status: 'delivered'
        } : msg
      ));
      
      // Update chat list
      setChats(prev => prev.map(chat => 
        chat.token === currentChat.token ? {
          ...chat,
          lastMessage: message,
          updatedAt: new Date().toISOString()
        } : chat
      ));
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (err) {
      console.error('Error sending message:', err);
      setMessageStatus(prev => ({ ...prev, [tempId]: 'failed' }));
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...msg, status: 'failed' } : msg
      ));
    }
  }, [newMessage, currentChat, token, memoizedEndpoints]);

  // Memoized status color getter
  const getStatusColor = useCallback((status) => {
    switch (status.toLowerCase()) {
      case 'cancelled': return '#ff6b6b';
      case 'completed': return '#51cf66';
      case 'confirmed': return '#339af0';
      case 'active': return '#fcc419';
      default: return '#adb5bd';
    }
  }, []);

  // Memoized service icon getter
  const getServiceIcon = useCallback((serviceType) => {
    switch (serviceType) {
      case 'payment': return 'payment';
      case 'cancellation': return 'cancel';
      case 'reschedule': return 'schedule';
      case 'feedback': return 'feedback';
      case 'technical': return 'build';
      default: return 'support';
    }
  }, []);

  // Refresh control handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeView === 'bookings') {
      fetchBookings();
    } else if (activeView === 'chats') {
      fetchChats();
    }
  }, [activeView, fetchBookings, fetchChats]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Initial data loading
  useEffect(() => {
    fetchBookings();
    fetchChats();
  }, [fetchBookings, fetchChats]);

  // Memoized booking item renderer
  const renderBookingItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.bookingItem}
      onPress={() => {
        setSelectedBookingForChat(item);
        setActiveView('choose-reason');
      }}
    >
      <View style={styles.bookingHeader}>
        <Image source={{ uri: item.image }} style={styles.bookingImage} />
        <Text style={styles.bookingName}>{item.name}</Text>
        <Icon name="chevron-right" size={24} color="#495057" />
      </View>
      
      <View style={styles.bookingDetails}>
        <Text style={styles.detailText}>Date: {item.appointmentDate}</Text>
        <Text style={styles.detailText}>Service: {item.serviceType}</Text>
      </View>
      
      <View style={styles.bookingFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.createdAtText}>Created: {item.createdAt}</Text>
      </View>
    </TouchableOpacity>
  ), [getStatusColor]);

  // Memoized chat item renderer
  const renderChatItem = useCallback(({ item }) => {
    const lastMessageTime = item.lastMessage?.timestamp 
      ? moment(item.lastMessage.timestamp).format('h:mm A')
      : '';
    
    return (
      <TouchableOpacity 
        style={styles.chatItem}
        onPress={() => loadChat(item)}
      >
        <View style={styles.chatAvatarContainer}>
          <Icon 
            name={getServiceIcon(item.serviceType)} 
            size={30} 
            color="#339af0" 
            style={styles.chatAvatarIcon}
          />
        </View>
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>
            {item.serviceType.toUpperCase()} Support
          </Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage?.text || 'No messages yet'}
          </Text>
        </View>
        <View style={styles.chatRight}>
          <Text style={styles.chatTime}>{lastMessageTime}</Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [getServiceIcon, loadChat]);

  // Memoized message renderer
  const renderMessage = useCallback(({ item }) => {
    const isMe = item.sender === 'user';
    const isSupport = item.sender === 'support';
    const status = messageStatus[item._id] || item.status;
    
    return (
      <View style={[
        styles.messageContainer,
        isMe ? styles.myMessage : isSupport ? styles.supportMessage : styles.theirMessage,
        status === 'failed' && styles.failedMessage
      ]}>
        {isSupport && (
          <View style={styles.supportAvatarContainer}>
            <Icon name="support-agent" size={24} color="#fff" />
          </View>
        )}
        <View style={styles.messageContent}>
          {isSupport && (
            <Text style={styles.senderName}>Support Agent</Text>
          )}
          <Text style={isMe ? styles.myMessageText : isSupport ? styles.supportMessageText : styles.theirMessageText}>
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {moment(item.timestamp).format('h:mm A')}
            </Text>
            {isMe && (
              <Icon 
                name={
                  status === 'failed' ? 'error' : 
                  status === 'sending' ? 'access-time' : 
                  'check-circle'
                } 
                size={14} 
                color={
                  status === 'failed' ? '#ff6b6b' : 
                  status === 'sending' ? '#999' : 
                  '#4CAF50'
                } 
                style={styles.statusIcon} 
              />
            )}
          </View>
        </View>
      </View>
    );
  }, [messageStatus]);

  // Memoized action button renderer
  const renderActionButton = useCallback((title, onPress, color = '#339af0') => (
    <TouchableOpacity 
      style={[styles.actionButton, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.actionButtonText}>{title}</Text>
      <Icon name="chevron-right" size={20} color="#fff" />
    </TouchableOpacity>
  ), []);

  // Memoized booking options
  const renderBookingOptions = useCallback(() => {
    if (!selectedBookingForChat) return null;
    
    const commonOptions = [
      {
        title: 'General Inquiry',
        color: '#339af0',
        action: () => startNewChat('general')
      },
      {
        title: 'Payment Issues',
        color: '#ff6b6b',
        action: () => startNewChat('payment')
      }
    ];
    
    const statusSpecificOptions = 
      selectedBookingForChat.status === 'active' ? [
        {
          title: 'Cancel Booking',
          color: '#ff6b6b',
          action: () => startNewChat('cancellation')
        },
        {
          title: 'Reschedule',
          color: '#fcc419',
          action: () => startNewChat('reschedule')
        }
      ] : selectedBookingForChat.status === 'completed' ? [
        {
          title: 'Service Feedback',
          color: '#51cf66',
          action: () => startNewChat('feedback')
        },
        {
          title: 'Receipt Request',
          color: '#7950f2',
          action: () => startNewChat('receipt')
        }
      ] : [];
    
    return [...commonOptions, ...statusSpecificOptions];
  }, [selectedBookingForChat, startNewChat]);

  // Chat view
  if (activeView === 'chat') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
          keyboardVerticalOffset={90}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => {
              if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
              }
              setActiveView(chats.length > 0 ? 'chats' : 'bookings');
            }}>
              <Icon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.chatTitle}>
              {currentChat?.serviceType ? `${currentChat.serviceType.toUpperCase()} Support` : 'Support Chat'}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item._id || item.timestamp}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type your message..."
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Icon name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Choose reason view
  if (activeView === 'choose-reason' && selectedBookingForChat) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setActiveView('bookings')}
          >
            <Icon name="arrow-back" size={24} color="#339af0" />
            <Text style={styles.backButtonText}>Back to bookings</Text>
          </TouchableOpacity>
          
          <View style={styles.bookingCard}>
            <Image 
              source={{ uri: selectedBookingForChat.image }} 
              style={styles.bookingCardImage} 
            />
            <View style={styles.bookingCardDetails}>
              <Text style={styles.bookingCardTitle}>{selectedBookingForChat.name}</Text>
              <Text style={styles.bookingCardText}>Date: {selectedBookingForChat.appointmentDate}</Text>
              <Text style={styles.bookingCardText}>Service: {selectedBookingForChat.serviceType}</Text>
              <View style={[styles.statusBadge, { 
                backgroundColor: getStatusColor(selectedBookingForChat.status),
                alignSelf: 'flex-start'
              }]}>
                <Text style={styles.statusText}>{selectedBookingForChat.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.optionsTitle}>How can we help you?</Text>
          
          <View style={styles.optionsGrid}>
            {renderBookingOptions().map((option, index) => (
              <View key={index} style={styles.optionColumn}>
                {renderActionButton(option.title, option.action, option.color)}
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Chats list view
  if (activeView === 'chats') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setActiveView('bookings')}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Active Support</Text>
          <TouchableOpacity onPress={fetchChats}>
            <Icon name="refresh" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        {loading && chats.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item, index) => item?.token ?? index.toString()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No chats yet</Text>
                <TouchableOpacity 
                  style={styles.backToBookingsButton}
                  onPress={() => setActiveView('bookings')}
                >
                  <Text style={styles.backToBookingsText}>Back to bookings</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // Default view - Bookings list
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Bookings For Support</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={fetchBookings} style={styles.refreshButton}>
            <Icon name="refresh" size={24} color="#333" />
          </TouchableOpacity>
          {chats.length > 0 && (
            <TouchableOpacity 
              onPress={() => setActiveView('chats')} 
              style={styles.chatsButton}
            >
              <Icon name="forum" size={24} color="#333" />
              {chats.some(chat => chat.unreadCount > 0) && (
                <View style={styles.unreadIndicator} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {loading && bookings.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No bookings yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    marginRight: 15,
  },
  chatsButton: {
    position: 'relative',
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff6b6b',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  backToBookingsButton: {
    padding: 10,
    backgroundColor: '#339af0',
    borderRadius: 5,
  },
  backToBookingsText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bookingItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  bookingName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingDetails: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  bookingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  createdAtText: {
    fontSize: 12,
    color: '#868e96',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  chatAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatAvatarIcon: {
    opacity: 0.8,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  chatRight: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#4CAF50',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  supportMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  failedMessage: {
    opacity: 0.7,
    borderColor: '#ff6b6b',
    borderWidth: 1,
  },
  supportAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#339af0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
    padding: 12,
  },
  theirMessageText: {
    color: '#333',
    padding: 12,
  },
  supportMessageText: {
    color: '#212529',
    padding: 12,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButtonText: {
    color: '#339af0',
    marginLeft: 5,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingCardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  bookingCardDetails: {
    flex: 1,
  },
  bookingCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bookingCardText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 3,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#495057',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionColumn: {
    width: '48%',
    marginBottom: 15,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ChatSupportScreen;