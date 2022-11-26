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
    <View style={styles.topArea}>
      <Image
        source={
          user?.imageUri
            ? { uri: user?.imageUri }
            : require("../../assets/images/avatar.png")
        }
        style={styles.image}
      />
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          textTransform: "capitalize",
          ...styles.textStyle,
        }}
      >
        {user?.name}
      </Text>

      <Text style={styles.conStatus}>
        {connection ? "Connected" : "Connecting..."}
      </Text>
      {/* <ImageUploader setFile={setFile} /> */}
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
  topArea: {
    padding: 10,
    paddingHorizontal: 15,
    borderColor: "#D4D4D4",
    borderBottomWidth: 1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  textStyle: {
    color: "black",
    // fontWeight: "bold",
    // textAlign: "center",
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#ff7518",
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
