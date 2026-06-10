import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { getNetworkStatus } from '../NetworkUtils/NetworkUtils';

const SDKNetworkHandler = () => {
  const [isConnected, setIsConnected] = useState(true);
  const alertShown = useRef(false);

  useEffect(() => {
    const checkNetwork = async () => {
      const status = await getNetworkStatus();
      setIsConnected(status);
    };

    checkNetwork();

    const interval = setInterval(checkNetwork, 3000);

    return () => clearInterval(interval);
  }, []);

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