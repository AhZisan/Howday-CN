import { StyleSheet } from 'react-native';



const styles = StyleSheet.create({
    container: {
      flexDirection:'row',
      padding: 10,
    },
    image: {
      height: 55,
      width: 55,
      borderRadius: 30,
      marginRight: 10,
    },
    badgeContainer:{
      backgroundColor: '#ff7518',  //#3777f0
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      left: 50,
      top: 11,
    },
    badgeText:{
      color: 'white',
      fontSize: 13,
  
    },
    rightConteiner: {
      flex: 1,
      justifyContent: 'center',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    name:{
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 3,
  
    },
    text: {
      
      color: 'gray',
    }
    
  
  })
  

  export default styles;