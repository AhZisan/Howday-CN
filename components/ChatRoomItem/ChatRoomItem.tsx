import React, { useState, useEffect } from 'react';
import { Text, View, Image, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './Styles';

import { Auth, DataStore } from 'aws-amplify';
import { ChatRoomUser, Message, User } from '../../src/models';



export default function ChatRoomItem({ chatRoom }) {
  const [user, setUser] = useState<User | null>(null); // the display user 
  const [lastMessage, setLastMessage] = useState<Message | undefined>();


  const navigation = useNavigation();


  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = (await DataStore.query(ChatRoomUser))
        .filter(chatRoomUser => chatRoomUser.chatRoom.id === chatRoom.id)
        .map(chatRoomUser => chatRoomUser.user);


      const authUser = await Auth.currentAuthenticatedUser();
      setUser(fetchedUsers.find(user => user.id !== authUser.attributes.sub) || null);
    };
    fetchUsers();
  }, []);

  /// last message in the home 
  useEffect(() => {
    if (!chatRoom.chatRoomLastMessagesId) { return }
    DataStore.query(Message, chatRoom.chatRoomLastMessagesId).then(setLastMessage);
  }, [])


  const OnPrs = () => {
    navigation.navigate('ChatRoom', { id: chatRoom.id });
  }

  if (!user) {
    return <ActivityIndicator />
  }

  return (
    <Pressable onPress={OnPrs} style={styles.container}>
      <Image source={{ uri: user.imageUri }} style={styles.image} />

      {!!chatRoom.newMessages && <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{chatRoom.newMessages}</Text>
      </View>}

      <View style={styles.rightConteiner}>
        <View style={styles.row}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.text}>{lastMessage?.createdAt}</Text>
        </View>

        <Text numberOfLines={1} style={{
          color: chatRoom.newMessages ? '#ff9f00' : 'gray',
          fontWeight: chatRoom.newMessages ? 'bold' : 'normal'
        }}>{lastMessage?.content}</Text>

      </View>
    </Pressable>
  );
}

