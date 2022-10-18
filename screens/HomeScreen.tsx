import React, {useState, useEffect} from 'react';
import { Text , View, Image , StyleSheet, FlatList } from 'react-native';
import ChatRoomItem from '../components/ChatRoomItem';

import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, ChatRoomUser } from '../src/models';

// const chatRoom1=chatRoomsData[0];
// const chatRoom2=chatRoomsData[1];


import { RootTabScreenProps } from '../types';


export default function HomeScreen() {
  const [chatRooms, setChatrooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    const fatchChatRooms = async () => {
      const userData = await Auth.currentAuthenticatedUser();

      const chatRooms = (await DataStore.query(ChatRoomUser))
      .filter(chatRoomUser => chatRoomUser.user.id === userData.attributes.sub)
      .map(chatRoomUser => chatRoomUser.chatRoom);

      setChatrooms(chatRooms);
    };
    fatchChatRooms();

  }, []);


  return (
      <View style={styles.page}>
        <FlatList 
          data={chatRooms}
          renderItem={({ item }) => <ChatRoomItem chatRoom={item} />}
        />
      </View>  
  );
}


const styles = StyleSheet.create({
  page:{
    backgroundColor: 'white',
    flex: 1,
  },

})
