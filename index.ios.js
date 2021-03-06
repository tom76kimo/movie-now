/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {
  ActivityIndicatorIOS,
  AppRegistry,
  Component,
  Dimensions,
  ListView,
  StyleSheet,
  Text,
  View,
  NavigatorIOS,
} from 'react-native';

import { getFetchUrl, parseData } from './src/utils'

class TimeBoard extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const dataSource = this.generateDataSource(this.props.movieData);
    if (!dataSource) {
      return <View><Text>No data</Text></View>;
    }
    return (
      <ListView
      dataSource={dataSource}
      renderSectionHeader={this.renderSectionHeader}
      renderRow={this.renderRow}
      renderSeparator={this.renderSeparator} />
    );
  }

  generateDataSource(movieData) {
    if (!movieData || !movieData.forEach) {
      return null;
    }
    var getSectionData = (dataBlob, sectionID) => {
        return dataBlob[sectionID];
    };
    var getRowData = (dataBlob, sectionID, rowID) => {
        return dataBlob[rowID];
    };
    const ds = new ListView.DataSource({
      getRowData: getRowData,
      getSectionHeadData: getSectionData,
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });

    let dataBlob = {};
    let sectionIDs = [];
    let rowIDs = [];
    movieData.forEach((theater, theaterIndex) => {
      dataBlob['section' + theaterIndex] = theater.description;
      sectionIDs.push('section' + theaterIndex);
      let rowData = [];
      if (theater.showtimes && theater.showtimes.length) {
        theater.showtimes.forEach((time, index) => {
          dataBlob['row' + index] = time;
          rowData.push('row' + index);
        });
      }
      rowIDs[theaterIndex] = rowData;
    });
    return ds.cloneWithRowsAndSections(dataBlob, sectionIDs, rowIDs);
  }

  renderSectionHeader(sectionData: string, sectionID: string) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionText}>
          {sectionData.theaterName}
        </Text>
      </View>
    );
  }

  renderRow(rowData) {
    return (
      <View style={styles.rowView}>
        <View style={{flex: 1, justifyContent: 'center',}}><Text style={{color: '#6D00F6'}} numberOfLines={1}>{rowData.movieName.replace('&#39;', '\'')}</Text></View>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center',}}>
          <View style={{flex: 1, justifyContent: 'center'}}><Text style={{color: '#0078ff'}} numberOfLines={1}>{rowData.times[0] || '-'}</Text></View>
          <View style={{flex: 1, justifyContent: 'center'}}><Text style={{color: '#0078ff'}} numberOfLines={1}>{rowData.times[1] || '-'}</Text></View>
        </View>
      </View>
    );
  }

  renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    return (
      <View key={sectionID + rowID} style={{height: 0.5, backgroundColor: '#bbbbbb', flex: 1}}></View>
    );
  }
}

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingData: true,
      movieData: [],
      error: null,
    }
  }
  render() {
    const mainStyle = this.state.loadingData ? styles.container : styles.timeBoard;
    const timeBoardComponent = this.state.loadingData ? null : <TimeBoard movieData={this.state.movieData} />;
    const message = this.state.error ? <Text>{this.state.error}</Text> : null;
    const loadingMessage = this.state.loadingData ? <Text>努力為您讀取中</Text> : null;
    return (
      <View style={mainStyle}>
         <ActivityIndicatorIOS
          animating={this.state.loadingData}
          size="large"
          hidesWhenStopped={true} />
        {loadingMessage}
        {message}
        {timeBoardComponent}
      </View>
    );
  }
  componentDidMount() {
    const self = this;
    this.fetchLocation()
      .then((position) => {
        const location = position.coords.latitude + ',' + position.coords.longitude;
        fetch(getFetchUrl(location))
              .then((response) => {
                if (!response) {
                  return {};
                }
                return response.json();
              })
              .then((responseData) => {
                  self.setState({
                    loadingData: false,
                    movieData: parseData(responseData),
                  })
              })
              .done();
      })
      .catch(() => {
        self.setState({
          error: 'Cannot get current location'
        })
      })
  }

  fetchLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
          (initialPosition) => {
            resolve(initialPosition);
          },
          (error) => reject(error),
          {enableHighAccuracy: true, maximumAge: 1000}
      );
    });
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
  timeBoard: {
    flex: 1,
    paddingTop: 28,
    backgroundColor: '#ffffff'
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
  section: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: 6,
      backgroundColor: '#400090',
      shadowColor: "#000000",
      shadowOpacity: 0.8,
      shadowRadius: 2,
      shadowOffset: {
        height: 2,
        width: 0
      },
      opacity: 0.8,
  },
  sectionText: {
    color: '#ffffff',
    paddingHorizontal: 12,
    fontWeight: 'bold',
    fontSize: 20,
    flex: 15,
  },
  rowView: {
    flex: 1,
    flexDirection: 'row',
    height: Dimensions.get('window').height / 23,
    paddingLeft: 5,
  }
});

AppRegistry.registerComponent('MovieNow', () => MovieNow);
