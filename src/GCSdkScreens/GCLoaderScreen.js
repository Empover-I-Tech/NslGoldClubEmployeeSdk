import { useEffect, useState } from 'react';
import { Alert } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import { changeLanguage, translate } from '../Localisation/Localisation';
import { useNavigation } from '@react-navigation/native';
import { configs, HTTP_OK, setEnvironment } from '../helpers/URLConstants';
import { GetApiHeaders, getNetworkStatus, PostRequest } from '../NetworkUtils/NetworkUtils';
import CustomLoader from '../Components/CustomLoader';
import { setUser } from '../redux/store/slices/UserSlice';
import { DEVICE_TOKEN, LOGINONCE, MOBILE_NUMBER, PROFILEIMAGE, ROLEID, ROLENAME, SELECTEDCOMPANY, USERMENU, USER_ID, USER_NAME, downloadFileToLocal, storeData, SDK_AUTH_ID, SDK_AUTH_TOKEN, NAVIGATE_TO_CLASS, FCM_TOKEN } from '../assets/Utils/Utils';
import { updateCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import SimpleToast from 'react-native-simple-toast';
import { Colors } from '../assets/Utils/Color';


const GCLoaderScreen = ({ route }) => {
    console.log("GCLoaderScreen route params:", route?.params);
    const mobileNumber = route?.params?.navigateItem?.mobileNumber
    const fcmToken = route?.params?.navigateItem?.fcmToken
    const buildEnvironment = route?.params?.navigateItem?.buildEnvironment
    const languageCode = route?.params?.navigateItem?.languageCode
    const authId = route?.params?.navigateItem?.authId
    const authToken = route?.params?.navigateItem?.authToken
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
    const navigation = useNavigation()
    const [loadingCount, setLoadingCount] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('');

    const onSDKClose = route?.params?.onSDKClose;

    const startLoading = (msg = '') => {
        setLoadingMessage(msg);
        setLoadingCount(prev => prev + 1);
    };

    const stopLoading = () => {
        setLoadingCount(prev => Math.max(prev - 1, 0));
    };


    const dispatch = useDispatch();

    const loading = loadingCount > 0;

    useEffect(() => {
        initializeSDK();
    }, [route?.params]);

    const initializeSDK = async () => {
        try {
            if (!route?.params) return;

            console.log('Initializing SDK...');

            await changeLanguage(languageCode || 'en');

            setEnvironment(buildEnvironment || 'PROD');

            await storeAuthData();

            await verifyOTPApiCall();

        } catch (error) {
            console.log('initializeSDK error:', error);
        }
    };

    const verifyOTPApiCall = async () => {
        const networkStatus = await getNetworkStatus();
        if (networkStatus) {
            try {
                startLoading(translate('loading'));

                var getloginURL = configs.BASE_URL + configs.AUTH.VALIDATE_SDK_LOGIN;
                var getHeaders = await GetApiHeaders();
                var dataList = {
                    "mobileNumber": mobileNumber,
                }
                var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
                if (APIResponse != undefined && APIResponse != null) {

                    if (APIResponse?.statusCode === HTTP_OK) {
                        var verifyOTPResponse = APIResponse?.response;
                        if (verifyOTPResponse != undefined && verifyOTPResponse != null && verifyOTPResponse.length > 0) {
                            dispatch(setUser(verifyOTPResponse[0]))
                            storeData(USER_ID, verifyOTPResponse[0].id);
                            storeData(USER_NAME, verifyOTPResponse[0].roleName == 'Retailer' ? verifyOTPResponse[0].proprietorName : verifyOTPResponse[0].name);
                            storeData(MOBILE_NUMBER, verifyOTPResponse[0].mobileNumber);
                            storeData(DEVICE_TOKEN, "");
                            storeData(LOGINONCE, true)
                            storeData(USERMENU, verifyOTPResponse[0].userMenuControl);
                            storeData(PROFILEIMAGE, verifyOTPResponse[0].profilePic)
                            storeData(ROLEID, verifyOTPResponse[0].roleId);
                            storeData(ROLENAME, verifyOTPResponse[0].roleName)
                            storeData(SELECTEDCOMPANY, verifyOTPResponse[0].companyLogoPath);

                            const tempSlectedObject = {};
                            tempSlectedObject.primaryColor = (verifyOTPResponse[0]?.primaryColor != undefined && verifyOTPResponse[0]?.primaryColor != "") ? verifyOTPResponse[0]?.primaryColor : Colors.buttonColorPurple;
                            tempSlectedObject.secondaryColor = (verifyOTPResponse[0]?.secondaryColor != undefined && verifyOTPResponse[0]?.secondaryColor != "") ? verifyOTPResponse[0]?.secondaryColor : Colors.white;
                            tempSlectedObject.textColor = (verifyOTPResponse[0]?.textColor != undefined && verifyOTPResponse[0]?.textColor != "") ? verifyOTPResponse[0]?.textColor : Colors.black;
                            tempSlectedObject.disableColor = (verifyOTPResponse[0]?.disableColor != undefined && verifyOTPResponse[0]?.disableColor != "") ? verifyOTPResponse[0]?.disableColor : Colors.lightgrey;
                            tempSlectedObject.iconPrimaryColor = (verifyOTPResponse[0]?.iconPrimaryColor != undefined && verifyOTPResponse[0]?.iconPrimaryColor != "") ? verifyOTPResponse[0]?.iconPrimaryColor : Colors.buttonColorPurple;
                            if (verifyOTPResponse[0].loaderPath !== null && verifyOTPResponse[0].loaderPath !== "" && verifyOTPResponse[0].loaderPath !== undefined) {
                                const filePath = await downloadFileToLocal(verifyOTPResponse[0]?.loaderPath, verifyOTPResponse[0]?.loaderPath?.split('/').pop())
                                tempSlectedObject.loaderPath = filePath != undefined && filePath != null && filePath != "" ? filePath : ""
                            } else {
                                tempSlectedObject.loaderPath = ''
                            }
                            if (tempSlectedObject) {
                                if (tempSlectedObject != undefined) {
                                    setTimeout(() => {
                                        dispatch(updateCompanyStyles(tempSlectedObject))
                                    }, 1500)
                                }
                            }
                            let navigateTo = (verifyOTPResponse[0]?.roleName === 'Retailer' || verifyOTPResponse[0]?.roleName === 'Distributor') ? 'RetailerDashboard' : 'EmployeeDashboardSDK';
                            storeData(NAVIGATE_TO_CLASS, navigateTo)
                            navigation.replace(navigateTo, { userData: {} })


                        } else {
                            setTimeout(() => {
                                SimpleToast.show(translate('something_went_wrong'));
                            }, 500);
                        }
                    }
                    else {
                        Alert.alert(
                            translate('alert'),
                            APIResponse?.message || translate('something_went_wrong'),
                            [
                                {
                                    text: translate('ok'),
                                    onPress: () => {
                                        if (onSDKClose) {
                                            onSDKClose();
                                        } else if (navigation.canGoBack()) {
                                            navigation.goBack();
                                        }
                                    }
                                }
                            ]
                        );
                    }
                }
            }
            catch (error) {
                console.log(error)
            }
            finally {
                stopLoading();
            }
        } else {
            SimpleToast.show(translate('no_internet_conneccted'))
        }

    }

    const storeAuthData = async () => {
        try {
            await storeData(SDK_AUTH_TOKEN, authToken || '');
            await storeData(SDK_AUTH_ID, authId || '');
            await storeData(FCM_TOKEN, fcmToken || '')
            console.log("Auth data stored successfully:", { authId, authToken });
        } catch (error) {
            console.error("Error storing auth data:", error);
        }
    }

    return loading ? (
        <CustomLoader
            loading={loading}
            message={loadingMessage}
            loaderImage={loaderImage}
        />
    ) : null;


}

export default GCLoaderScreen