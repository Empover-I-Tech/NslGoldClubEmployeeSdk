// SDKNetworkHandler.js

import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';

const SDKNetworkHandler = () => {
  const networkState = useSelector(state => state.networkStatus);

  const isConnected =
    typeof networkState?.value === 'boolean'
      ? networkState.value
      : networkState?.value?.isConnected;

  const alertShown = useRef(false);

  useEffect(() => {
    if (isConnected === false && !alertShown.current) {
      alertShown.current = true;

      Alert.alert(
        'No Internet',
        'Please check your internet connection.',
        [
          {
            text: 'OK',
            onPress: () => {
              alertShown.current = false;
            },
          },
        ],
        { cancelable: false },
      );
    }

    if (isConnected === true) {
      alertShown.current = false;
    }
  }, [isConnected]);

  return null;
};

export default SDKNetworkHandler;