import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';


import GCNavigator from './GCNavigator';
import { initLocalisation } from '../Localisation/Localisation';
import store from '../redux/store/store';

const GCRoot = (props) => {

     useEffect(() => {
        initLocalisation();
    }, []);

    return (
        <Provider store={store}>
            <NavigationContainer independent={true}>
                <GCNavigator {...props} />
            </NavigationContainer>
        </Provider>
    );
};

export default GCRoot;