import React, { useEffect, useState } from 'react';
import { View, Image, Text, ImageBackground, Pressable, StyleSheet } from "react-native";
import { RootStackScreenProps } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

import { Auth, DataStore } from 'aws-amplify';
import { User } from '../src/models';


export default function NotFoundScreen({ navigation }: RootStackScreenProps<'NotFound'>) {

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = (await DataStore.query(User))

      const authUser = await Auth.currentAuthenticatedUser();
      setUser(fetchedUsers.find(user => user.id === authUser.attributes.sub) || null);
    };
    fetchUsers();
  }, []);



  const logout = () => {
    Auth.signOut();
  }

  return (
    <View style={styles.container}>
      {/* <ImageBackground source={require('../assets/images/bcp.png')} style={styles.BcImage}> */}

      <View style={styles.profileContainer}>
        <Image
          source={user?.imageUri ? { uri: user?.imageUri } : require('../assets/images/avatar.png')}
          style={styles.profileImg}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.pText}> {user?.name} </Text>
          <Text style={styles.text}> Status: {user?.status} </Text>
        </View>
      </View>
      <View style={styles.opt}>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: 'lightgray' }}>
          <Text style={{ padding: 15 }}>
            Account
          </Text>
          <MaterialIcons name="arrow-forward-ios" size={15} color="black" style={{ padding: 15 }} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: 'lightgray' }}>
          <Text style={{ padding: 15 }}>
            Library
          </Text>
          <MaterialIcons name="arrow-forward-ios" size={15} color="black" style={{ padding: 15 }} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: 'lightgray' }}>
          <Text style={{ padding: 15 }}>
            Privacy
          </Text>
          <MaterialIcons name="arrow-forward-ios" size={15} color="black" style={{ padding: 15 }} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ padding: 15 }}>
            Notification
          </Text>
          <MaterialIcons name="arrow-forward-ios" size={15} color="black" style={{ padding: 15 }} />
        </View>



      </View>

      <View style={styles.opt}>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: 'lightgray' }}>
          <Text style={{ padding: 15 }}>
            Settings
          </Text>
          <MaterialIcons name="arrow-forward-ios" size={15} color="black" style={{ padding: 15 }} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: 'lightgray' }}>
          <Text style={{ padding: 15 }}>
            Help
          </Text>
          <MaterialIcons name="arrow-forward-ios" size={15} color="black" style={{ padding: 15 }} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ padding: 15 }}>
            About
          </Text>
          <MaterialIcons name="arrow-forward-ios" size={15} color="black" style={{ padding: 15 }} />
        </View>



      </View>





      <View style={styles.logoutContainer}>
        <Pressable onPress={logout} style={styles.logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
      {/* </ImageBackground> */}
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#EBECf0'
  },
  // BcImage: {
  //   flex: 1,
  //   resizeMode: 'cover',
  //   justifyContent: 'center',
  //   // opacity: 0.5

  // },

  profileContainer: {
    flexDirection: 'row',
    padding: 10,
    height: 170,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },

  profileImg: {
    width: 150,
    height: 150,
    borderRadius: 80,
    borderWidth: 5,
    borderColor: '#ff7518',

  },

  profileInfo: {
    flex: 1,
    marginLeft: 18,
    justifyContent: 'center',

  },

  pText: {
    fontWeight: 'bold',
    fontSize: 25,
    color: '#525252'

  },

  text: {
    height: 70,
    marginTop: 6,
  },
  opt: {
    marginTop: 5,
    backgroundColor: 'white',
    justifyContent: 'flex-start',
    borderRadius: 10,
    padding: 5
  },




  logoutContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,

  },
  logout: {
    width: 300,
    height: 50,
    margin: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    alignSelf: 'flex-end'

  },
  logoutText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold'
  },
});
