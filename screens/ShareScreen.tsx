import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';




export default function ShareScreen() {
  return (

    <SafeAreaView style={styles.container}>
      <View style={styles.connectDiv}>
        <Text>
          name
        </Text>
        <Text>
          name
        </Text>
      </View>

      <View style={styles.middle}>
        <Text>
          name
        </Text>
      </View>

      <View style={styles.bottomb}>
        <Text>Btoom</Text>
      </View>

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
    backgroundColor: "lightblue"
  },
  middle: {
    flex: 1,

  },
  bottomb: {
    backgroundColor: "lightblue",
    margin: 5,
    padding: 5,

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
