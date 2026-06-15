import React, { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import {
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import GCNavigator from './GCNavigator';
import SDKNetworkHandler from './SDKNetworkHandler';
import { initLocalisation } from '../src/Localisation/Localisation';
import store from '../src/redux/store/store';
import { getCompanyStyles } from '../src//redux/store/slices/CompanyStyleSlice';

const RootContent = (props) => {
  const companyStyle = useSelector(getCompanyStyles);
  const dynamicStyles = companyStyle?.value;
  const onSDKClose = props?.route?.params?.onSDKClose;
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={{
        flex: 1,
        backgroundColor: dynamicStyles?.primaryColor || '#ffffff',
      }}
    >
      <NavigationIndependentTree>
        <NavigationContainer>
          <SDKNetworkHandler />
          <GCNavigator {...props} 
          onSDKClose={onSDKClose}/>
        </NavigationContainer>
      </NavigationIndependentTree>
    </SafeAreaView>
  );
};

const GCRoot = (props) => {
  useEffect(() => {
    initLocalisation();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootContent {...props} />
      </SafeAreaProvider>
    </Provider>
  );
};

export default GCRoot;