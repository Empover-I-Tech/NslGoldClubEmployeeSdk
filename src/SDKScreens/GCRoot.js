import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import GCNavigator from './GCNavigator';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { initLocalisation } from '../Localisation/Localisation';
import store from '../redux/store/store';

const GCRoot = (props) => {

    useEffect(() => {
        initLocalisation();
    }, []);

    return (
        <Provider store={store}>
            <NavigationIndependentTree>
                <NavigationContainer>
                    <GCNavigator />
                </NavigationContainer>
            </NavigationIndependentTree>
        </Provider>
    );
};

export default GCRoot;