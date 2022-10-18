import React from 'react';
import { Text , View, Image , Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from './Styles';
import { Auth, DataStore } from 'aws-amplify';
import { ChatRoom, User, ChatRoomUser } from '../../src/models';




export default function ContactsItem({ user }) {   

    const navigation = useNavigation();

    const OnPrs = async () => {
      /// to do if already a chat room between these two users
      /// then redirect to the existing chat room
      /// otherwise, create a new chat room with these user

      
      /// create a chat room
      const newChatRoom = await DataStore.save(new ChatRoom({newMessages: 0}));


      /// connect authenticated user with the chat room
      const authUser = await Auth.currentAuthenticatedUser();
      const dbUser = await DataStore.query(User, authUser.attributes.sub);
      await DataStore.save(new ChatRoomUser({
        user: dbUser,
        chatRoom: newChatRoom
      }))

           /// connect clicked user with the chat room
      await DataStore.save(new ChatRoomUser({
        user,
        chatRoom: newChatRoom
      }))

      navigation.navigate('ChatRoom', { id: newChatRoom.id});

    }

    return(
        <Pressable onPress={OnPrs} style={styles.container}>
        <Image source={{ uri: user.imageUri}} style={styles.image} />
       

        <View style={styles.rightConteiner}>
          <View style={styles.row}>
            <Text style={styles.name}>{user.name}</Text>
          </View>

        </View>       
      </Pressable>
    );
}
 
