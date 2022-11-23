import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
  SafeAreaView,
  Image,
} from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRoute } from "@react-navigation/native";

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
  const acceptRequest = () => {
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
    peer.on("data", (data) => {
      if (data.toString().includes("done")) {
        const parsed = JSON.parse(data);
        // Once, all the chunks are received, combine them to form a Blob
        const link = document.createElement("a");

        const file = new Blob(fileChunks);
        // setReceivedFilePreview(URL.createObjectURL(file));
        const url = URL.createObjectURL(file);
        link.setAttribute("href", url);
        link.setAttribute("download", parsed.fileName);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
  const SERVER_URL = "http://localhost:5000/";
  useEffect(() => {
    socket.current = io("http://localhost:5000/", {
      transports: ["websocket"],
      extraHeaders: {
        "my-custom-header": "1234", // ignored
      },
      query: {
        name: JSON.stringify(user),
      },
    });

    socket.current.on(SOCKET_EVENT.CONNECTED, (username) => {
      setMyUsername(username);
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
    <SafeAreaView style={styles.centeredView}>
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-evenly",
                    flexDirection: "row",
                  }}
                >
                  <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => {
                      rejectRequest();
                      setModalVisible(!modalVisible);
                    }}
                  >
                    <Text style={styles.textStyle}>Reject</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.buttonOpen]}
                    onPress={acceptRequest}
                  >
                    <Text style={styles.textStyle}>Accept</Text>
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
      <View>
        <View>
          <View>
            <Text style={styles.textStyle}>{myUsername}</Text>
            <Text style={styles.textStyle}>
              Share your username with your friend
            </Text>
            {/* <ImageUploader setFile={setFile} /> */}

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
          <View>
            {usersList.length > 1 ? (
              usersList.map(
                ({ username, timestamp, imageUri }) =>
                  username !== myUsername && (
                    <Pressable
                      key={username}
                      style={[styles.button, styles.peer, styles.buttonClose]}
                      onPress={() =>
                        !file || loading
                          ? Alert.alert("Select a file")
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
                        size={18}
                        color="white"
                        style={{
                          borderWidth: 2,
                          borderRadius: 3,
                          borderColor: "#fff",
                          padding: 3,
                        }}
                      />
                    </Pressable>
                  )
              )
            ) : (
              <Text style={styles.textStyle}>
                No Users Online Right Now! Wait till someone connects to start
                sharing
              </Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  wrapperCustom: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderRadius: 8,
    padding: 6,
  },
  container: {
    flex: 1,

    backgroundColor: "white",
  },

  connectDiv: {
    margin: 5,
    padding: 5,
    backgroundColor: "lightblue",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
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
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    color: "red",
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
