import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Image, Text, Platform, useWindowDimensions, Pressable } from "react-native";

import { Auth, DataStore } from 'aws-amplify';
import { User } from '../src/models';


const HomeHeader = ({ id, children }) => {

    const { width } = useWindowDimensions();
    const navigation = useNavigation();

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const fetchedUsers = (await DataStore.query(User))

            const authUser = await Auth.currentAuthenticatedUser();
            setUser(fetchedUsers.find(user => user.id === authUser.attributes.sub) || null);
        };
        fetchUsers();
    }, []);

    return (

        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginRight: 62,
            width,

        }}>
            <Pressable
                onPress={() => navigation.navigate('Profile')}>
                <Image
                    source={user?.imageUri ? { uri: user?.imageUri } : require('../assets/images/avatar.png')}
                    style={{
                        width: 37,
                        height: 37,
                        borderRadius: 20,
                        marginLeft: 8,
                        marginBottom: Platform.OS === "ios" ? 5 : undefined,
                        borderWidth: 2,
                        borderColor: '#ff7518',
                    }}
                />
            </Pressable>

            <Text
                style={{
                    flex: 1,
                    textAlign: 'center',
                    marginLeft: 35,
                    fontWeight: 'bold',
                    fontSize: 18
                }}>Howdy</Text>

            <Feather name="search" size={25} color="black" />

            <Pressable
                onPress={() => navigation.navigate('Share')}
                style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                })}>

                <MaterialIcons
                    name="wifi-tethering"
                    size={28} color="black"
                    style={{ marginHorizontal: 13 }}
                />
            </Pressable>
        </View>
    )
};


export default HomeHeader;