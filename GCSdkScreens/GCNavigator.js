import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GCLoaderScreen from './GCLoaderScreen'
import EmployeeDashboardSDK from './EmployeeDashboardSDK';
import Products from "../src/Products/Products";
import ProgramDetails from "../src/Dashboard/ProgramDetails";
import SeedCalculator from "../src/Dashboard/SeedCalculator";
import FertilizerCalculator from "../src/Dashboard/FertilizerCalculator";
import YieldCalculator from "../src/Dashboard/YieldCalculator"
import CropDiagonstic from "../src/Dashboard/CropDiagonstic";
import CropDesiesDetection from "../src/Dashboard/CropDesiesDetection";
import Agronomy from "../src/Dashboard/Agronomy";
import ProductScanner from '../src/QRScanner/ProductScanner';
import AdvancedKnowledgeCenter from "../src/Dashboard/AdvancedKnowledgeCenter";
import KnowledgeCenterPDFView from "../src/Dashboard/KnowledgeCenterPDFView";
import KnowledgeCenterDocsList from "../src/Dashboard/KnowledgeCenterDocsList";
import WeatherScreen from '../src/Dashboard/WeatherScreen';
import Location from '../src/Login/Location';
import Remedyrecommendation from "../src/Dashboard/Remedyrecommendation";
import EmpScanHistory from "../src/QRScanner/EmpScanHistory";
import EmployeeRedemptionsHistory from '../src/RedemptionsHistory/EmployeeRedemptionsHistory';
import HelpDesk from "../src/Profile/HelpDesk";
import Complaint from "../src/Profile/Complaint";
import MandiPricesScreen from "../src/Dashboard/MandiPricesScreen";
import Notifications from '../src/Dashboard/Notifications';


const Stack = createNativeStackNavigator();

const GCNavigator = ({onSDKClose, route }) => {
    console.log("route====>", JSON.stringify(route))
    const sdkConfig = route?.params?.navigateItem;

    const screens = {
        EmployeeDashboardSDK,
        Products,
        ProgramDetails,
        SeedCalculator,
        FertilizerCalculator,
        YieldCalculator,
        CropDiagonstic,
        CropDesiesDetection,
        Agronomy,
        ProductScanner,
        AdvancedKnowledgeCenter,
        KnowledgeCenterPDFView,
        KnowledgeCenterDocsList,
        WeatherScreen,
        Location,
        Remedyrecommendation,
        EmpScanHistory,
        EmployeeRedemptionsHistory,
        HelpDesk,
        Complaint,
        MandiPricesScreen,
        Notifications
    };

    return (
        <Stack.Navigator
            initialRouteName="GCLoaderScreen"
            screenOptions={{ headerShown: false }}
        >
            <Stack.Screen
                name="GCLoaderScreen"
                component={GCLoaderScreen}
                initialParams={{
                    navigateItem: sdkConfig,
                    onSDKClose: onSDKClose
                }}
            />

            {Object.entries(screens).map(([name, component]) => (
                <Stack.Screen
                    key={name}
                    name={name}
                    component={component}
                />
            ))}
        </Stack.Navigator>
    );
};

export default GCNavigator;