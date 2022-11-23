import { AntDesign, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Image, Modal, Pressable, Alert, TextInput } from 'react-native';
import * as DocumentPicker from "expo-document-picker";





export default function ShareScreen() {
  const [modalOn, setModalOn] = useState(true);
  const [roomID, setRoomID] = useState("");
  const [roomName, setRoomName] = useState("");
  // const [file, setFile] = useState();



  // const selectFile = async () => {
  //   try {
  //     const res = await DocumentPicker.getDocumentAsync();
  //     setFile(res.file);
  //     console.log(res.file);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };



  return (

    <SafeAreaView style={styles.container}>
      <View style={styles.connectDiv}>
        <Text style={styles.nText}>
          {roomName}
        </Text>
        <Text style={styles.cText}>
          {roomName ? "Connecting..." : "Waiting..."}
        </Text>
      </View>

      <View style={styles.middle}>
        {roomName && <Image
          source={require("../assets/images/wca.gif")}
          style={styles.connectingImage}
        />}
      </View>

      {roomName && <View style={{ padding: 8, }}>
        <Text style={{ alignSelf: 'center' }}>file name will be here</Text>
        <View style={styles.bottom}>
          <Pressable
            // onPress={selectFile}
            style={styles.bottomBtns}>
            <AntDesign name="plus" size={18} color="white" />
            <Text style={styles.btnText}>Select file</Text>
          </Pressable>

          <Pressable style={styles.bottomBtns}>
            <Ionicons name="send" size={18} color="white" />
            <Text style={styles.btnText}>Send file</Text>
          </Pressable>
        </View>

      </View>}


      <Modal
        animationType="fade"
        transparent={true}
        visible={modalOn}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalOn(!modalOn);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Create a room</Text>
            <View style={{ flexDirection: 'row' }}>
              <TextInput
                style={styles.input}
                value={roomID}
                onChangeText={setRoomID}
                placeholder="Enter room name"
              />
            </View>
            <View style={styles.buttonCon}>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  setModalOn(!modalOn)
                }}
              >
                <Text style={styles.textCL}>Close</Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.buttonCreate]}
                onPress={() => {
                  setModalOn(!modalOn)
                  setRoomName(roomID)
                }}
              >
                <Text style={styles.textCR}>Create</Text>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>





    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "white"
  },

  connectDiv: {
    margin: 5,
    padding: 5,
  },

  nText: {
    fontWeight: "bold"
  },
  cText: {
  },

  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBECf0'
  },
  connectingImage: {
    height: 200,
    width: 200,
    borderRadius: 100,
    opacity: 0.6,
  },

  bottom: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    margin: 5,
  },
  bottomBtns: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    width: '40%',
    borderRadius: 20,
    backgroundColor: "#ff7518",
  },
  btnText: {
    // fontWeight: 'bold',
    color: 'white',
    paddingLeft: 5
  },




  /////////////////////

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,

  },
  modalView: {
    width: '70%',
    margin: 20,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 250,
    elevation: 5
  },
  buttonCon: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    flex: 1,
    margin: 5,
    width: 80,
    borderRadius: 20,
    padding: 10,
  },
  buttonCreate: {
    backgroundColor: "#ff7518",
  },
  buttonClose: {
    backgroundColor: "#dedede",
  },
  textCL: {
    fontWeight: "bold",
    textAlign: "center"
  },
  textCR: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    textAlign: "center",

  },
  input: {

    flex: 1,
    margin: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dedede",
    padding: 5,
    // width: '100%'

  },













})


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   separator: {
//     marginVertical: 30,
//     height: 1,
//     width: '80%',
//   },
// });
