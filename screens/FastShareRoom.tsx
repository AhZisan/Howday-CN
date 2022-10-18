import React from 'react';
import Rect from 'react';
import { Text, View, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import FastShareRoomItems from '../components/FastShareRoom';


export default function FastShareFTF() {
    return(
        <SafeAreaView style={styles.container}>
            <FastShareRoomItems />
            

        </SafeAreaView>


  )
}

const styles = StyleSheet.create({
    container: {

    }


})