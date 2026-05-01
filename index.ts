import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import { AppRegistry } from 'react-native';

/**
 * Workaround: Fabric + native stack can send sheet props to RCTView and crash
 * (setSheetLargestUndimmedDetent). Disabling native screens avoids that path.
 */
enableScreens(false);

const App = require('./App').default;

AppRegistry.registerComponent('OrtakHesap', () => App);
