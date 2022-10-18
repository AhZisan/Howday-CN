import React from "react";
import { ColorSchemeName } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme, TabActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import { AntDesign } from '@expo/vector-icons';

import ProfileScreen from '../screens/ProfileScreen';
import ShareScreen from '../screens/ShareScreen';

import HomeScreen from '../screens/HomeScreen';
import Contacts from '../screens/Contacts';
import ChatRoomScreen from '../screens/ChatRoomScreen'; //////////////
import FstShrRoom from '../screens/FastShareRoom';

import ChatRoomHeader from './ChatRoomHeader';
import HomeHeader from './HomeHeader';

// import LogIn from '../screens/LogInScreen';
// import RegisterScreen from '../screens/RegisterScreen';

import { RootStackParamList } from '../types';
import LinkingConfiguration from './LinkingConfiguration';










export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator>

      {/* <Stack.Screen name="Login" component={LogIn} />
      <Stack.Screen name="Register" component={RegisterScreen} />
       */}
      <Stack.Screen
        name="ChatItems"
        component={TabNavigator}
        options={({ route }) => ({
          headerTitle: () => <HomeHeader id={route.params?.id} />,
          headerStyle: {
            backgroundColor: 'white'
          }

        })}
      />

      <Stack.Group screenOptions={{ presentation: "card", }}>
        <Stack.Screen
          name="ChatRoom"
          component={ChatRoomScreen}
          options={({ route }) => ({
            headerTitle: () => <ChatRoomHeader id={route.params?.id} />,
            headerBackTitleVisible: false,
            headerStyle: {
              backgroundColor: 'white'
            }

          })}
        />
      </Stack.Group>

      <Stack.Screen name='FastShareRoom' component={FstShrRoom} />

      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="Share" component={ShareScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Group>

    </Stack.Navigator>
  );
}






const HomeTabs = createBottomTabNavigator();

const TabNavigator = () => (

  <HomeTabs.Navigator
    screenOptions={{
      headerShown: false,
      // tabBarShowLabel: false,
      tabBarLabelStyle: { fontWeight: 'bold', fontSize: 10 },
      tabBarActiveTintColor: '#ff7e00',

      tabBarStyle: { backgroundColor: 'white' }


    }}>

    <HomeTabs.Screen
      name='Chats'
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color }) =>
          <AntDesign name="message1" size={22} color={color} />,
      }}

    />

    <HomeTabs.Screen
      name='Contacts'
      component={Contacts}
      options={{
        tabBarIcon: ({ color }) =>
          <AntDesign name="contacts" size={22} color={color} />,
      }}
    />
  </HomeTabs.Navigator>


);

