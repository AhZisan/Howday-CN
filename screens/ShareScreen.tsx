import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';




export default function ShareScreen() {
  return (
        <WebView 
        style={styles.container}
        source={{ uri: 'https://snapdrop.net' }}
        />
    
  );
}

const styles = StyleSheet.create({

  container: {
        flex: 1,
        justifyContent: 'center',
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
