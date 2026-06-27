import React, { useMemo } from 'react';
import { Text, View, Modal, Image } from 'react-native';
import { useSelector } from 'react-redux';

import { Styles } from '../assets/style/styles';
import { BuildStyleOverwrite } from '../assets/style/BuildStyle';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';
import { Colors } from '../assets/Utils/Color';
import { createStyles } from '../assets/style/createStyles';
import { translate } from '../Localisation/Localisation';

const DEFAULT_LOADER_IMAGE = require('../assets/images/neutralloader.gif');

let styles = BuildStyleOverwrite(Styles);

const CustomLoader = ({
  loading = false,
  message = translate('loading'),
  loaderImage = DEFAULT_LOADER_IMAGE,
  fromCropDiag = false,
}) => {
  const companyStyle = useSelector(getCompanyStyles);

  styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);

  const dynamicStyles = companyStyle?.value || {};

  console.log('CustomLoader loading =>', loading);

  if (!loading) {
    return null;
  }

  const loaderSource =
    dynamicStyles?.loaderPath && dynamicStyles.loaderPath.length > 0
      ? {
          uri: dynamicStyles.loaderPath.startsWith('file://')
            ? dynamicStyles.loaderPath
            : `file://${dynamicStyles.loaderPath}`,
          cache: 'reload',
        }
      : loaderImage;

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape']}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: '#000000d6',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={
            fromCropDiag
              ? require('../assets/images/plant_animation.gif')
              : loaderSource
          }
          style={{
            width: 150,
            height: 150,
          }}
          resizeMode="contain"
        />

        <Text
          style={[
            styles['font_size_13_regular'],
            {
              color:
                dynamicStyles.secondaryColor || Colors.white,
              textAlign: 'center',
              marginTop: 20,
            },
          ]}
        >
          {message}
        </Text>
      </View>
    </Modal>
  );
};

export default CustomLoader;