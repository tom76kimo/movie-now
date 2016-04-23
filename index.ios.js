/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {
  ActivityIndicatorIOS,
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  View,
  NavigatorIOS,
} from 'react-native';

class MainPage extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicatorIOS
          animating={true}
          size="large" />
      </View>
    );
  }
}

class MovieNow extends Component {
  render() {
    return (
      <NavigatorIOS
        style={{
          flex: 1,
        }}
        initialRoute={{
          title: 'Movie Now',
          component: MainPage,
        }} />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

AppRegistry.registerComponent('MovieNow', () => MovieNow);
