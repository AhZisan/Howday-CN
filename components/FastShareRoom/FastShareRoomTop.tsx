import { StyleSheet, Text, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { Auth, DataStore } from "aws-amplify";
import { ChatRoomUser, User } from "../../src/models";

const FastShareRoomTop = ({ connection, id }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    const fetchUsers = async () => {
      const fetchedUsers = (await DataStore.query(ChatRoomUser))
        .filter((chatRoomUser) => chatRoomUser.chatRoom.id === id)
        .map((chatRoomUser) => chatRoomUser.user);

      const authUser = await Auth.currentAuthenticatedUser();
      setUser(
        fetchedUsers.find((user) => user.id !== authUser.attributes.sub) || null
      );
    };
    fetchUsers();
  }, []);
  return (
    <View style={styles.info}>
      <Image
        source={user?.imageUri ? { uri: user?.imageUri } : require('../../assets/images/avatar.png')}

        style={styles.image}
      />

      <View style={styles.rightConteiner}>
        <View style={styles.row}>
          <Text numberOfLines={1} style={styles.name}>
            {user?.name}
          </Text>
        </View>

        <Text style={styles.conStatus}>
          {connection ? "Connected" : "Connecting..."}
        </Text>
      </View>
      <View style={{ justifyContent: "center" }}>
        <Text> speed</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  info: {
    height: 60,
    backgroundColor: "white",
    flexDirection: "row",
    padding: 5,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#ff7518',
  },
  rightConteiner: {
    flex: 1,
    justifyContent: "center",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  name: {
    fontSize: 15,
    fontWeight: "bold",
  },
  conStatus: {
    fontStyle: "italic",
    fontSize: 14,
  },
});

export default FastShareRoomTop;
