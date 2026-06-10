import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';

import { store } from '../redux/store/store';
import GCNavigator from './GCNavigator';

const GCRoot = (props) => {
    return (
        <Provider store={store}>
            <NavigationContainer independent={true}>
                <GCNavigator {...props} />
            </NavigationContainer>
        </Provider>
    );
};

export default GCRoot;