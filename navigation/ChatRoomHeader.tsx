import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Image, Text, Platform, useWindowDimensions } from "react-native";

import { Auth, DataStore } from 'aws-amplify';
import { ChatRoomUser, User } from '../src/models';



const ChatRoomHeader = ({ id, children }) => {

    const { width } = useWindowDimensions();
    const navigation = useNavigation();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (!id) {
            return;
        }

        const fetchUsers = async () => {
            const fetchedUsers = (await DataStore.query(ChatRoomUser))
                .filter(chatRoomUser => chatRoomUser.chatRoom.id === id)
                .map(chatRoomUser => chatRoomUser.user);


            const authUser = await Auth.currentAuthenticatedUser();
            setUser(fetchedUsers.find(user => user.id !== authUser.attributes.sub) || null);
        };
        fetchUsers();
    }, []);



    return (

        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginRight: 65,
            width: -50,


        }}>
            <Image
                source={user?.imageUri ? { uri: user?.imageUri } : require('../assets/images/avatar.png')}
                style={{
                    width: 35,
                    height: 35,
                    borderRadius: 20,
                    marginLeft: Platform.OS === "android" ? -20 : 5,
                    borderWidth: 2,
                    borderColor: '#ff7518',
                }}
            />
            <Text style={{ flex: 1, marginLeft: 12, fontWeight: 'bold', fontSize: 18 }}>
                {user?.name}
            </Text>

            <Feather name="video" size={24} color="black" style={{ marginRight: 10 }} />
            <Ionicons name="ios-call-outline" size={24} color="black" style={{ margin: 5 }} />
            <MaterialCommunityIcons name="dots-vertical" size={24} color="black" style={{ marginRight: Platform.OS === "android" ? 13 : -5 }} />

        </View>
    )
};

export default ChatRoomHeader;