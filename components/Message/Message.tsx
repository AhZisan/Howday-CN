import { View, Text, StyleSheet, Platform, ActivityIndicator, useWindowDimensions } from 'react-native';
import React, { useState, useEffect } from 'react';

import { Auth, DataStore } from 'aws-amplify';
import { S3Image } from 'aws-amplify-react-native';
import { User } from '../../src/models';




const orange = '#ff7518'; //#3777f0
const gray = 'lightgray';


const myId = 'u1';


const Message = ({ message }) => {
  const [user, setUser] = useState<User | undefined>();
  const [isMe, setIsMe] = useState<boolean>(false);

  const { width } = useWindowDimensions();

  useEffect(() => {
    DataStore.query(User, message.userID).then(setUser);
  }, []);

  useEffect(() => {
    const checkIfMe = async () => {
      if (!user) {
        return;
      }
      const authUser = await Auth.currentAuthenticatedUser();
      setIsMe(user.id === authUser.attributes.sub);
    }
    checkIfMe();
  }, [user]);

  if (!user) {
    return <ActivityIndicator />
  }


  return (
    <View style={[styles.container, isMe ? styles.rightContainer : styles.leftContainer]}>

      {message.image && (
        <View style={{ marginBottom: message.content ? 10 : 0 }}>
          <S3Image
            imgKey={message.image}
            style={{ width: width * 0.7, aspectRatio: 4 / 3 }}
            resizeMode="contain"
          />
        </View>
      )}

      {!!message.content && (
        <Text style={{ fontSize: Platform.OS === 'ios' ? 15 : null, color: isMe ? 'black' : 'white' }}>
          {message.content}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {

    padding: 10,
    margin: 10,
    borderRadius: 12,
    maxWidth: '75%',


  },
  leftContainer: {
    backgroundColor: orange,
    marginLeft: 10,
    marginRight: 'auto',
  },
  rightContainer: {
    backgroundColor: gray,
    marginLeft: 'auto',
    marginRight: 10,
  }
});

export default Message



