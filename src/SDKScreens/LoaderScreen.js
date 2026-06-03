import { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';


const LoaderScreen = ({ route }) => {
    console.log("LoaderScreen route params:", route?.params);
    const mobileNumber = route?.params?.navigateItem?.mobileNumber
    const fcmToken = route?.params?.navigateItem?.fcmToken
    const buildType = route?.params?.navigateItem?.buildType
    const languageCode = route?.params?.navigateItem?.languageCode
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))



    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black' }}>{route?.params?.navigateItem?.mobileNumber || "Hello World"}</Text>
        </View>
    )


}

export default LoaderScreen