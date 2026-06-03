// RetailerServicesModal.js

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';
import { translate } from '../Localisation/Localisation';
import { responsiveHeight } from 'react-native-responsive-dimensions';

const { width } = Dimensions.get('window');

const RetailerServicesModal = ({
  visible,
  onClose,
  data,
  onItemPress
}) => {

  const renderServiceItem = ({ item }) => {
    // if (!item.isVisible) return null;

    return (
      <TouchableOpacity
        style={[styles.itemContainer]}
        onPress={() => onItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconBox}>
          {item?.status !== true && (
            <Image
              source={require('../assets/images/comingSoon.png')}
              style={{
                height: responsiveHeight(1),
                width: '50%',
                position: "absolute",
                top: responsiveHeight(0.25),
              }}
            />
          )}
          <Image
            source={
              item?.localImage
                ? getImage(item.localImage) // local image
                : item?.serviceImage
                  ? { uri: item.serviceImage } // URL image
                  : require('../assets/images/NoCropImage.png') // fallback
            }
            style={styles.icon}
          />
        </View>

        <Text
          style={[styles.itemText, { color: item.fontColor || '#333', flexShrink: 1, lineHeight: 22 }]}
          numberOfLines={2}
        >
          {translate(item?.translatedTitle)}
        </Text>
      </TouchableOpacity>
    );
  };

  const getImage = (path) => {
    switch (path) {
      case "../assets/images/homepageIcons/1.png":
        return require('../assets/images/homepageIcons/1.png');
      case "../assets/images/homepageIcons/2.png":
        return require('../assets/images/homepageIcons/2.png');
      case "../assets/images/homepageIcons/3.png":
        return require('../assets/images/homepageIcons/3.png');
      case "../assets/images/homepageIcons/4.png":
        return require('../assets/images/homepageIcons/4.png');
      case "../assets/images/homepageIcons/5.png":
        return require('../assets/images/homepageIcons/5.png');
      case "../assets/images/homepageIcons/6.png":
        return require('../assets/images/homepageIcons/6.png');
      case "../assets/images/homepageIcons/7.png":
        return require('../assets/images/homepageIcons/7.png');
      case "../assets/images/homepageIcons/8.png":
        return require('../assets/images/homepageIcons/8.png');
      case "../assets/images/homepageIcons/9.png":
        return require('../assets/images/homepageIcons/9.png');
      case "../assets/images/homepageIcons/10.png":
        return require('../assets/images/homepageIcons/10.png');
      case "../assets/images/homepageIcons/11.png":
        return require('../assets/images/homepageIcons/11.png');
      case "../assets/images/homepageIcons/12.png":
        return require('../assets/images/homepageIcons/12.png');
      case "../assets/images/homepageIcons/13.png":
        return require('../assets/images/homepageIcons/13.png');
      case "../assets/images/homepageIcons/14.png":
        return require('../assets/images/homepageIcons/14.png');
      case "../assets/images/homepageIcons/15.png":
        return require('../assets/images/homepageIcons/15.png');
      case "../assets/images/homepageIcons/16.png":
        return require('../assets/images/homepageIcons/16.png');
      case "../assets/images/homepageIcons/17.png":
        return require('../assets/images/homepageIcons/17.png');

      default:
        return require('../assets/images/NoCropImage.png');
    }
  };

  const renderSection = ({ item }) => {
    return (
      <>
        {item?.showViewAll &&
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{item?.displayName}</Text>

            <FlatList
              data={(item?.servicesList || []).filter(
                service => service?.isVisible
              )}
              keyExtractor={(i) => i.id.toString()}
              numColumns={4}
              scrollEnabled={false}
              renderItem={renderServiceItem}
              columnWrapperStyle={{ justifyContent: 'flex-start' }}
            />
          </View>}
      </>

    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{translate('select')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderSection}
            showsVerticalScrollIndicator={false}
          />

        </View>
      </View>
    </Modal>
  );
};

export default RetailerServicesModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 60
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 0.5,
    borderColor: '#ddd'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000'
  },
  close: {
    fontSize: 30,
    color: '#000'
  },

  sectionContainer: {
    paddingHorizontal: 15,
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
    lineHeight : 22
  },

  itemContainer: {
    flex: 1,
    maxWidth: '25%',
    alignItems: 'center',
    marginBottom: 8,   // was 10
    paddingHorizontal: 4,
  },

  iconBox: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6
  },

  icon: {
    width: 40,
    height: 40,
  resizeMode: 'contain'
  },

  itemText: {
    fontSize: 11,
    textAlign: 'center'
  }
});