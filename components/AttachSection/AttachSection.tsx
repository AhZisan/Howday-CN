import {
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import * as ImagePicker from "expo-image-picker";

import {
  MaterialCommunityIcons,
  Feather,
  MaterialIcons,
} from "@expo/vector-icons";

import { Auth, DataStore } from "aws-amplify";
import { User } from "../../src/models";

const AttachSection = ({ setImage, chatRoomId }) => {
  const navigation = useNavigation();

  // const [image, setImage] = useState<string | null>(null);

  // Image Picker

  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = await DataStore.query(User);

      const authUser = await Auth.currentAuthenticatedUser();
      setUser(
        fetchedUsers.find((user) => user.id === authUser.attributes.sub) || null
      );
    };
    fetchUsers();
  }, []);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };
  const newUser = { ...user, roomId: chatRoomId };

  return (
    <View>
      <View></View>
      <View style={styles.container}>
        <Pressable onPress={pickImage}>
          <MaterialCommunityIcons
            name="image-multiple-outline"
            size={50}
            color="#404040"
            style={styles.items}
          />
        </Pressable>

        <Feather name="folder" size={50} color="#404040" style={styles.items} />

        <MaterialIcons
          name="games"
          size={50}
          color="#404040"
          style={styles.items}
        />

        <Pressable
          onPress={() =>
            navigation.navigate("FastShareRoom", { user: newUser })
          }
        >
          <MaterialCommunityIcons
            name="rocket-launch-outline"
            size={50}
            color="#404040"
            style={styles.items}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    justifyContent: "space-between",
    flexDirection: "row",
  },

  items: {
    margin: 5,
    padding: 5,
    borderRadius: 10,
    backgroundColor: "#f2f2f2",
  },
});

export default AttachSection;
