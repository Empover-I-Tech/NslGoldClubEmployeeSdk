import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GCLoaderScreen from './GCLoaderScreen'
import EmployeeDashboardSDK from './EmployeeDashboardSDK';
import Products from "../Products/Products";
import ProgramDetails from "../Dashboard/ProgramDetails";
import SeedCalculator from "../Dashboard/SeedCalculator";
import FertilizerCalculator from "../Dashboard/FertilizerCalculator";
import YieldCalculator from "../Dashboard/YieldCalculator"
import CropDiagonstic from "../Dashboard/CropDiagonstic";
import CropDesiesDetection from "../Dashboard/CropDesiesDetection";
import Agronomy from "../Dashboard/Agronomy";
import ProductScanner from '../QRScanner/ProductScanner';
import AdvancedKnowledgeCenter from "../Dashboard/AdvancedKnowledgeCenter";
import KnowledgeCenterPDFView from "../Dashboard/KnowledgeCenterPDFView";
import KnowledgeCenterDocsList from "../Dashboard/KnowledgeCenterDocsList";
import WeatherScreen from '../Dashboard/WeatherScreen';
import Location from '../Login/Location';
import Remedyrecommendation from "../Dashboard/Remedyrecommendation";
import EmpScanHistory from "../QRScanner/EmpScanHistory";
import EmployeeRedemptionsHistory from '../RedemptionsHistory/EmployeeRedemptionsHistory';
import HelpDesk from "../Profile/HelpDesk";
import Complaint from "../Profile/Complaint";
import MandiPricesScreen from "../Dashboard/MandiPricesScreen";
import Notifications from '../Dashboard/Notifications';


const Stack = createNativeStackNavigator();

const GCNavigator = ({ route }) => {
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