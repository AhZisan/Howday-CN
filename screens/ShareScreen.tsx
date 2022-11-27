import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import RNSimplePeer from "react-native-simple-peer";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  SafeAreaView,
  Image,
  Platform,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRoute } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";

export default function ShareScreen() {
  const route = useRoute();
  const user = route.params.user;
  const [modalVisible, setModalVisible] = useState(false);
  const socket = useRef();
  const peerInstance = useRef();
  const [requested, setRequested] = useState(false);
  const [sentRequest, setSentRequest] = useState(false);
  const [sending, setSending] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myUsername, setMyUsername] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [peerUsername, setPeerUsername] = useState("");
  const [peerSignal, setPeerSignal] = useState("");
  const [file, setFile] = useState(null);
  const [receivedFilePreview, setReceivedFilePreview] = useState("");

  const newUser = { ...user, roomId: null };

  const SOCKET_EVENT = {
    CONNECTED: "connected",
    DISCONNECTED: "disconnect",
    USERS_LIST: "users_list",
    REQUEST_SENT: "request_sent",
    REQUEST_ACCEPTED: "request_accepted",
    REQUEST_REJECTED: "request_rejected",
    SEND_REQUEST: "send_request",
    ACCEPT_REQUEST: "accept_request",
    REJECT_REQUEST: "reject_request",
    SERVER_FULL: "server_full",
    LEFT: "left",
  };
  const peerConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
  };
  const acceptRequest = async () => {
    setRequested(false);
    const peer = new Peer({
      initiator: false,
      trickle: false,
    });
    peer.on("signal", (data) => {
      socket.current.emit(SOCKET_EVENT.ACCEPT_REQUEST, {
        signal: data,
        to: peerUsername,
      });
    });
    peer.on("connect", () => {
      setReceiving(true);
    });
    const fileChunks = [];
    peer.on("data", async (data) => {
      if (data.toString().includes("done")) {
        const parsed = JSON.parse(data);
        // Once, all the chunks are received, combine them to form a Blob
        // setReceivedFilePreview(URL.createObjectURL(file));
        if (Platform.OS == "web") {
          const link = document.createElement("a");
          const file = new Blob(fileChunks);
          const url = URL.createObjectURL(file);
          link.setAttribute("href", url);
          link.setAttribute("download", parsed.fileName);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // const base64String = btoa(
          //   String.fromCharCode(...new Uint8Array(fileChunks))
          // );
          const callback = (downloadProgress) => {
            const progress =
              downloadProgress.totalBytesWritten /
              downloadProgress.totalBytesExpectedToWrite;
            // this.setState({
            //   downloadProgress: progress,
            // });
          };

          await FileSystem.writeAsStringAsync(
            FileSystem.documentDirectory + parsed.fileName,
            fileChunks,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );

          // const mediaResult = await MediaLibrary.saveToLibraryAsync(
          //   parsed.fileName
          // );
        }

        setReceiving(false);
      } else {
        // Keep appending various file chunks
        fileChunks.push(data);
      }
    });

    peer.signal(peerSignal);
    peerInstance.current = peer;
  };
  const rejectRequest = () => {
    socket.current.emit(SOCKET_EVENT.REJECT_REQUEST, { to: peerUsername });
    setRequested(false);
  };
  const sendRequest = (username) => {
    setLoading(true);
    setPeerUsername(username);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      config: peerConfig,
    });
    peer.on("signal", (data) => {
      socket.current.emit(SOCKET_EVENT.SEND_REQUEST, {
        to: username,
        signal: data,
        username: myUsername,
      });
      setSentRequest(true);
      setLoading(false);
    });
    peer.on("connect", async () => {
      setSending(true);
      setSentRequest(false);
      let buffer = await file.arrayBuffer();
      const chunkSize = 16 * 1024;
      while (buffer.byteLength) {
        const chunk = buffer.slice(0, chunkSize);
        buffer = buffer.slice(chunkSize, buffer.byteLength);

        // Off goes the chunk!
        peer.send(chunk);
      }
      peer.send(JSON.stringify({ done: true, fileName: file.name }));
      setSending(false);
    });
    peerInstance.current = peer;
  };
  const SERVER_URL = "http://13.214.180.155/";
  useEffect(() => {
    socket.current = io("http://13.214.180.155/", {
      transports: ["websocket"],
      extraHeaders: {
        "my-custom-header": "1234", // ignored
      },
      query: {
        name: JSON.stringify(newUser),
      },
    });

    socket.current.on(SOCKET_EVENT.CONNECTED, (username) => {
      setMyUsername(username);
    });
    socket.current.on(SOCKET_EVENT.SERVER_FULL, () => {
      if (Platform.OS == "web") {
        alert("Server is full");
      } else {
        Alert.alert("Server is full");
      }
    });
    socket.current.on(SOCKET_EVENT.USERS_LIST, (users) => {
      setUsersList(users);
      console.log(users);
    });

    socket.current.on(SOCKET_EVENT.REQUEST_SENT, ({ signal, username }) => {
      setPeerUsername(username);
      setPeerSignal(signal);
      setRequested(true);
    });
    socket.current.on(SOCKET_EVENT.REQUEST_ACCEPTED, ({ signal }) => {
      peerInstance.current.signal(signal);
    });
    socket.current.on(SOCKET_EVENT.REQUEST_REJECTED, () => {
      setSentRequest(false);
      setRejected(true);
    });

    return () => {
      socket.current.emit(SOCKET_EVENT.LEFT);
    };
  }, []);
  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      URL.revokeObjectURL(receivedFilePreview);
    },
    [receivedFilePreview]
  );

  const selectFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync();
      setFile(res.file);
      console.log(res.file);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={
          receivedFilePreview !== "" ||
          sending ||
          receiving ||
          sentRequest ||
          rejected ||
          requested
        }
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          if (!sending || !receiving || !sentRequest || !requested)
            setReceivedFilePreview("");
          setRejected(false);
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {requested && (
              <>
                {/* Share Request Modal*/}

                <Text style={styles.modalText}>
                  {peerUsername} wants to send you a file
                </Text>
                <Text style={styles.modalText}>
                  Would you like to download?
                </Text>
                <View
                  style={{
                    // display: "flex",
                    // alignItems: "center",
                    marginTop: 10,
                    justifyContent: "space-between",
                    flexDirection: "row",
                  }}
                >
                  <Pressable
                    style={styles.buttonClose}
                    onPress={() => {
                      rejectRequest();
                      setModalVisible(!modalVisible);
                    }}
                  >
                    <Text style={styles.textStyle}>Reject</Text>
                  </Pressable>
                  <Pressable style={styles.buttonOpen} onPress={acceptRequest}>
                    <Text style={{ color: "white" }}>Accept</Text>
                  </Pressable>
                </View>
              </>
            )}
            {(sending || receiving || sentRequest) && (
              <Text style={{ color: "black" }}>
                {sending
                  ? "The File is being sent, please wait..."
                  : sentRequest
                  ? "Wait till user accepts your request"
                  : "Receiving File, please wait... "}
              </Text>
            )}
            {rejected && (
              <Text style={styles.textStyle}>
                {peerUsername} Rejected your request, sorry!
              </Text>
            )}

            {receivedFilePreview && (
              <React.Fragment>
                <Text style={styles.textStyle}>
                  {peerUsername} has sent you a file
                </Text>

                {/* <Image src={receivedFilePreview} /> */}
              </React.Fragment>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.topArea}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            textTransform: "capitalize",
            ...styles.textStyle,
          }}
        >
          {myUsername}
        </Text>
        <Text style={styles.textStyle}>
          Tap on the receiver to share selected file
        </Text>
        {/* <ImageUploader setFile={setFile} /> */}
      </View>

      <View style={styles.midArea}>
        {usersList.length > 1 ? (
          usersList.map(
            ({ username, timestamp, imageUri }) =>
              username !== myUsername && (
                <Pressable
                  key={username}
                  style={[styles.button, styles.peer, styles.ShareUsers]}
                  onPress={() =>
                    !file || loading
                      ? Platform.OS == "web"
                        ? alert("Select a file")
                        : Alert.alert("Select a file")
                      : sendRequest(username)
                  }
                >
                  <Image
                    source={
                      imageUri
                        ? { uri: imageUri }
                        : require("../assets/images/avatar.png")
                    }
                    style={styles.profileImg}
                  />
                  <Text style={styles.textStyle}>{username}</Text>
                  <Ionicons
                    name="send"
                    size={22}
                    color="#ff7518"
                    style={{
                      borderWidth: 2,
                      borderRadius: 3,
                      borderColor: "#ff7518",
                      padding: 3,
                    }}
                  />
                </Pressable>
              )
          )
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              padding: 15,
            }}
          >
            <Text style={styles.textStyle}>No Users Online Right Now!</Text>
            <Text style={styles.textStyle}>
              Waiting for users to be connected...
            </Text>
          </View>
        )}
      </View>

      <View style={styles.bottomArea}>
        <Pressable
          onPress={selectFile}
          style={({ pressed }) => [
            {
              backgroundColor: pressed ? "#ff5e18" : "#ff7518",
            },
            styles.wrapperCustom,
          ]}
        >
          {!file && <AntDesign name="plus" size={22} color="white" />}
          <Text style={{ color: "white", marginLeft: 5 }}>
            {file ? file.name : "Select File"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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

  midArea: {
    flex: 1,
    // backgroundColor: 'lightgreen',
    padding: 5,
  },

  ShareUsers: {
    borderRadius: 10,
    padding: 5,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ECECEC",
    marginBottom: 4,
    shadowRadius: 4,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    shadowOpacity: 0.05,
  },

  bottomArea: {
    padding: 5,
  },

  wrapperCustom: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 6,
  },

  peer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileImg: {
    width: 40,
    height: 40,
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 20,
    borderColor: "#ff7518",
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 5,
    padding: 5,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#ff7518",
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 25,
    marginHorizontal: 8,
  },
  buttonClose: {
    backgroundColor: "#ECECEC",
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 10,
    marginHorizontal: 8,
  },

  modalText: {
    marginBottom: 5,
    textAlign: "center",
  },
});

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
