import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GCLoaderScreen from './GCLoaderScreen';
import EmployeeDashboardSDK from './EmployeeDashboardSDK';
import Location from '../Login/Location';
import WeatherScreen from '../Dashboard/WeatherScreen';
import Notifications from '../Dashboard/Notifications';

const Stack = createNativeStackNavigator();

const GCNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>

            <Stack.Screen
                name="GCLoaderScreen"
                component={GCLoaderScreen}
            />

            <Stack.Screen
                name="EmployeeDashboardSDK"
                component={EmployeeDashboardSDK}
            />

            <Stack.Screen
                name="Location"
                component={Location}
            />

            <Stack.Screen
                name="WeatherScreen"
                component={WeatherScreen}
            />

            <Stack.Screen
                name="Notifications"
                component={Notifications}
            />

        </Stack.Navigator>
    );
};

export default GCNavigator;