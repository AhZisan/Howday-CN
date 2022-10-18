import {
    View,
    StyleSheet,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native'

import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';

import { Auth, DataStore, Storage } from 'aws-amplify';
import { ChatRoom, Message } from '../../src/models';


import React, { useState, useEffect } from 'react'
import EmojiSelector from 'react-native-emoji-selector'
import { SimpleLineIcons, Feather, MaterialCommunityIcons, AntDesign, Ionicons } from '@expo/vector-icons';


import AttachSection from '../AttachSection';


const MessageInput = ({ chatRoom }) => {
    const [message, setMessage] = useState('');
    const [shouldShowAttach, setShouldShowAttach] = useState(false);
    const [isEmoOn, setEmoOn] = useState(false);
    const [progress, setProgress] = useState(0);

    // useEffect(() => {
    //     (async () => {
    //         if (Platform.OS !== 'web') {
    //             const libraryResponse = 
    //                 await ImagePicker.requestMediaLibraryPermissionsAsync();
    //             const photoResponse = await ImagePicker.requestCameraPermissionsAsync();

    //             if (
    //                 libraryResponse.status !== "granted" || 
    //                 photoResponse.status !== "granted"
    //                 ) {
    //                 alert("Sorry, we need camera roll permission to make this work!")
    //             }
    //         }
    //     })();
    // }, []);



    const sendMessages = async () => {
        //Send message
        const user = await Auth.currentAuthenticatedUser();
        const newMessage = await DataStore.save(new Message({
            content: message,
            userID: user.attributes.sub,
            chatroomID: chatRoom.id,
        }));

        updateLastMessage(newMessage);

        resetFields();
    };

    const updateLastMessage = async (newMessage) => {
        DataStore.save(ChatRoom.copyOf(chatRoom, updatedChatRoom => {
            updatedChatRoom.LastMessages = newMessage;
        }));
    };




    const onPlusClicked = () => {
        setShouldShowAttach(!shouldShowAttach);
        setEmoOn(false);
    };



    const OnPrs = () => {
        // console.warn(message);
        if (image) {
            sendImage();
        }
        else if (message) {
            sendMessages();
        }
        else {
            onPlusClicked();
        }
    };

    const resetFields = () => {

        setMessage('');
        setEmoOn(false);
        setShouldShowAttach(false);
        setImage(null);
        setProgress(0);
    }

    // Image Picker
    const [image, setImage] = useState<string | null>(null);


    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            aspect: [4, 3],
        })
        if (!result.cancelled) {
            setImage(result.uri);
        }
    };

    /////////////////// Image send progress ///////////////

    const progressCallback = (progress) => {
        console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
        setProgress(progress.loaded / progress.total);
    };

    /////////// uploading & send image to the S3 storage ///////////////
    const sendImage = async () => {
        if (!image) {
            return;
        }
        const blob = await getImageBlob();
        const { key } = await Storage.put(`${uuidv4()}.png`, blob, { progressCallback });

        ///////////////// send image /////////////////////////
        const user = await Auth.currentAuthenticatedUser();
        const newMessage = await DataStore.save(new Message({
            content: message,
            image: key,
            userID: user.attributes.sub,
            chatroomID: chatRoom.id,
        }));

        updateLastMessage(newMessage);

        resetFields();
    };

    const getImageBlob = async () => {
        if (!image) {
            return null;
        }
        const response = await fetch(image);
        const blob = await response.blob();
        return blob;
    }


    return (
        <KeyboardAvoidingView
            style={[styles.root, { height: isEmoOn ? "52%" : "auto" }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={95}
        >
            {image && (
                <View style={styles.sendImageContainerMain}>

                    <View style={styles.sendImageContainer}>
                        <Image source={{ uri: image }}
                            style={{ height: 100, width: 100, borderRadius: 5, margin: 5 }}
                        />

                        <Pressable onPress={() => setImage(null)}>
                            <Ionicons
                                name="close-circle-outline"
                                size={25}
                                color="black"
                            />
                        </Pressable>
                    </View>

                    <View
                        style={{
                            height: 5,
                            borderRadius: 10,
                            backgroundColor: '#ff7518',
                            width: `${progress * 100}%`,
                        }}
                    />

                </View>
            )}

            <View style={styles.row}>
                <View style={styles.inputContainer}>

                    <Pressable onPress={() => {
                        setEmoOn((currentValue) => !currentValue)
                        setShouldShowAttach(false);
                    }}>
                        <SimpleLineIcons name="emotsmile" size={24} color="#595959" style={styles.icon} />
                    </Pressable>

                    <TextInput
                        style={styles.input}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Type here....."
                    />

                    <Pressable onPress={takePhoto}>
                        <Feather
                            name="camera"
                            size={24}
                            color="#595959"
                            style={styles.icon}
                        />
                    </Pressable>

                    <MaterialCommunityIcons name="microphone-outline" size={24} color="#595959" style={styles.icon} />
                </View>

                <Pressable onPress={OnPrs} style={styles.buttonContainer}>
                    {message || image ? (
                        <Ionicons name="send" size={18} color="white" />
                    ) : (
                        <AntDesign name="plus" size={22} color="white" />
                    )}
                </Pressable>
            </View>

            {shouldShowAttach && (<AttachSection setImage={setImage} />)}

            {isEmoOn &&
                (<EmojiSelector
                    onEmojiSelected={emoji => setMessage((curentMessage) => curentMessage + emoji)}
                    columns={8}
                    showSectionTitles={false}
                    showSearchBar={false}
                    showTabs={true}
                />)
            }
        </KeyboardAvoidingView>
    )
};

const styles = StyleSheet.create({
    root: {
        padding: 10,
    },
    row: {
        flexDirection: 'row',
    },
    inputContainer: {
        backgroundColor: '#f2f2f2',
        flex: 1,
        marginRight: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#dedede',
        alignItems: 'center',
        flexDirection: 'row',
        padding: 5,
    },
    input: {
        flex: 1,
        marginHorizontal: 5,
    },
    icon: {
        marginHorizontal: 5,

    },
    buttonContainer: {
        width: 40,
        height: 40,
        backgroundColor: '#ff7518',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendImageContainer: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        justifyContent: 'space-between',

    },
    sendImageContainerMain: {
        marginVertical: 7,
        borderRadius: 5,
        backgroundColor: '#FAF9F6'
    }






});



export default MessageInput