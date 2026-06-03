import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import { getCompanyStyles } from '../redux/store/slices/CompanyStyleSlice';

const { width, height } = Dimensions.get('window');

const DEFAULT_PRIMARY = '#2E7D32';
const DEFAULT_SECONDARY = '#1565C0';

const EmployeeActivityAlertModal = ({
  visible,
  data = {},
  onClose,
  onButtonPress,
}) => {
  const companyStyle = useSelector(getCompanyStyles);
  const dynamicStyles = companyStyle?.value || {};

  if (!visible || !data?.showPopup) return null;

  const {
    headerTitle,
    loadedWebUrl,
    loadedMessage,
    btnOneNavigateTo,
    btnTwoNavigateTo,
    showCloseBtn,
  } = data;

  const source = {
    html: `
    <style>
      body, p, span, div, li, a, strong, b {
        color: #000000 !important;
      }
    </style>

    ${loadedMessage || ''}
  `,
  };

  const shouldCloseOnly = (title = '') => {
    const text = title?.toLowerCase();
    return text === 'done' || text === 'ok';
  };

  const handleButtonClick = (btnData, btnNo) => {
    const title = btnData?.title || '';

    console.log("Clicked:", btnNo, title);

    if (shouldCloseOnly(title)) {
      onClose();
      return;
    }

    if (onButtonPress) {
      onButtonPress(btnData, btnNo);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: dynamicStyles.primaryColor || DEFAULT_PRIMARY }
            ]}
          >
            <Text style={styles.headerText}>
              {headerTitle || 'Message'}
            </Text>

            {showCloseBtn && (
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            {loadedWebUrl ? (
              <View style={styles.webContainer}>
                <WebView
                  source={{ uri: loadedWebUrl }}
                  style={styles.webView}
                />
              </View>
            ) : null}

            {loadedMessage ? (
              <RenderHtml
                enableCSSInlineProcessing={true}
                contentWidth={width - 60}
                source={source}
              />
            ) : null}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>

            {btnOneNavigateTo?.btnVisible && (
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      btnOneNavigateTo?.btnColor || DEFAULT_PRIMARY,
                  },
                ]}
                onPress={() =>
                  handleButtonClick(btnOneNavigateTo, 1)
                }
              >
                <Text style={styles.buttonText}>
                  {btnOneNavigateTo?.translatedTitle || btnOneNavigateTo?.title}
                </Text>
              </TouchableOpacity>
            )}

            {btnTwoNavigateTo?.btnVisible && (
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      btnTwoNavigateTo?.btnColor || DEFAULT_SECONDARY,
                  },
                ]}
                onPress={() =>
                  handleButtonClick(btnTwoNavigateTo, 2)
                }
              >
                <Text style={styles.buttonText}>
                  {btnTwoNavigateTo?.translatedTitle || btnTwoNavigateTo?.title}
                </Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EmployeeActivityAlertModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

  container: {
    width: '100%',
    minHeight: height * 0.30,
    maxHeight: height * 0.90,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },

  close: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  body: {
    padding: 16,
  },

  webContainer: {
    height: 400,
    marginBottom: 16,
  },

  webView: {
    flex: 1,
  },

  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },

  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});