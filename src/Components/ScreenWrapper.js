import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { selectUser } from '../redux/store/slices/UserSlice';
import NoInternetOverlay from './NoInternetOverlay';

const ScreenWrapper = ({ children, style }) => {
  const companyStyle = useSelector(getCompanyStyles);
  const dynamicStyles = companyStyle?.value;

  const networkState = useSelector(state => state.networkStatus);

  const isConnected =
    typeof networkState?.value === 'boolean'
      ? networkState.value
      : networkState?.value?.isConnected;

  const selectedUser = useSelector(selectUser);

  const isEmployee =
    selectedUser &&
    selectedUser?.roleName !== 'Retailer' &&
    selectedUser?.roleName !== 'Distributor';

  console.log('selectedUser =>', selectedUser?.roleName);
  console.log('networkState =>', networkState);
  console.log('isConnected =>', isConnected);
  console.log('isEmployee =>', isEmployee);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView
        edges={['top']}
        style={{
          backgroundColor: dynamicStyles?.primaryColor || '#fff',
        }}
      />

      <View style={[{ flex: 1, backgroundColor: '#fff' }, style]}>
        {children}

        {isEmployee && <NoInternetOverlay visible={!isConnected} />}
      </View>

      <SafeAreaView
        edges={['bottom']}
        style={{ backgroundColor: '#fff' }}
      />
    </View>
  );
};

export default ScreenWrapper;