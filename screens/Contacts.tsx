import React, { useState, useEffect} from 'react';
import { Text, View , StyleSheet, FlatList } from 'react-native';

import { DataStore } from '@aws-amplify/datastore';
import { User } from '../src/models';
import ContactsItem from '../components/ContactsItem';



export default function TabTwoScreen() {

    const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    DataStore.query(User).then(setUsers);
  }, [])


    // useEffect(() => {
    //   // query users
    //   const fetchUsers = async () => {
    //       const fetchedUsers = await DataStore.query(User);
    //       setUsers(fetchedUsers);
    //   };
    //   fetchUsers();

    // }, [])

  return (
      <View style={styles.page}>
        <FlatList 
          data={users}
          renderItem={({ item }) => <ContactsItem user={item} />}
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
