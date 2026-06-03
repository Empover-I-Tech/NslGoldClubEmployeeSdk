import { useNavigation } from '@react-navigation/native';
import { useState } from 'react'
import { useDispatch } from 'react-redux';
import { GetApiHeaders, getNetworkStatus, PostRequest } from '../NetworkUtils/NetworkUtils';
import { configs } from '../helpers/URLConstants';
import { clearAsyncStorage, DEVICE_TOKEN, EDITDATA, MOBILE_NUMBER, POPUP_SHOWN_DATE, PROFILEIMAGE, storeData, TERMS_CONDITIONS, USER_ID, USER_NAME, USERMENU, WHATSAPPCHECKED } from '../assets/Utils/Utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { updateRetailerInfoData } from '../redux/store/slices/UpdatedReatilerInfoDataSlice';
import { setUser } from '../redux/store/slices/UserSlice';
import { translate } from '../Localisation/Localisation';

const useLogout = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [loadingCount, setLoadingCount] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('');
    var realm = new Realm({ path: 'User.realm' });

    const startLoading = (msg = '') => {
        setLoadingMessage(msg);
        setLoadingCount(prev => prev + 1);
    };

    const stopLoading = () => {
        setLoadingCount(prev => Math.max(prev - 1, 0));
    };

    const loading = loadingCount > 0;

    const logout = async () => {
        const networkStatus = await getNetworkStatus();

        if (!networkStatus) return false;

        try {
            startLoading(translate('pleasewaitloggingout'));
            const url = configs.BASE_URL + configs.AUTH.LOGOUT;
            const headers = await GetApiHeaders();
            const body = {
                userId: headers.userId,
            };
            const response = await PostRequest(url, headers, body);

            if (response?.statusCode === 200) {
                await clearAsyncStorage();

                await storeData(MOBILE_NUMBER, '');
                await storeData(USER_ID, '');
                await storeData(USER_NAME, '');
                await storeData(DEVICE_TOKEN, '');
                await storeData(USERMENU, '');
                await storeData(PROFILEIMAGE, '');
                await storeData(EDITDATA, false);
                await storeData(TERMS_CONDITIONS, false);
                await storeData(WHATSAPPCHECKED, false);
                await storeData(POPUP_SHOWN_DATE, '');
                await AsyncStorage.removeItem('dontShowThisAgain');

                dispatch(updateCompanyStyles({}));
                dispatch(updateRetailerInfoData({}));
                dispatch(setUser({}));

                const complaints = realm.objects('ComplaintData');

                realm.write(() => {
                    realm.delete(complaints);
                });

                navigation.reset({
                    index: 0,
                    routes: [{ name: 'LoginNew' }],
                });

                return true;
            }

            return false;
        } catch (error) {
            console.log('Logout error:', error);
        }
        finally {
            stopLoading();
        }
    };

    return {
        logout , loading
    };
};

export default useLogout;