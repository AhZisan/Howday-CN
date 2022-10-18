import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
} from "react-native";
import { Button, Input } from "@rneui/base";
import React, { useEffect, useState } from "react";
// import { Input } from '@rneui/themed';

const LogIn = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const SignIn = () => {};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Image
        source={{
          uri: "https://vectorsart.com/vectors-images/vectorsart_15220.png",
        }}
        style={{ width: 300, height: 100, borderRadius: 25 }}
      />

      <View style={styles.inputCon}>
        <Input
          placeholder="Email"
          autoFocus
          textContentType="emailAddress"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />

        <Input
          placeholder="Password"
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <Button
        color="#ff7e00"
        containerStyle={styles.button}
        onPress={SignIn}
        title="Login"
      />

      <Button
        onPress={() => navigation.navigate("Register")}
        containerStyle={styles.button}
        type="clear"
        title="Register"
      />
    </KeyboardAvoidingView>
  );
};

export default LogIn;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  inputCon: {
    width: 310,
  },
  button: {
    width: 200,
    marginTop: 10,
  },
});
