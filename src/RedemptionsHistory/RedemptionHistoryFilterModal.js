import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

import CustomCalanderSelection from '../Components/CustomCalanderSelection';
import CustomButton from '../Components/CustomButton';
import { translate } from '../Localisation/Localisation';
import SimpleToast from 'react-native-simple-toast';

const RedemptionHistoryFilterModal = ({
  isVisible,
  onClose,
  fromDate,
  toDate,
  onFromDatePress,
  onToDatePress,
  onApplyPress,
  onClearPress,
  dynamicStyles
}) => {

  // ✅ Local states
  const [showPicker, setShowPicker] = useState(false);
  const [pickerType, setPickerType] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());

  // ✅ LOCAL DATE STATES (MAIN FIX)
  const [localFromDate, setLocalFromDate] = useState(fromDate);
  const [localToDate, setLocalToDate] = useState(toDate);

  console.log('Modal Rendered with:', { fromDate, toDate, localFromDate, localToDate });

  // ✅ Sync when modal opens
  // In RedemptionHistoryFilterModal — replace your useEffect:
  useEffect(() => {
    if (isVisible) {
      setShowPicker(false);
      setPickerType(null);
      setTempDate(new Date());
      setLocalFromDate(fromDate);  // will correctly pick up parent's saved dates
      setLocalToDate(toDate);
    }
  }, [isVisible]); // ← Remove fromDate/toDate from deps — only sync on open

  // ✅ Safe date parsing
  const getValidDate = (date) => {
    const parsed = moment(date, "DD-MM-YYYY", true);
    return parsed.isValid() ? parsed.toDate() : new Date();
  };

  // From date click
  const handleFromPress = () => {
    setPickerType('from');
    setTempDate(getValidDate(localFromDate));
    setShowPicker(true);
  };

  // To date click
  const handleToPress = () => {
    setPickerType('to');
    setTempDate(getValidDate(localToDate));
    setShowPicker(true);
  };

  // iOS confirm
  const onConfirmDate = () => {
    const formatted = moment(tempDate).format("DD-MM-YYYY");

    if (pickerType === 'from') {
      setLocalFromDate(formatted);
      onFromDatePress(formatted);
    } else {
      setLocalToDate(formatted);
      onToDatePress(formatted);
    }

    if (pickerType === 'to') {
      if (!isToDateValid(localFromDate, formatted)) {
        SimpleToast.show(translate('toDateGreaterThanFromDate'))
        setLocalToDate(null);
        onToDatePress(null);
        return;
      }

      setLocalToDate(formatted);
      onToDatePress(formatted);
    }

    setShowPicker(false);
  };

  const handleApply = () => {
    onApplyPress(localFromDate, localToDate);
  };

  const handleClear = () => {
    setLocalFromDate(null);   // ← clear local modal dates
    setLocalToDate(null);     // ← clear local modal dates
    onClearPress();           // ← notify parent to clear its state too
  };

  const isToDateValid = (from, to) => {
    if (!from || !to) return true;

    const fromParsed = moment(from, "DD-MM-YYYY");
    const toParsed = moment(to, "DD-MM-YYYY");

    return toParsed.isSameOrAfter(fromParsed);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {translate('filterByDate')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Image
                source={require('../assets/images/close.png')}
                style={{ width: 20, height: 20, tintColor: '#333' }}
              />
            </TouchableOpacity>
          </View>

          {/* ✅ Date selectors (FIXED) */}
          <View style={styles.row}>
            <CustomCalanderSelection
              key={`from-${localFromDate}`}
              placeholder={translate('select')}
              width={[stylesCustom.width45]}
              defaultValue={localFromDate}
              labelName={translate('from_Date')}
              IsRequired={true}
              onFocus={handleFromPress}
            />

            <CustomCalanderSelection
              key={`to-${localToDate}`}
              placeholder={translate('select')}
              width={[stylesCustom.width45]}
              defaultValue={localToDate}
              labelName={translate('to_date')}
              IsRequired={true}
              onFocus={handleToPress}
            />
          </View>

          {/* Date Picker */}
          {showPicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                themeVariant="light"
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    setShowPicker(false);

                    if (event.type === 'set' && selectedDate) {
                      const formatted = moment(selectedDate).format("DD-MM-YYYY");

                      if (pickerType === 'from') {
                        setLocalFromDate(formatted);
                        onFromDatePress(formatted);
                      } else {
                        setLocalToDate(formatted);
                        onToDatePress(formatted);
                      }
                      if (pickerType === 'to') {
                        const formatted = moment(selectedDate).format("DD-MM-YYYY");

                        if (!isToDateValid(localFromDate, formatted)) {
                          SimpleToast.show(translate('toDateGreaterThanFromDate'))
                          setLocalToDate(null);
                          onToDatePress(null);
                          return;
                        }

                        setLocalToDate(formatted);
                        onToDatePress(formatted);
                      }
                    }
                  } else {
                    if (selectedDate) {
                      setTempDate(selectedDate);
                    }
                  }
                }}
              />

              {/* iOS buttons */}
              {Platform.OS === 'ios' && (
                <View style={styles.pickerButtons}>
                  <TouchableOpacity
                    style={{ width: '45%', height: 30, alignItems: 'flex-start', justifyContent: 'center' }}
                    onPress={() => setShowPicker(false)}>
                    <Text style={styles.cancelText}>
                      {translate('cancel')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ width: '45%', height: 30, alignItems: 'flex-end', justifyContent: 'center' }}
                    onPress={onConfirmDate}>
                    <Text style={styles.confirmText}>
                      {translate('ok')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Buttons */}
          <View style={styles.footer}>
            <CustomButton
              title={translate('apply')}
              onPress={handleApply}
              buttonBg={dynamicStyles?.primaryColor ?? '#007bff'}
              btnWidth="45%"
              titleTextColor={dynamicStyles?.secondaryColor ?? '#fff'}
            />
            <CustomButton
              title={translate('Clear')}
              onPress={handleClear}
              buttonBg="#ccc"
              btnWidth="45%"
              titleTextColor="#000"
            />
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default RedemptionHistoryFilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    marginTop: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
  },
  pickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    color: '#999',
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007bff',
  },
});

const stylesCustom = StyleSheet.create({
  width45: { width: '45%' },
});