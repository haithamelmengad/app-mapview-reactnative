import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ListView,
  Alert,
  Button,
  RefreshControl,
  AsyncStorage,
  
} from 'react-native';
import { MapView, Location, Permissions  } from 'expo';
import { StackNavigator } from 'react-navigation';


//Screens
class LoginScreen extends React.Component {
  constructor(){
    super();
    this.state={
      username: '',
      password: ''
    }
  }
  static navigationOptions = {
    title: 'Login'
  };

  press() {
    // console.log('this is username: ', this.state.username);
    // console.log('this is password: ', this.state.password);
    AsyncStorage.setItem('user', JSON.stringify({
    username: this.state.username,
    password: this.state.password  
    })).
    then(()=>
    fetch('https://hohoho-backend.herokuapp.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })).
    then(response => response.json()).
    then((responseJSON) => {
      // console.log(responseJSON);
      responseJSON.success? this.props.navigation.navigate('Users'):Alert.alert('Fail', 'Login unsuccessful',
      [{text: 'Try Again', onPress: () => this.props.navigation.navigate('Login')}])
    }).
    catch(err => 'This is the error: ' + err)   
  }

  register() {
    this.props.navigation.navigate('Register');
  }

  componentDidMount(){
    AsyncStorage.getItem('user').
    then((userJSON) =>{ 
    let user = JSON.parse(userJSON);
    if(user.username && user.password){
      this.setState({
        username : user.username,
        password: user.password
      })
      }
    }).
    then(() => this.press()).
    catch(err => 'This is your error '+ err)
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.textBig}>Login to HoHoHo!</Text>
        <TextInput style={{}}
        placeholder='Enter username'
        onChangeText={(text)=> this.setState({username : text})} />
        <TextInput style={{}}
        placeholder='Enter password'
        secureTextEntry={true}
        onChangeText={(text)=> this.setState({password : text})} />
        <TouchableOpacity onPress={ () => {this.press()} } style={[styles.button, styles.buttonGreen]}>
          <Text style={styles.buttonLabel}>Tap to Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={ () => {this.register()} }>
          <Text style={styles.buttonLabel}>Tap to Register</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

class RegisterScreen extends React.Component {
  constructor(){
    super();
    this.state ={
      username: '',
      password: ''

    }
  }
  static navigationOptions = {
    title: 'Register'
  };
  
  submit(){
    // console.log('this is username: ', this.state.username);
    // console.log('this is password: ', this.state.password);
    fetch('https://hohoho-backend.herokuapp.com/register',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password
        })
    }).
    then((response) => response.json()).
    then((responseJSON) => {
      // console.log(responseJSON)
      responseJSON.success?this.props.navigation.goBack():Alert.alert('Fail', 'Registration unsuccessful',[{text:'Try Again', onPress:() => this.props.navigation.navigate('Register')}] )
    }).
    catch( err => 'This is the error: ' + err) 
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput style={{height: 40}}
        placeholder="Enter your username"
        onChangeText={(text) => this.setState({username: text})}/>
        <TextInput style={{height: 40}}
        placeholder="Enter a password"
        secureTextEntry={true}
        onChangeText={(text) => this.setState({password: text})}/>
        <TouchableOpacity onPress={() => this.submit() } style={styles.buttonRed}><Text style={styles.textBig}>Register</Text></TouchableOpacity>
      </View>
    )
  }
}


class UsersScreen extends React.Component{
  
  constructor(props){
    super(props)
    const ds = new ListView.DataSource({
      rowHasChanged: ((r1, r2) => r1 !== r2)
    });
    this.state= {
      dataSource: ds
    }
  }

  static navigationOptions = (props) => ({
    title: 'Users',
    headerRight: <TouchableOpacity onPress={() => props.navigation.navigate('Messages')}><Text>Messages</Text></TouchableOpacity>
   })

  componentDidMount(){
    fetch('https://hohoho-backend.herokuapp.com/users').
    then((response) => response.json()).
    then(responseJSON => {
      if(!responseJSON.success){
        Alert.alert('Fail', 'Error loading users', [{text: 'Go to login page', onPress:()=> this.props.navigation.navigate('Login')}])
      } else {
        
        // console.log(responseJSON.users)
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseJSON.users)
        })
      }
    }).
    catch( err => 'This is the error: ' + err)
  }

  touchUser(user){
    fetch('https://hohoho-backend.herokuapp.com/messages',{
    method: 'POST',
    headers:{
      "Content-Type": "application/json",
    },
    body:JSON.stringify({
      to: user._id
    })
    }).
    then(responseJSON => responseJSON.json()).
    then(response => response.success?Alert.alert('Success', 'You sent a HoHoHo to' + user.username, [{text: 'Lame', onPress:()=>this.props.navigation.navigate('Users')}]):Alert.alert('Fail', 'Your HoHoHo was lost in the dark', [{text: 'Never Back Down', onPress:()=>this.props.navigation.navigate('Users')}]) )
  }

  sendLocation(user){
    let locationData = {};
    navigator.geolocation.getCurrentPosition((success) => {locationData.latitude = success.coords.latitude;
    locationData.longitude=success.coords.longitude;
    // console.log(locationData);
    fetch('https://hohoho-backend.herokuapp.com/messages', {
      method: 'POST',
      headers:{
        "Content-Type": "application/json",
      },
      body:JSON.stringify({
        to:user._id,
        location: locationData
      })
    }).
    then(responseJSON => responseJSON.json()).
    then((response) => {
      // console.log(response);
      response.success ? Alert.alert('Success', 'Sent your location to ' + user.username, [{text: 'Tell other people where you are', onPress: ()=>this.props.navigation.navigate('Users')}]): Alert.alert('Fail', 'Could not send your location to ' + user.username, [{text: 'Go back to users', onPress: ()=>this.props.navigation.navigate('Users')}])}).
    catch(err => 'This is your error ' + err)
    },
    (error) => { 'This is your error ' + error.code + error.message
    })
     
  }

  render(){
    // console.log(this.state.dataSource)
    return(
    <View style={{flex:1, marginTop: 10, alignItems: 'center'}}>
    <ListView 
    dataSource={this.state.dataSource}
    renderRow={(rowData) =><TouchableOpacity style={{height: 30, marginBottom: 5, marginBottom: 5}} onPress={() => this.touchUser.bind(this, rowData)} onLongPress={this.sendLocation.bind(this, rowData)} delayLongPress={1500}><Text style={{fontSize: 20}}>{rowData.username}</Text></TouchableOpacity>}
    />
    </View>
    )
  }

}

class MessagesScreen extends React.Component{

  constructor(props){
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1,r2) => r1 !== r2
    })
    this.state = {
      dataSource: ds,
      currentLocation: {longitude: 0,
      latitude: 0},
      refreshing: false
    }
  }

  static navigationOptions ={
   title: 'Messages'
  }

  fetchData(){
    fetch('https://hohoho-backend.herokuapp.com/messages').
    then(response => response.json()).
    then((responseJSON) => {
    if(!responseJSON.success){
      Alert.alert('Fail', 'Error loading messages', [{text: 'Go to users', onPress:()=> this.props.navigation.navigate('Users')}])
    } else {
     this.setState({
       dataSource: this.state.dataSource.cloneWithRows(responseJSON.messages),
       refreshing: false
     }) 
    }
    }).
    catch( err => 'This is your error ' + err)
  }
  componentDidMount(){
    this.getCurrentLocation();
    this.fetchData()
    
  }

  _onRefresh() {
    this.setState({refreshing:true});
    this.fetchData()
  }

  getCurrentLocation= async() =>{
    let currentLocation = {};
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      Alert.alert('Fail', 'Error getting location', [{text: 'Go to user', onPress:()=> this.props.navigation.navigate('Users')}])
    }
    let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
    currentLocation.longitude = location.coords.longitude;
    currentLocation.latitude = location.coords.latitude;
    this.setState({
      currentLocation: currentLocation
    })
  }

  render(){
    // console.log(this.state.dataSource);
    return(
      <View style={styles.container}>
      <ListView
      refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />
        }
      dataSource={this.state.dataSource}
      renderRow={(rowData) => (<View style={styles.containerFull}><Text>From: {rowData.from.username}</Text>
       <Text>To: {rowData.to.username}</Text>
       <Text>On the: {rowData.timestamp}</Text> 
       <View style = {{height: 100}}>
        {rowData.location && 
        (<MapView
          region={{
            latitude: rowData.location.latitude,
            longitude: rowData.location.longitude,
            latitudeDelta: 1,
            longitudeDelta: 1
          }}
          style={styles.map}
          >
           <MapView.Marker
            coordinate={this.state.currentLocation}
            title={'Where u at now'}
            />
          </MapView>)
        }
      </View>
    </View>)}
      />
      </View>
    )
  }
}

//Navigator
export default StackNavigator({
  Login: {
    screen: LoginScreen,
  },
  Register: {
    screen: RegisterScreen,
  },
  Users: {
    screen: UsersScreen,
  },
  Messages: {
    screen: MessagesScreen
  },
}, {initialRouteName: 'Login'});


//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  containerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  textBig: {
    fontSize: 36,
    textAlign: 'center',
    margin: 10,
  },
  button: {
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5
  },
  buttonRed: {
    backgroundColor: '#FF585B',
  },
  buttonBlue: {
    backgroundColor: '#0074D9',
  },
  buttonGreen: {
    backgroundColor: '#2ECC40'
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white'
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});
