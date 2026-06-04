import { use, useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import { changeLanguage } from '../Localisation/Localisation';
import { useNavigation } from '@react-navigation/native';
import { setEnvironment } from '../helpers/URLConstants';


const GCLoaderScreen = ({ route }) => {
    console.log("GCLoaderScreen route params:", route?.params);
    const mobileNumber = route?.params?.navigateItem?.mobileNumber
    const fcmToken = route?.params?.navigateItem?.fcmToken
    const buildEnvironment = route?.params?.navigateItem?.buildEnvironment
    const languageCode = route?.params?.navigateItem?.languageCode
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
    const navigation = useNavigation()


    useEffect(() => {
        console.log("GCLoaderScreen useEffect triggered with route params:", route?.params);
        if (route?.params !== undefined) {
            Alert.alert("GCLoaderScreen", `Received params: ${JSON.stringify(route.params)}`);
            changeLanguage(languageCode || 'en')
            setEnvironment(buildEnvironment || 'PROD');
            // navigation.navigate('EmployeeDashboardSDK')
            navigation.navigate('LoginNew')
        }

    }, [route?.params])



    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>{route?.params?.navigateItem?.mobileNumber || "Hello World"}</Text>
        </View>
    )


}

export default GCLoaderScreen