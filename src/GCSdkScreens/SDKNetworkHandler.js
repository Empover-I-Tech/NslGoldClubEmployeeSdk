import { useEffect, useState } from 'react';
import { getNetworkStatus } from '../NetworkUtils/NetworkUtils';
import NoInternetOverlay from '../Components/NoInternetOverlay';

const SDKNetworkHandler = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const checkNetwork = async () => {
      const status = await getNetworkStatus();
      setIsConnected(status);
    };

    checkNetwork();

    const interval = setInterval(checkNetwork, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NoInternetOverlay visible={!isConnected} />
  );
};

export default SDKNetworkHandler;