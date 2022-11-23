import { useIsFocused, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
    Text,
    Alert,
    Modal,
    View,
    StyleSheet,
    FlatList,
    SafeAreaView,
    Pressable,
    Image,
} from "react-native";
import FastShareRoomItems from "../components/FastShareRoom";
import io from "socket.io-client";
import Peer from "simple-peer";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import streamSaver from "streamsaver";

export default function FastShareFTF() {
    const route = useRoute();
    const [modalVisible, setModalVisible] = useState(false);
    const [recievedData, setRecievedData] = useState();
    const [recievedFileName, setRecievedFileName] = useState();
    const [connectionEstablished, setConnection] = useState(false);
    const [file, setFile] = useState();
    const [partnerId, setPartnerID] = useState("");
    const [gotFile, setGotFile] = useState(false);
    const name = "no-name";
    const [fileUploadName, setFileName] = useState("");
    const [usernames, setUsernames] = useState([]);
    const [notification, setNotification] = useState(false);

    const [loader, setLoader] = useState(false);
    const socketRef = useRef();
    const peersRef = useRef();
    const fileUpload = useRef();
    const peerRef = useRef();
    let screen = useRef(null);
    let roomBody = useRef(null);
    const fileNameRef = useRef("");
    let userData = {};
    const roomID = route.params.id;
    const isFocused = useIsFocused();

    useEffect(() => {
        var socket_connect = function (room) {
            return io("http://localhost:5000/", {
                transports: ["websocket"],
                extraHeaders: {
                    "my-custom-header": "1234", // ignored
                },
                query: "r_var=" + room,
            });
        };
        socketRef.current = socket_connect(roomID);
        console.log(socketRef.current);
        socketRef.current.on("server full", () => {
            alert("Server Full");
            return;
        });

        socketRef.current.emit("chat message", "hello room #" + roomID);
        socketRef.current.emit("join room", roomID);

        socketRef.current.on("all users", (id) => {
            setPartnerID(id);

            userData["name"] = roomID;
            userData["id"] = socketRef.current.id;
            console.log(userData);
            socketRef.current.emit("username", userData);

            peerRef.current = createPeer(id, socketRef.current.id);
            console.log(peerRef.current);
        });
        socketRef.current.on("getusername", (payload) => {
            setUsernames(payload);
        });

        socketRef.current.on("user joined", (payload) => {
            peerRef.current = addPeer(payload.signal, payload.callerID);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
            peerRef.current.signal(payload.signal);
            setConnection(true);
        });
        socketRef.current.on("file recieved", () => {
            setLoader(false);
        });

        socketRef.current.on("user left", (room) => {
            console.log("user left");
            if (room == roomID) {
                peersRef.current.destroy();
                setConnection(false);
            }
        });

        socketRef.current.on("room full", () => {
            alert("room is full");
        });
    }, [isFocused]);

    function createPeer(userToSignal, callerID) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            config: {
                iceServers: [
                    {
                        urls: "stun:stun.stunprotocol.org",
                    },
                    {
                        urls: "turn:numb.viagenie.ca",
                        credential: "muazkh",
                        username: "webrtc@live.com",
                    },
                ],
            },
        });

        peer.on("signal", (signal) => {
            socketRef.current.emit("sending signal", {
                userToSignal,
                callerID,
                signal,
            });
        });

        peer.on("data", handleReceivingData);
        peersRef.current = peer;

        return peer;
    }

    function addPeer(incomingSignal, callerID) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            config: {
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:global.stun.twilio.com:3478?transport=udp" },
                    { urls: "stun:stun.services.mozilla.com" },
                    //   {
                    //     urls: "turn:numb.viagenie.ca",
                    //     credential: "muazkh",
                    //     username: "webrtc@live.com",
                    //   },
                ],
            },
        });

        peer.on("signal", (signal) => {
            socketRef.current.emit("returning signal", { signal, callerID });
        });

        peer.on("data", handleReceivingData);

        peer.signal(incomingSignal);
        setConnection(true);
        peersRef.current = peer;
        return peer;
    }

    function handleReceivingData(data) {
        console.log(data);
        if (data.toString().includes("done")) {
            const parsed = JSON.parse(data);
            fileNameRef.current = parsed.fileName;
            setModalVisible(true);
        } else {
            console.log(data);
            setRecievedData(data);
        }
    }

    function createAndDownloadBlobFile() {
        const blob = new Blob([recievedData]);
        const fileName = `${fileNameRef.current}`;
        if (navigator.msSaveBlob) {
            // IE 10+
            navigator.msSaveBlob(blob, fileName);
        } else {
            const link = document.createElement("a");
            // Browsers that support HTML5 download attribute
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", fileName);
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
        socketRef.current.emit("file downloaded");
        setModalVisible(false);
    }

    function resetFile() {
        fileUpload.current.value = "";
        setFileName("");
    }

    const selectFile = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync();
            setFile(res.file);
            console.log(res.file);
        } catch (err) {
            console.log(err);
        }
    };

    const sendFile = () => {
        if (!file) {
            //   error();
            return;
        }
        const peer = peerRef.current;
        console.log(peer);
        const stream = file.stream();
        console.log(stream);
        const reader = stream.getReader();
        setLoader(true);

        reader.read().then((obj) => {
            handlereading(obj.done, obj.value);
        });

        function handlereading(done, value) {
            if (done) {
                peer.write(JSON.stringify({ done: true, fileName: file.name }));
                return;
            }

            peer.write(value);
            reader.read().then((obj) => {
                handlereading(obj.done, obj.value);
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <FastShareRoomItems id={roomID} connection={connectionEstablished} />
            {connectionEstablished ? (
                <View style={styles.connected}>
                    <View style={styles.sendContainer}>
                        <Text
                            style={{
                                textAlign: "center",
                                fontSize: 20,
                                fontWeight: "bold",
                                fontFamily: "cursive",
                                marginBottom: 50,
                                padding: 50,
                            }}
                        >
                            Your Room is connected.. Send Your file now!{" "}
                        </Text>
                    </View>
                </View>
            ) : (
                <View style={styles.connecting}>
                    {/* <Text>connecting....</Text> */}
                    <Image
                        source={require("../assets/images/wca.gif")}
                        style={styles.connectingImage}
                    />
                </View>
            )}

            <View style={styles.centeredView}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>
                                {fileNameRef.current} has recieved !!!!
                            </Text>
                            <Text style={styles.modalText}>Would you like to download?</Text>
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
                                    onPress={() => setModalVisible(!modalVisible)}
                                >
                                    <Text style={styles.textStyle}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.button, styles.buttonOpen]}
                                    onPress={() => createAndDownloadBlobFile()}
                                >
                                    <Text style={styles.textStyled}>Download</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
                {/* <Pressable
          style={[styles.button, styles.buttonOpen]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.textStyle}>Show Modal</Text>
        </Pressable> */}
            </View>

            <View
                style={{
                    backgroundColor: "white",
                    justifyContent: "flex-end",
                    height: 85,
                    padding: 7,
                }}
            >
                <Text style={{ textAlign: "center", margin: 5 }}>{file?.name}</Text>
                <View style={styles.sendButtons}>
                    <Pressable
                        onPress={selectFile}
                        style={({ pressed }) => [
                            {
                                backgroundColor: pressed ? "#ff5e18" : "#ff7518",
                            },
                            styles.wrapperCustom,
                        ]}
                    >
                        <AntDesign name="plus" size={18} color="white" />
                        <Text style={{ color: "white", marginLeft: 5 }}>Select file</Text>
                    </Pressable>
                    <Pressable
                        onPress={sendFile}
                        style={({ pressed }) => [
                            {
                                backgroundColor: pressed ? "#ff5e18" : "#ff7518",
                            },
                            styles.wrapperCustom,
                        ]}
                    >
                        <Ionicons name="send" size={18} color="white" />
                        <Text style={{ color: "white", marginLeft: 5 }}>Send file</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    connectingImage: {
        height: 200,
        width: 200,
        marginTop: 190,
        borderRadius: 100,
        opacity: 0.6,
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
        height: "100%",
        backgroundColor: "white",
    },
    connected: {
        marginTop: 90,
    },
    connecting: {
        color: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    sendContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: "80%",
    },
    sendButtons: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        padding: 3,
        height: 35,
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
        padding: 10,
        elevation: 2,
    },
    buttonOpen: {
        backgroundColor: "#ff7518",
    },
    buttonClose: {
        backgroundColor: "#EBECf0",
    },
    textStyle: {
        fontWeight: "bold",
        textAlign: "center",
    },
    textStyled: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
    },
});
