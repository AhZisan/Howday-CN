import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'



const FastShareRoomTop = () => {
        

  return (
    <View style={styles.info}>
        <Image source={{ 
            uri: 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/vadim.jpg'}} style={styles.image} />
        
        <View style={styles.rightConteiner}>
            <View style={styles.row}>
                <Text numberOfLines={1} style={styles.name}>User Name </Text>

            </View>
            
            <Text style={styles.conStatus}>connected</Text>
        </View>
        <View style={{justifyContent: 'center'}}>
          <Text> speed</Text>
        </View>
    </View>
  )
}



const styles = StyleSheet.create({

    info: {
        height: 60,
        backgroundColor: 'white',
        flexDirection: 'row',
        padding: 5
        

    },
    image: {
        height: 50,
        width: 50,
        borderRadius: 30,
        marginRight: 10,
      
      },
      rightConteiner: {
        flex: 1,
        justifyContent: 'center',
        
      },

      row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },

      name: {
        fontSize: 15,
        fontWeight: 'bold',
        
        

      },
      conStatus: {
        fontStyle: 'italic',
        fontSize: 14,
      }

})




export default FastShareRoomTop






