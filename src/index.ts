import { LogBox } from 'react-native';
import { registerRootComponent } from 'expo';

import App from './App';

// Suppress SafeAreaView deprecation warning - configure before any components load
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  /SafeAreaView has been deprecated/,
]);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
