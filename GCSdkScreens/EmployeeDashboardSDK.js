import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Platform, StatusBar, Text, Image, AppState, Dimensions, Keyboard, TouchableOpacity, ScrollView, FlatList, ImageBackground, PermissionsAndroid, Modal, Linking, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { strings } from '../src/strings/strings';
import { Colors } from '../src/assets/Utils/Color';
import { DEVICE_TOKEN, EDITDATA, MOBILE_NUMBER, NAVIGATE_TO_CLASS, POPUP_SHOWN_DATE, PROFILEIMAGE, ROLEID, TERMS_CONDITIONS, USERMENU, USER_ID, USER_NAME, checkIfGpsEnabled, compareVersions, getAppVersion, getBuildNumber, readFileToBase64, retrieveData, storeData, traverseAndReplaceUrls } from '../src/assets/Utils/Utils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomAlert from '../src/Components/CustomAlert';
import CustomLoader from '../src/Components/CustomLoader';
import { GetApiHeaders, GetRequest, PostRequest, getNetworkStatus } from '../src/NetworkUtils/NetworkUtils';
import { APP_ENV_PROD, FIREBASE_VERSION_COLLECTION_NAME, FIREBASE_VERSION_DOC_ID, HTTP_FORBIDDEN, HTTP_OK, IOS_STORE_LINK, configs } from '../src/helpers/URLConstants';
import SimpleToast from 'react-native-simple-toast';
import { useDispatch, useSelector } from 'react-redux';
import CustomCircularImageView from '../src/Components/CustomCircularImageView';
import { PERMISSIONS, request } from 'react-native-permissions';
import messaging from '@react-native-firebase/messaging';
// import firestore from '@react-native-firebase/firestore';
import { changeLanguage, translate } from '../src/Localisation/Localisation';
import { getCompanyStyles } from '../src/redux/store/slices/CompanyStyleSlice';
import { responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { setLocation } from '../src/redux/store/slices/locationSlice';
import Geolocation from 'react-native-geolocation-service';
import { FontForWeight } from '../src/assets/fonts/fonts';
import MediaModal from '../src/Modals/MediaModal';
const { height, width } = Dimensions.get('window');
import RetailerServicesModal from '../src/Components/RetailerServicesModal';
import { getCropsListMasterProducts, getOfflineProductsData } from '../src/Products/Products';
import { GetMastersComplaint } from '../src/Profile/Complaint';
import { GetComplaintsApiCallGlobal, uploadAllComplaintsGlobal } from '../src/Profile/HelpDesk';
import { GetFAQDATA } from '../src/Profile/FAQ';
import { getDataOfScanHistory, getProgramsList } from '../src/QRScanner/ScanHistory';
import { getMasterForProgramDetails } from '../src/Dashboard/ProgramDetails';
import { getCompaniesListPlanningTool, getCropsListPlanningTool, getExistedRetailersDataPlanningTOol, getHybridsListPlanningTool, saveAPIPlanningTool } from '../src/Dashboard/PlanningTool';
import { getYieldCalcMasters, SaveYieldCalcValues } from '../src/Dashboard/YieldCalculator';
import { getFertilizerCalcRes, getMastersFertilizer } from '../src/Dashboard/FertilizerCalculator';
import { getMastersSeedCalc, saveSavedSeedCalData } from '../src/Dashboard/SeedCalculator';
import EmployeeActivityAlertModal from '../src/Modals/EmployeeActivityAlertModal';
import CustomSuccessLoader from '../src/Components/CustomSuccessLoader';
import { setNetworkConnectionStatus } from '../src/redux/store/slices/NetworkSlice';
import realm from '../src/realmOffline/realmConfig';
import { selectUser } from '../src/redux/store/slices/UserSlice';

function EmployeeDashboardSDK({ route }) {

  const networkStatus = useSelector(state => state.networkStatus.value)
  const [loaderImage, setLoaderImage] = useState(require('../src/assets/images/neutralloader.gif'))
  const getUserData = useSelector(selectUser);
  const companyStyle = useSelector(getCompanyStyles);
  const [dynamicStyles, setDynamicStyles] = useState({});
  const navigation = useNavigation()
  const [showAlert, setShowAlert] = useState(false)
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertHeader, setShowAlertHeader] = useState(false)
  const [showAlertHeaderText, setShowAlertHeaderText] = useState(false)
  const [showAlertYesButton, setShowAlertYesButton] = useState(false)
  const [showAlertNoButton, setShowAlertNoButton] = useState(false)
  const [showAlertyesButtonText, setShowAlertyesButtonText] = useState(false)
  const [showAlertNoButtonText, setShowAlertNoButtonText] = useState(false)
  const [userName, setUserName] = useState('')
  const [userImage, setUserImage] = useState('')
  const [showDetailViewModal, setShowDetailViewModal] = useState(false)
  const [proprietorName, setProprietorName] = useState('')
  const [firmName, setFirmName] = useState('')
  const [state, setState] = useState('')
  const [stateID, setStateID] = useState('')

  const [district, setDistrict] = useState('')
  const [districtID, setDistrictID] = useState('')
  const [notificationCount, setNotificationCount] = useState(null)
  const { height, width } = Dimensions.get('window');
  const appState = useRef(AppState.currentState);
  const storeLink = "https://play.google.com/store/apps/details?id=com.nuziveeduseeds.nslchannel";

  const { latitude, longitude } = useSelector((state) => state.location);
  const [weatherIsVisible, setWeatherIsVisible] = useState(false)
  const [weatherInfo, setWeatherInfo] = useState(null)

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isManual, setIsManual] = useState(false);
  const flatListRef = useRef(null);
  const [carouselData, setCarouselData] = useState([])
  const [mediaVisible, setMediaVisible] = useState(false);
  const [mediaLink, setMediaLink] = useState('');

  const [usersList, setUsersList] = useState([])

  const [notificationVisible, setNotificationVisible] = useState(false)
  const [showCarouselCard, setShowCarouselCard] = useState(false);
  const [secondaryScannerVisible, setSecondaryScannerVisible] = useState(false);
  const [programsList, setProgramsList] = useState([])
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programDropdownOpen, setProgramDropdownOpen] = useState(false);

  const [activitySummaryList, setActivitySummaryList] = useState([])
  const [cropInsightsList, setCropInsightsList] = useState([])
  const [serviceMenuList, setServiceMenuList] = useState([])
  const [serviceModal, setServiceModal] = useState(false);
  const [moreMenuList, setMoreMenuList] = useState([])
  const [moreModal, setMoreModal] = useState(false);
  const [calculatorOptions, setCalculatorOptions] = useState(false)
  const [selectedCalc, setSelectedCalc] = useState(null)
  const lang = useSelector(state => state.language.languageCode);
  const isManualProgramChange = useRef(false);
  const dispatch = useDispatch();
  const ITEM_WIDTH = Dimensions.get('window').width;
  const [loadingCount, setLoadingCount] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [refreshButtonClicked, setRefreshButtonClicked] = useState(false)

  // employee alert modal states
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const [successLoading, setSuccessLoading] = useState(false)
  const [successLoadingMessage, setSuccessLoadingMessage] = useState('')
  const startLoading = (msg = '') => {
    setLoadingMessage(msg);
    setLoadingCount(prev => prev + 1);
  };

  const stopLoading = () => {
    setLoadingCount(prev => Math.max(prev - 1, 0));
  };

  const loading = loadingCount > 0;


  useEffect(() => {
    setDynamicStyles(companyStyle?.value || {});
  }, [companyStyle]);

  // Auto scroll logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselData?.length > 0 && !isManual) {
        let nextIndex = (currentIndex + 1) % carouselData.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setCurrentIndex(nextIndex);
      }
    }, 3000); // 👈 auto slide every 3s

    return () => clearInterval(interval);
  }, [currentIndex, isManual, carouselData]);

  useEffect(() => {
    console.log("AppState listener set up");

    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log("AppState changed: ", nextAppState);

      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log("App has come to the foreground");

        // checkForceUpdate();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      console.log("AppState listener removed");
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      await new Promise(res => setTimeout(res, 50)); // allow UI render

      try {
        await Promise.all([
          dashboardSummaryApiCall(),
          // checkForceUpdate(),
          getCarouselData(),
        ]);
      } catch (e) {
        console.log(e);
      } finally {

      }
    };

    init();
  }, []);

  const dummyCalculatorData = [
    {
      id: 1,
      title: translate('FertilizerCalculator'),
      image: require('../src/assets/images/fertilizerCalculator.png'),
    },
    {
      id: 2,
      title: translate('YieldCalculator'),
      image: require('../src/assets/images/yieldCalculator.png'),
    },
    {
      id: 3,
      title: translate('SeedPopulationCalculator'),
      image: require('../src/assets/images/seedPopulationCalculator.png'),
    }
  ]

  useEffect(() => {
    if (!isManualProgramChange.current) {
      return; // ⛔ skip auto set from API
    }
    console.log("🔁 Manual Program change → API call");
    dashboardSummaryApiCall();
    isManualProgramChange.current = false; // reset
  }, [selectedProgram]);

  const dashboardUserMenuApiCall = async () => {
    console.log("🚀 DASHBOARD API START");
    var networkStatus = await getNetworkStatus()
    if (!networkStatus) return;
    startLoading(translate('please_wait_getting_data'));

    try {
      var dashboardURL = configs.BASE_URL + configs.EMPLOYEEDASHBOARD.DASHBOARD_API;
      var getHeaders = await GetApiHeaders();

      var dataList = {
        "userId": getHeaders.userId,
        'mobileNumber': getHeaders.mobileNumber,
        "latitude": latitude,
        "longitude": longitude
      }
      var APIResponse = await PostRequest(dashboardURL, getHeaders, dataList);
      console.log("SAINATH", JSON.stringify(APIResponse));
      console.log("✅ DASHBOARD API RESPONSE");
      if (APIResponse != undefined && APIResponse != null) {

        if (APIResponse.statusCode == HTTP_OK) {
          var dashboardResp = APIResponse.response
          console.log("dashboardResp", JSON.stringify(dashboardResp))

          setUsersList(dashboardResp?.userList);
          setNotificationCount(dashboardResp?.userList[0] ? dashboardResp?.userList[0].notificationCount : null)
          setSecondaryScannerVisible(dashboardResp?.showScanned);
          setNotificationVisible(dashboardResp?.showNotification);
          setServiceMenuList(dashboardResp?.retailerServices || [])
          setMoreMenuList(dashboardResp?.moreItemServices || [])
        }
        else if (APIResponse.statusCode == 601) {
          SimpleToast.show(APIResponse?.message)
          // await getUserLoggedOut()
          // showAlertWithMessage(translate('alert'), true, true, APIResponse.message, true, false, translate('ok'), translate('cancel'))
        }
        else {
          showAlertWithMessage(translate('alert'), true, true, APIResponse?.message, false, true, translate('ok'), translate('cancel'))
        }

      }
    } catch (error) {
      console.error(error);
    } finally {
      stopLoading(); // 🔥 ONLY HERE
    }
  }

  const dashboardSummaryApiCall = async () => {
    console.log("🚀 DASHBOARD API START SUMMARY");
    var networkStatus = await getNetworkStatus()
    if (!networkStatus) return;
    setSummaryLoading(true);

    try {
      var dashboardURL = configs.BASE_URL + configs.EMPLOYEEDASHBOARD.DASHBOARD_SUMMARY_API;
      var getHeaders = await GetApiHeaders();

      var dataList = {
        "userId": getHeaders.userId,
        'mobileNumber': getHeaders.mobileNumber,
        "latitude": latitude,
        "longitude": longitude,
        'programName': selectedProgram == null ? "" : selectedProgram?.name
      }
      var APIResponse = await PostRequest(dashboardURL, getHeaders, dataList);
      console.log("SAINATH", JSON.stringify(APIResponse));
      console.log("✅ DASHBOARD API RESPONSE SUMMARY");
      if (APIResponse != undefined && APIResponse != null) {

        if (APIResponse.statusCode == HTTP_OK) {
          var dashboardResp = APIResponse.response
          console.log("dashboardRespSummary", JSON.stringify(dashboardResp))

          setProgramsList(dashboardResp?.programsList || [])
          // ✅ Set default program ONLY if not already selected
          if (!selectedProgram && dashboardResp?.programsList?.length > 0) {
            setSelectedProgram(dashboardResp.programsList[0]);
          }
          setActivitySummaryList(dashboardResp?.activitySummaryList || [])
          setCropInsightsList(dashboardResp?.cropInsightsList || [])
        }
        else if (APIResponse.statusCode == 601) {
          SimpleToast.show(APIResponse?.message)
          // await getUserLoggedOut()
          // showAlertWithMessage(translate('alert'), true, true, APIResponse.message, true, false, translate('ok'), translate('cancel'))
        }
        else {
          showAlertWithMessage(translate('alert'), true, true, APIResponse?.message, false, true, translate('ok'), translate('cancel'))
        }

      }
    } catch (error) {
      console.error(error);
    } finally {
      setSummaryLoading(false);
    }
  }

  // async function checkForceUpdate() {
  //   try {
  //     const subscriber = firestore()
  //       .collection(FIREBASE_VERSION_COLLECTION_NAME)
  //       .doc(FIREBASE_VERSION_DOC_ID)
  //       .onSnapshot(documentSnapshot => {
  //         console.log('Document snapshot received');

  //         if (documentSnapshot.exists) {
  //           const data = documentSnapshot.data();
  //           console.log('Document data:', data);

  //           if (data) {
  //             setTimeout(() => {
  //               if (Platform.OS == 'android') {
  //                 checkAppversionUpdate(data);
  //               } else {
  //                 checkAppversionUpdateIOS(data);
  //               }
  //             }, 500);
  //           } else {
  //             console.error('Document data is undefined');
  //           }
  //         } else {
  //           console.error('Document does not exist');
  //         }
  //       });

  //     return () => subscriber();
  //   } catch (error) {
  //     console.error('Error fetching document:', error);
  //   }
  // }
  // async function checkAppversionUpdateIOS(documentSnapshot) {

  //   const localVersion = DeviceInfo.getVersion(); // Need to change for Android in future

  //   let remoteVersion = '';

  //   if (APP_ENV_PROD) {
  //     if (Platform.OS === 'android') {
  //       remoteVersion = documentSnapshot.androidAppVersionPROD;
  //     } else {
  //       remoteVersion = documentSnapshot.iosAppVersionPROD;
  //     }
  //   } else {
  //     if (Platform.OS === 'android') {
  //       remoteVersion = documentSnapshot.androidAppVersionUAT;
  //     } else {
  //       remoteVersion = documentSnapshot.iosAppVersionUAT;
  //     }
  //   }
  //   let showForceUpdate = Platform.OS == 'ios' ? documentSnapshot?.showForceUpdateIOS : documentSnapshot?.showForceUpdate;
  //   let isMandatory = Platform.OS == 'ios' ? documentSnapshot.isMandatoryForIOS : documentSnapshot.isMandatoryForAndroid;

  //   console.log(`Local: ${localVersion} | Remote: ${remoteVersion}`);
  //   if (showForceUpdate) {
  //     if (compareVersions(localVersion, remoteVersion) < 0) {
  //       showAlertWithMessage(translate('alert'), true, true, documentSnapshot.message || translate('update_message'), true, !isMandatory, translate('update'), translate('cancel'));
  //     }
  //   } else {
  //     setShowAlert(false)
  //   }
  // }

  // async function checkAppversionUpdate(documentSnapshot) {
  //   try {
  //     if (documentSnapshot) {
  //       const appDetails = await getAppVersion();
  //       const appVersionCode = await getBuildNumber();
  //       const showForceUpdateOrNOT = documentSnapshot?.showForceUpdate;
  //       const messageToRender = documentSnapshot?.message || translate('update_message');
  //       const version = documentSnapshot?.androidAppVersion;
  //       const platformProdVersion = documentSnapshot?.androidAppVersionPROD;
  //       const platformUATVersion = documentSnapshot?.androidAppVersionUAT;
  //       const isMandatory = documentSnapshot?.isMandatoryForAndroid;
  //       const shouldShowUpdate = (versionToCheck) => versionToCheck && versionToCheck > appVersionCode;
  //       const showUpdateAlert = () => showAlertWithMessage(translate('alert'), true, true, messageToRender, true, !isMandatory, translate('update'), translate('cancel'));
  //       if (APP_ENV_PROD ? shouldShowUpdate(platformProdVersion) : shouldShowUpdate(platformUATVersion)) {
  //         showUpdateAlert()
  //       } else if (showForceUpdateOrNOT && version && version !== appDetails) {
  //         showUpdateAlert()
  //       } else {
  //         setShowAlert(false);
  //       }
  //     } else {
  //       setShowAlert(false);
  //     }
  //   } catch (error) {
  //     console.error('Error in checkAppversionUpdate:', error);
  //     setShowAlert(false);
  //   }
  // }


  useEffect(() => {
    const initLocationUpdates = async () => {
      const hasPermission = await requestLocationPermission();
      console.log("Permission Status:", hasPermission);

      if (hasPermission && Platform.OS == 'android') {
        const isGpsEnabled = await checkIfGpsEnabled();
        console.log("GPS Enabled:", isGpsEnabled);

        if (isGpsEnabled) {
          fetchLocation(); // Get initial location
        }
      } else if (hasPermission && Platform.OS == 'ios') {
        fetchLocation(); // Get initial location
      }
    };


    if (latitude == null || longitude == null) {
      const interval = setInterval(() => {
        console.log("Updating location...1");
        initLocationUpdates();
      }, 40000); // Call every 20 seconds

      return () => clearInterval(interval); // Cleanup on unmount
    }
    else {
      console.log('calling weather apiiiiiiiiiiiiiiiiiiiiiiiiiii')
      getWeatherData()
    }
  }, [latitude, longitude]);

  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);

        return (
          granted["android.permission.ACCESS_FINE_LOCATION"] === PermissionsAndroid.RESULTS.GRANTED &&
          granted["android.permission.ACCESS_COARSE_LOCATION"] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS always allows location permissions when requested
  };

  const fetchLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Location fetched1:", latitude, longitude);
        dispatch(setLocation({ latitude, longitude }));
      },
      (error) => {
        console.error("Error fetching location1:", error);

        // Retry if location fetch fails
        if (error.code === 3 || error.code === 2) {
          Geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              console.log("Fallback Location:", latitude, longitude);
              dispatch(setLocation({ latitude, longitude }));
            },
            (fallbackError) => {
              console.error("Fallback location error:", fallbackError);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          );
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5000 }
    );
  };

  // weather api call
  let getWeatherData = useCallback(async () => {
    var networkStatus = await getNetworkStatus()
    if (networkStatus) {
      try {
        var getloginURL = configs.BASE_URL + configs.MASTERS.getWeatherDetailsV1;
        var getHeaders = await GetApiHeaders();
        var dataList = {
          "userId": getHeaders.userId,
          'mobileNumber': getHeaders.mobileNumber,
          "latitude": latitude,
          "longitude": longitude
        }
        var APIResponse = await PostRequest(getloginURL, getHeaders, dataList);
        if (APIResponse != undefined && APIResponse != null) {
          if (APIResponse.statusCode == HTTP_OK) {
            console.log("APIResponseAPIResponse", JSON.stringify(APIResponse))
            if (APIResponse?.response?.dailyBaseWeatherInfo != null && APIResponse?.response?.dailyBaseWeatherInfo != "") {
              setWeatherIsVisible(APIResponse?.response?.isVisible)
              setWeatherInfo(APIResponse?.response?.dailyBaseWeatherInfo?.forecast[0])
            }
            else {
              setWeatherIsVisible(false)
              setWeatherInfo(null)
            }
          }
          else if (APIResponse.statusCode === HTTP_FORBIDDEN || APIResponse.statusCode === 999) {
            setWeatherIsVisible(APIResponse?.response?.isVisible ?? weatherIsVisible);
            setWeatherInfo(null)
          }
          else if (APIResponse.statusCode == 601) {
            SimpleToast.show(APIResponse?.message)
            showAlertWithMessage(translate('alert'), true, true, APIResponse.message, true, false, translate('ok'), translate('cancel'))
          }
          else {
            setWeatherIsVisible(APIResponse?.response?.isVisible ?? weatherIsVisible)
            setWeatherInfo(null)
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
      }
    }
  }, [longitude, latitude])

  // carousel api call
  let getCarouselData = useCallback(async () => {
    var networkStatus = await getNetworkStatus()
    if (!networkStatus) return;

    try {
      var getCarouselDataURL = configs.BASE_URL + configs.MASTERS.GETCAROUSELDATA;
      var getHeaders = await GetApiHeaders()
      var APIResponse = await PostRequest(getCarouselDataURL, getHeaders,
        {
          "notificationType": strings.card,
          "roleId": getUserData?.roleId,
          "companyCode": getUserData?.companyCode,
          "stateId": getUserData?.stateId,
          "filterValue": ""
        }
      );
      if (APIResponse != undefined && APIResponse != null) {
        if (APIResponse.statusCode == HTTP_OK) {
          var masterResp = APIResponse.response
          if (masterResp != undefined && masterResp != null) {
            console.log("Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", JSON.stringify(masterResp?.promotionsList))
            let data = masterResp?.promotionsList
            if (data) {
              setShowCarouselCard(data.length > 0 ? true : false)
              setCarouselData(data)
            }
            else {
              setShowCarouselCard(false)
            }
          }
        }

      }
    }
    catch (error) {
      SimpleToast.show(error.message)
    }
    finally {

    }

  }, [getUserData]);

  useEffect(() => {
    const dataEditMethod = async () => {
      var dataEdit = await retrieveData(EDITDATA)
      // setNetworkStatus(await getNetworkStatus())
      console.log("SAINATH_LATEST", getUserData);
      setShowDetailViewModal(dataEdit)
      if (dataEdit == true && networkStatus) {

      }
    }
    dataEditMethod()
  }, [])

  useEffect(() => {
    getDialoguePopupApi();
    requestNotificationPermission();
  }, [])

  const getDialoguePopupApi = async () => {
    const network = await getNetworkStatus();
    if (!network) {
      SimpleToast.show(translate('no_internet_conneccted'));
      return;
    }
    try {
      startLoading(translate('please_wait_getting_data'));

      const headers = await GetApiHeaders();
      const APIResponse = await GetRequest(
        configs.BASE_URL + configs.EMPLOYEEDASHBOARD.DASHBOARD_POPUOP_DATA,
        headers
      );

      if (APIResponse?.statusCode === HTTP_OK) {
        const latestPopup = APIResponse?.response;

        console.log("Popup API Response:", JSON.stringify(latestPopup));

        if (!latestPopup?.showPopup) {
          return;
        }

        // if dailyOnce = true
        if (latestPopup?.dailyOnce) {
          const today = new Date().toISOString().split('T')[0];

          const savedDate = await retrieveData(POPUP_SHOWN_DATE);

          // already shown today -> don't show
          if (savedDate === today) {
            console.log("Popup already shown today");
            return;
          }

          // first time today -> save date
          await storeData(POPUP_SHOWN_DATE, today);

        }

        // show popup
        setPopupVisible(true);
        setPopupData(latestPopup);

      } else {
        SimpleToast.show(APIResponse?.message || translate('something_went_wrong')
        );
      }
    } catch (error) {
      SimpleToast.show(error.message);
    } finally {
      stopLoading();
    }
  };


  const callMasters = async () => {
    // var realm = new Realm({ path: 'User.realm' });

    if (!realm) {
      console.log("Realm not initialized");
      return;
    }
    scan
    try {
      // 1. sync call for seed calc
      const seedCalcRes = realm.objects('SeedCalSubmit');
      const seedCalcOfflineData = seedCalcRes[0]?.data;
      if (seedCalcOfflineData) {
        let parseIt = JSON.parse(seedCalcOfflineData)
        saveSavedSeedCalData(parseIt, dispatch)
        // masters call for seed calc
        getMastersSeedCalc()
      } else {
        // masters call for seed calc
        getMastersSeedCalc()
      }


      //  2.  sync call for fertilizer calc
      getMastersFertilizer()
      getFertilizerCalcRes()

      //3.  sync calls for yield calc
      const yieldCalcRes = realm.objects('YieldCalSubmit');
      const yieldCalcOfflineData = yieldCalcRes[0]?.data;
      if (yieldCalcOfflineData) {
        let yieldParseIt = JSON.parse(yieldCalcOfflineData)
        SaveYieldCalcValues(yieldParseIt, dispatch)
        // masters call for yield calc
        getYieldCalcMasters()
      } else {
        // masters call for yield calc
        getYieldCalcMasters()
      }


      // 4. planning tool
      const offlineRetailerEntriesData = realm.objects('finalRetailerEntries');
      getCropsListPlanningTool()
      getHybridsListPlanningTool()
      getCompaniesListPlanningTool()
      if (offlineRetailerEntriesData.length !== 0) {
        console.log('offline data exists so----------------------------- saving in online now', offlineRetailerEntriesData)
        let dataOfRetailerEntriesData = JSON.parse(offlineRetailerEntriesData[0]?.finalRetailerEntriesData);
        saveAPIPlanningTool(dataOfRetailerEntriesData, dispatch)
      } else {
        console.log('offline data  doesnt exists so calling get api')
        getExistedRetailersDataPlanningTOol()
      }


      // 5.program details
      getMasterForProgramDetails()

      // 6. scan history
      getDataOfScanHistory()
      getProgramsList()

      //7. FAQ's
      GetFAQDATA()

      // 8. help desk
      GetComplaintsApiCallGlobal()
      const complaints = realm.objects('ComplaintData');
      console.log(complaints, "offline complaints list")
      if (complaints?.length > 0) {
        uploadAllComplaintsGlobal(complaints, dispatch)
      };


      // 9. complaint
      GetMastersComplaint()

      // 10. products
      getOfflineProductsData()
      getCropsListMasterProducts()


    } catch (e) {
      console.log(e)
    } finally {

    }
  }

  useFocusEffect(
    React.useCallback(() => {
      const fetchDataOnFocus = async () => {
        handleFocus();
        let setData = async () => {
          setUserImage(await retrieveData(PROFILEIMAGE))
        }
        setData()
        console.log("Calling dashboard API on fetch");
        const networkStatus = await getNetworkStatus()
        dispatch(setNetworkConnectionStatus(networkStatus))
        if (networkStatus) {
          console.log("Calling dashboard API on focus", networkStatus);
          dashboardUserMenuApiCall(),
            callMasters()
        }

        return () => {
          console.log('Screen is no longer focused!');
        };
      };
      fetchDataOnFocus();
    }, [networkStatus])
  );

  useEffect(() => {
    if (!refreshButtonClicked) return;

    const init = async () => {
      await new Promise(res => setTimeout(res, 50)); // allow UI render

      try {
        await Promise.all([
          callMasters(),
          dashboardSummaryApiCall(),
          // checkForceUpdate(),
          getCarouselData(),
          dashboardUserMenuApiCall(),
        ]);
      } catch (e) {
        console.log(e);
      } finally {
        setRefreshButtonClicked(false); // reset after all complete
      }
    };

    init();
  }, [refreshButtonClicked]);



  const handleOkAlert = async () => {
    setShowAlert(false)
    if (alertMessage == translate('update_message')) {
      if (Platform.OS == 'ios') {
        Linking.openURL(IOS_STORE_LINK)
      } else {
        Linking.openURL(storeLink)
      }
    }
    if (alertMessage == translate('are_you_sure_want_to_logout') || alertMessage == translate('logged_in_other_device') || alertMessage == "New Update Is Available Please Update") {
      // await getUserLoggedOut()
    }
  }
  const handleFocus = async () => {
    console.log('Screen is focused!');

    console.log('845188165', await retrieveData(USERMENU))
    getUserDataDetails();
  };



  // Language effect
  useEffect(() => {
    if (lang) {
      changeLanguage(lang);
    }
  }, [lang]);

  const requestNotificationPermission = async () => {
    const authorizationStatus = await messaging().requestPermission();
    if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      console.log('User has notification permissions enabled.');
    } else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
      console.log('User has provisional notification permissions.');
    } else {
      console.log('User has notification permissions disabled');
    }
  }

  const showPermissionAlert = () => {
    Alert.alert(
      translate('permission_required'),
      translate('camera_permission_message'),
      [
        { text: translate('cancel'), style: 'cancel' },
        { text: translate('open_settings'), onPress: () => Linking.openSettings() }
      ],
      { cancelable: true }
    );
  };

  const requestPermissionsProductScan = async (flag = null) => {
    if (Platform.OS == 'android') {
      var result = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA]);
      if (result['android.permission.CAMERA'] === 'granted') {
        if (flag === 'sendToMDO') {
          navigation.navigate('ProductScanner', { flag: "renderMDO" });
        } else {
          navigation.navigate('ProductScanner');
        }
      } else {
        showPermissionAlert();
      }
    }
    else {
      if (Platform.OS == 'ios') {
        let status = await request(PERMISSIONS.IOS.CAMERA)
        if (status == "blocked" || status == "denied") {
          showAlertWithMessage(translate('alert'), true, true, translate('camera_permission_ios'), true, true, translate('enable'), translate('cancel'))
          return;
        }
        else {
          if (flag === 'sendToMDO') {
            navigation.navigate('ProductScanner', { flag: "renderMDO" });
          } else {
            navigation.navigate('ProductScanner');
          }
        }
      }
    }
  }

  const getUserDataDetails = async () => {
    setUserName(await retrieveData(USER_NAME))
    setFirmName(getUserData?.firmName)
    setState(getUserData?.stateName)
    setStateID(getUserData?.stateId)
    setDistrict(getUserData?.districtName)
    setDistrictID(getUserData?.districtId)
    setProprietorName(getUserData?.proprietorName)
    console.log('gggggggg123', getUserData?.proprietorName)
  }

  const showAlertWithMessage = (title, header, heaertext, message, yesBtn, noBtn, yesText, noText) => {
    setAlertTitle(title);
    setShowAlertHeader(header);
    setShowAlertHeaderText(heaertext)
    setAlertMessage(message);
    setShowAlertYesButton(yesBtn);
    setShowAlertNoButton(noBtn);
    setShowAlertyesButtonText(yesText);
    setShowAlertNoButtonText(noText);
    setShowAlert(true)
  }

  const handleCancelAlert = () => {
    setShowAlert(false)
  }

  const notificationBtnClicked = async () => {
    if (networkStatus) {
      navigation.navigate('Notifications')
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const onPressDashboardItem = async (item, index) => {
    console.log("onPressDashboardItem", item)
    if (item?.status != true) {
      SimpleToast.show(item?.statusFalseMsg ? item?.statusFalseMsg : translate('feature_not_available'));
      return;
    }
    if (networkStatus) {

      if (item.title == strings.products) {
        navigation.navigate('Products')
      }
      else if (item.title == strings.ProgramDetails) {
        navigation.navigate('ProgramDetails')
      }
      else if (item.title === strings.HDPS) {
        if (item?.urlPath) {
          setMediaLink(item?.urlPath)
          setMediaVisible(true)
        }
        else {
          SimpleToast.show(translate('invalid_file_format'))
        }
      }
      else if (item.title == strings.Calculator) {
        setCalculatorOptions(!calculatorOptions)
      }
      else if (item.title === strings.CropDiag) {
        navigation.navigate("CropDiagonstic")
      }
      else if (item.title === strings.Agronomy) {
        navigation.navigate("Agronomy")
      }
      else if (item.title == strings.MandiPrices) {
        navigation.navigate('MandiPricesScreen')
      }
      else if (item.title == strings.productScan) {
        requestPermissionsProductScan()
      }
      else if (item.title == strings.Field_activity_QR) {
        requestPermissionsProductScan('sendToMDO')
      }
      else if (item.title === strings.AdvancedKnowledgeCenter || item.title === strings.KnowledgeCenter) {
        navigation.navigate('AdvancedKnowledgeCenter')
      }
      else if (item.title === strings.pestForecast) {
        navigation.navigate('WeatherScreen', { enablePestForecast: true })
      }
      else if (item.title == strings.scan) {
        requestPermissionsProductScan()
      }
      else if (item.title == strings.scan_history) {
        navigation.navigate('EmpScanHistory', { roleid: (await retrieveData(ROLEID)) })
      }
      else if (item.title == strings.helpCenter || item?.title == strings.HelpDesk) {
        navigation.navigate('HelpDesk')
      }
      else if ((item.title == strings.redemHistory) || (item.title == strings.redemHistory_title)) {
        navigation.navigate('EmployeeRedemptionsHistory', { roleid: (await retrieveData(ROLEID)) })
      }
    } else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }

  }

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Handle keyboard show event
        // Adjust your views here

      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Handle keyboard hide event
        // Adjust your views here
      }
    );

    // Clean up listeners
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const getUserLoggedOut = async () => {
    var networkStatus = await getNetworkStatus()
    if (!networkStatus) return;

    startLoading(translate('pleasewaitloggingout'));

    try {
      var url = configs.BASE_URL + configs.AUTH.LOGOUT;
      var getHeaders = await GetApiHeaders();
      var dataList = {
        userId: getHeaders.userId
      }
      console.log('url is', url)
      console.log('getHeaders is', getHeaders)
      console.log('dataList is', dataList)

      var APIResponse = await PostRequest(url, getHeaders, dataList);
      console.log('logout response is:', APIResponse)
      if (APIResponse != undefined && APIResponse != null) {

        if (APIResponse.statusCode == HTTP_OK) {
          setTimeout(() => {
            setSuccessLoading(true)
            setSuccessLoadingMessage(translate('logout_successfully'))
          }, 1000);

          setTimeout(() => {
            setSuccessLoading(false)
            setSuccessLoadingMessage()
            storeData(MOBILE_NUMBER, '');
            storeData(USER_ID, '');
            storeData(USER_NAME, '');
            storeData(DEVICE_TOKEN, '');
            storeData(USERMENU, '');
            storeData(PROFILEIMAGE, '')
            storeData(EDITDATA, false)
            storeData(TERMS_CONDITIONS, false)
            storeData(POPUP_SHOWN_DATE, '')
            storeData(NAVIGATE_TO_CLASS, '')
            navigation.reset({
              index: 0,
              routes: [{ name: 'LoginNew' }],
            });
          }, 3000);
        }
        else {
          showAlertWithMessage(translate('alert'), true, true, APIResponse.message, false, true, translate('ok'), translate('cancel'))
        }

      }
    } catch (error) {
      console.error(error);
    } finally {
      stopLoading();
    }

  }

  let greet = (new Date().getHours() >= 18)
    ? translate('GoodEvening')
    : (new Date().getHours() >= 12)
      ? translate('GoodAfternoon')
      : translate('GoodMorning')

  const headerHeight = React.useMemo(() => {

    const windowHeight = Dimensions.get('window').height;

    console.log("weatherIsVisible===>", weatherIsVisible)
    console.log("showCarouselCard====>", showCarouselCard)
    if (weatherIsVisible && showCarouselCard) return windowHeight / 3.5;
    // if (weatherIsVisible || showCarouselCard) return windowHeight / 4.5;
    return windowHeight / 7.2;
  }, [weatherIsVisible, showCarouselCard]);

  const marginTop = React.useMemo(() => {

    console.log("weatherIsVisible===>", weatherIsVisible)
    console.log("showCarouselCard====>", showCarouselCard)
    if (weatherIsVisible && showCarouselCard) return 10;
    if (weatherIsVisible || showCarouselCard) return 20;
    return 120;
  }, [weatherIsVisible, showCarouselCard]);

  const headerSec = () => {
    return (
      <View
        style={{
          borderBottomEndRadius: 25,
          borderBottomStartRadius: 25,
          overflow: 'hidden',
          width: '100%',
          height: headerHeight,
          position: 'absolute',
          top: 0,
          zIndex: 9999,
          elevation: 9999, // android
        }}
      >
        <ImageBackground style={[{ height: '100%', width: Dimensions.get('window').width, backgroundColor: dynamicStyles.primaryColor }]}>
          <Image source={require('../src/assets/images/leaaafImg.png')} style={stylesheetStyles.leafHome} />
          <Image source={require('../src/assets/images/leaffafhb.png')} style={stylesheetStyles.leftLeaf} />
          <View style={{ height: 145, width: 145, backgroundColor: "white", borderRadius: 100, alignItems: "center", justifyContent: "flex-end", alignSelf: "center", position: "absolute", top: -100, marginLeft: 25 }}>
            <Image source={
              require('../src/assets/images/newAppIcon.png')
            } style={[{ height: 50, width: 50, marginTop: 60 }]} resizeMode='contain' />
          </View>
          <View style={[
            { flexDirection: 'row', width: '95%', alignSelf: 'center', borderRadius: 6, paddingTop: 10 }]}>
            <TouchableOpacity onPress={() => { }}>
              {

                <CustomCircularImageView
                  onPressImageClick={() => { }}
                  source={
                    userImage !== undefined && userImage !== null
                      ? networkStatus
                        ? userImage.toString().includes("https:") ||
                          userImage.toString().includes("http:")
                          ? { uri: userImage }
                          : require("../src/assets/images/profileIcon.png")
                        : {
                          uri: "file://" + userImage.toString().trim(),
                        }
                      : require("../src/assets/images/profileIcon.png")
                  }
                  size={30}
                  badgeIcon={null}
                  stylesOfBadge={{ height: 30, width: 30, resizeMode: "contain", position: "absolute", bottom: -responsiveWidth(2.5), left: responsiveWidth(3) }}
                  height={40} />

              }
            </TouchableOpacity>

            <View style={[{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', }]}>
              <TouchableOpacity
                style={{ marginLeft: 4 }}
                onPress={() => { }}>
                <Text style={[{ fontSize: 10, fontFamily: FontForWeight('regular'), textAlign: 'left', color: dynamicStyles.secondaryColor }]}>{greet}</Text>
                <Text style={[{ fontSize: 11, fontFamily: FontForWeight('SemiBold'), textAlign: 'left', minWidth: 80, color: dynamicStyles.secondaryColor }]}
                  numberOfLines={2}
                  ellipsizeMode="tail">{`${userName != null ? userName : ''}`}</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                position: 'absolute',
                right: 50,
                top: Platform.OS === 'android' ? -20 : 0,
              }}
            >
              <TouchableOpacity style={{
                marginTop: Platform.OS === 'ios' ? 15 : 35,
                marginLeft: 20,
              }} onPress={() => {
                networkStatus ? setRefreshButtonClicked(true) : SimpleToast.show(translate('no_internet_conneccted'))
              }}>
                <Image style={[{ tintColor: dynamicStyles.secondaryColor }, { height: 30, width: 30, resizeMode: "contain" }]} source={require('../src/assets/images/dataRefresh.png')}></Image>
              </TouchableOpacity>
            </View>

            {notificationVisible && (
              <View
                style={{
                  position: 'absolute',
                  right: 10,
                  top: Platform.OS === 'android' ? -20 : 0,
                }}
              >
                <TouchableOpacity
                  style={{
                    marginTop: Platform.OS === 'ios' ? 15 : 35,
                    marginLeft: 20,
                  }}
                  onPress={notificationBtnClicked}
                >
                  <Image
                    style={{
                      width: 25,
                      height: 25,
                      tintColor: dynamicStyles.secondaryColor,
                    }}
                    source={require('../src/assets/images/notification.png')}
                    resizeMode="contain"
                  />

                  {(notificationCount !== undefined &&
                    notificationCount !== null &&
                    notificationCount !== "" &&
                    Number(notificationCount) > 0) && (
                      <View style={stylesheetStyles.circle} />
                    )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ImageBackground>
      </View>
    )
  }

  const showPermissionDeniedAlert = () => {
    Alert.alert(
      translate('Location_Permission_Required'),
      translate("deny_desc"),
      [
        { text: translate('open_settings'), onPress: () => Linking.openSettings() },
        { text: translate('storagePermissionNegative'), style: 'cancel' },
      ]
    );
  };

  const cloudBtnClicked = async () => {
    if (networkStatus) {
      try {

        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: translate("Location_Permission"),
              message: translate('need_to_access'),
              buttonNeutral: translate('storagePermissionNeutral'),
              buttonNegative: translate('storagePermissionNegative'),
              buttonPositive: translate("storagePermissionPositive")
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Location permission granted");
            // GetUserLocation();
            navigation.navigate('WeatherScreen', { enablePestForecast: false })
          } else {
            console.log("Location permission denied");
            showPermissionDeniedAlert();
          }
        } else {
          const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          const permission = status.trim();
          if (permission === RESULTS.GRANTED || permission === RESULTS.LIMITED) {
            console.log("iOS location permission granted");
            // GetUserLocation();
            navigation.navigate(screenName, { enablePestForecast: enableOrNot })
          } else {
            console.log("iOS location permission denied");
            showPermissionDeniedAlert();
          }
        }

      } catch (err) {
        console.warn(err, "<--------");
      }
    }
    else {
      SimpleToast.show(translate('no_internet_conneccted'))
    }
  }

  const renderWeatherCard = () => {
    return (
      <TouchableOpacity onPress={() => { cloudBtnClicked() }} activeOpacity={0.5} style={stylesheetStyles.container}>
        <View style={stylesheetStyles.tempContainer}>
          {weatherInfo?.max_temp ? (
            <View style={stylesheetStyles.tempWrapper}>
              <Text style={[{ fontSize: 34, fontFamily: FontForWeight('SemiBold'), color: dynamicStyles.textColor }]}>
                {Math.round(weatherInfo?.max_temp)}
              </Text>
              <Text style={[stylesheetStyles.degreeText, { fontSize: 12, fontFamily: FontForWeight('regular'), color: dynamicStyles.textColor }]}>{"°c"}</Text>
            </View>
          ) : (
            <Text style={[{ fontSize: 34, fontFamily: FontForWeight('SemiBold'), color: dynamicStyles.textColor }]}>
              {'--'}
            </Text>
          )}

          <View style={stylesheetStyles.rangeContainer}>
            {weatherInfo?.max_temp ? (
              <View style={stylesheetStyles.tempWrapper}>
                <Text style={[stylesheetStyles.rangeText, { fontSize: 13, fontFamily: FontForWeight('regular') }, Platform.OS === 'ios' && { lineHeight: 25 }]}>
                  {`${translate('High')} ${Math.round(weatherInfo?.max_temp)}`}
                </Text>
                <Text style={[stylesheetStyles.degree2Text, { fontSize: 13, fontFamily: FontForWeight('regular') }]}>{"°"}</Text>
              </View>
            ) : (
              <Text style={[stylesheetStyles.rangeText, { fontSize: 34, fontFamily: FontForWeight('SemiBold') }]}>
                {'--'}
              </Text>
            )}
            {weatherInfo?.min_temp ? (
              <View style={stylesheetStyles.tempWrapper}>
                <Text style={[stylesheetStyles.rangeText, { fontSize: 13, fontFamily: FontForWeight('regular') }, Platform.OS === 'ios' && { lineHeight: 25 }]}>
                  {`${translate('Low')} ${Math.round(weatherInfo?.min_temp)}`}
                </Text>
                <Text style={[stylesheetStyles.degree2Text, { fontSize: 13, fontFamily: FontForWeight('regular') }]}>{"°"}</Text>
              </View>
            ) : (
              <Text style={[{ fontSize: 34, fontFamily: FontForWeight('SemiBold'), color: '#d3d3d3' }]}>
                {'--'}
              </Text>
            )}
          </View>
        </View>
        <View style={stylesheetStyles.divider} />

        <View style={stylesheetStyles.iconContainer}>
          <Image source={{ uri: weatherInfo?.image }} style={stylesheetStyles.weatherIcon} />
          <View>
            <View style={stylesheetStyles.locationContainer}>
              <Image source={require('../src/assets/images/weatherScreen/locationImg.png')} style={stylesheetStyles.locationIcon} />
              <Text numberOfLines={1} ellipsizeMode='tail'
                style={[stylesheetStyles.locationText, { fontSize: 12, fontFamily: FontForWeight('SemiBold'), color: dynamicStyles.textColor }]}>
                {(weatherInfo?.city) || '--'}
              </Text>
            </View>
            <View style={stylesheetStyles.weatherDescription}>
              <Text style={[stylesheetStyles.weatherDescText, { fontSize: 12, fontFamily: FontForWeight('SemiBold') }]}>
                {weatherInfo?.weather_description || "--"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const onMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const itemWidth = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(offsetX / itemWidth);
    setCurrentIndex(index); // update with manual scroll
    setIsManual(true);

    // Resume auto scroll after short delay
    setTimeout(() => setIsManual(false), 5000); // 👈 resume auto after 5s
  };

  const onPressCarouselButton = (item) => {
    console.log('Carousel button pressed for item:', item);
    if (item?.navigationTo != null && item?.navigationTo != undefined, item?.navigationTo?.length > 0) {
      navigation.navigate(item?.navigationTo, { data: item })
    }
    else {
      if (item?.urlPath) {
        setMediaLink(item?.urlPath)
        setMediaVisible(true)
      }
      else {
        SimpleToast.show(translate('invalid_file_format'))
      }
    }
  }

  const renderCarouseItem = ({ item, index }) => {
    return (
      <View>
        {item?.fileName?.length > 0 &&
          item?.fileName?.[0]?.imageUrl &&
          typeof item?.fileName?.[0]?.imageUrl === "string" && (
            <View
              style={[
                stylesheetStyles.card,
                index === carouselData?.length - 1 && { marginRight: 15 },
              ]}
            >
              <Image
                source={
                  item.fileName[0].imageUrl.startsWith("http")
                    ? { uri: item.fileName[0].imageUrl }
                    : { uri: "file://" + item.fileName[0].imageUrl }
                }
                style={stylesheetStyles.image}
              />

              {item?.buttonEnable && (
                <TouchableOpacity
                  onPress={() =>
                    onPressCarouselButton(item)
                  }
                  activeOpacity={0.5}
                  style={[
                    stylesheetStyles.button,
                    { backgroundColor: dynamicStyles.primaryColor },
                  ]}
                >
                  <Text
                    style={[
                      stylesheetStyles.buttonText,
                      { color: dynamicStyles.secondaryColor, fontSize: 10, fontFamily: FontForWeight('Bold') },
                    ]}
                  >
                    {item?.buttonName}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
      </View>

    );
  };

  const getCarouselUi = () => {
    return (
      <FlatList
        ref={flatListRef}
        data={carouselData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCarouseItem}
        onMomentumScrollEnd={onMomentumScrollEnd}

        getItemLayout={(data, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}

        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 300);
        }}
      />
    );
  };

  const tabBarUI = () => {
    return (
      <View style={stylesheetStyles.tabBar}>

        <TouchableOpacity
          onPress={async () => {
            // navigation.navigate('EmpScanHistory', { roleid: (await retrieveData(ROLEID)) })
            // return
            serviceMenuList?.length > 0 ? setServiceModal(true) : SimpleToast.show(translate('no_data_available'))
          }}
          style={{
            height: 50,
            width: '95%',
            backgroundColor: dynamicStyles.primaryColor,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            bottom: secondaryScannerVisible ? 110 : 90,
            alignSelf: "center"
          }}
        >
          <Text style={{ color: dynamicStyles.secondaryColor, fontSize: 14, fontWeight: 'bold', lineHeight: 22 }}>
            {translate("retailer_services")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={stylesheetStyles.iconTouch}
          onPress={() => { }}>
          <Image source={
            require('../src/assets/images/tabBar/tabOne.png')
          } style={[stylesheetStyles.iconn, { tintColor: dynamicStyles.iconPrimaryColor }]} />
          <Text style={[stylesheetStyles.tabLabel, { fontSize: 10, fontFamily: FontForWeight('regular'), color: dynamicStyles.iconPrimaryColor }]}>
            {translate('Home')}
          </Text>
        </TouchableOpacity>



        {secondaryScannerVisible &&
          <TouchableOpacity onPress={() => requestPermissionsProductScan()}
            style={[stylesheetStyles.scanButton, {
              backgroundColor: dynamicStyles.primaryColor,
            }]}>
            <Image source={
              require('../src/assets/images/tabBar/scan.png')
            } style={[stylesheetStyles.iconn, { tintColor: dynamicStyles.secondaryColor }]} />
          </TouchableOpacity>}


        <TouchableOpacity
          style={stylesheetStyles.iconTouch}
          onPress={() => moreMenuList?.length > 0 ? setMoreModal(true) : SimpleToast.show(translate('no_data_available'))}>
          <Image source={
            require('../src/assets/images/more_ic.png')
          } style={stylesheetStyles.iconn3} />
          <Text style={[stylesheetStyles.tabLabel, { fontSize: 10, fontFamily: FontForWeight('regular'), color: dynamicStyles.iconPrimaryColor }]}>
            {translate('more')}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  const renderActivityItem = ({ item }) => (
    <View style={stylesheetStyles.summaryItem}>
      {item.imageUrl ? (
        <View style={stylesheetStyles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={stylesheetStyles.summaryImage}
          // resizeMode="contain"
          />
        </View>
      ) : (
        <View style={stylesheetStyles.summaryImagePlaceholder} />
      )}
      <View style={stylesheetStyles.summaryTextWrap}>
        <Text style={stylesheetStyles.summaryCount}>{item.itemCount}</Text>
        <Text style={stylesheetStyles.summaryLabel}>{item.itemName}</Text>
      </View>
    </View>
  );

  // ─── Crop Insights ─────────────────────────────────────────────────────────
  // Fields used: item.id, item.imageUrl, item.itemName (kgs), item.itemCount (coupon)
  const renderCropItem = ({ item }) => (
    <View style={stylesheetStyles.cropItem}>
      {item.imageUrl ? (
        <View style={stylesheetStyles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={stylesheetStyles.cropImage}
          // resizeMode="contain"
          />
        </View>
      ) : (
        <View style={stylesheetStyles.cropImagePlaceholder} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={stylesheetStyles.cropKg}>{item.itemName}</Text>
        <Text style={stylesheetStyles.cropCoupon}>{item.itemCount}</Text>
        <Text style={stylesheetStyles.couponCount}>{item.couponCount}</Text>
      </View>
    </View>
  );

  const handlePopupAction = async (data, btnNumber) => {
    console.log("clicked===>:", JSON.stringify(data) + " " + btnNumber);
    if (btnNumber == 1) {
      // Handle button 1 action
      await onPressDashboardItem(data)
    }
    else if (btnNumber == 2) {
      // Handle button 2 action
      await onPressDashboardItem(data)
    }
    setPopupVisible(false);

  };

  const renderCalculatorOptions = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={calculatorOptions}
        onRequestClose={() => {
          setSelectedCalc(null)
          setCalculatorOptions(!calculatorOptions);
        }}>
        <View style={stylesheetStyles.centeredView}>
          <View style={stylesheetStyles.modalView}>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: 10
            }}>
              <Text style={[{
                fontSize: 21,
                fontFamily: FontForWeight('SemiBold')
              }, stylesheetStyles.modalText]}>{translate('select')}</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCalc(null)
                  setCalculatorOptions(!calculatorOptions)
                }
                }>
                <Image source={require('../src/assets/images/crossMark.png')} style={{ tintColor: dynamicStyles.iconPrimaryColor, height: 20, width: 20, resizeMode: "contain" }} />
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", alignSelf: "center", width: responsiveWidth(90) }}>
              <View style={{ alignItems: "center", justifyContent: "center", marginHorizontal: 3.5, width: '30%', }}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCalc(dummyCalculatorData[2])
                    setTimeout(() => {
                      navigateMe(dummyCalculatorData[2])
                    }, 500)
                  }}
                  style={[
                    selectedCalc?.title === dummyCalculatorData[2]?.title && { borderColor: dynamicStyles.primaryColor, borderWidth: 1 },
                    {
                      height: height * 0.09, width: width * 0.19, backgroundColor: "rgba(0, 0, 0, 0.03)", borderRadius: 10, alignItems: "center", justifyContent: "center"
                    }]}>
                  <Image source={dummyCalculatorData[2]?.image} style={{
                    height: 40, width: 40, resizeMode: "contain"
                  }} />
                </TouchableOpacity>
                <Text style={[
                  selectedCalc?.title === dummyCalculatorData[2]?.title ? { color: dynamicStyles.primaryColor } : { color: dynamicStyles.textColor },
                  {
                    fontSize: 9,
                    fontFamily: FontForWeight('SemiBold'),
                    marginTop: 5, textAlign: "center"
                  }]}
                  numberOfLines={2} ellipsizeMode='tail'
                >{dummyCalculatorData[2]?.title}</Text>
              </View>
              <View style={{ alignItems: "center", justifyContent: "center", marginHorizontal: 3.5, width: '30%' }}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCalc(dummyCalculatorData[0])
                    setTimeout(() => {
                      navigateMe(dummyCalculatorData[0])
                    }, 500)
                  }}
                  style={[selectedCalc?.title === dummyCalculatorData[0]?.title && { borderColor: dynamicStyles.primaryColor, borderWidth: 1 }, {
                    height: height * 0.09, width: width * 0.19, backgroundColor: "rgba(0, 0, 0, 0.03)", borderRadius: 10, alignItems: "center", justifyContent: "center"
                  }]}>
                  <Image source={dummyCalculatorData[0]?.image} style={{
                    height: 40, width: 40, resizeMode: "contain"
                  }} />
                </TouchableOpacity>
                <Text style={[
                  selectedCalc?.title === dummyCalculatorData[0]?.title ? { color: dynamicStyles.primaryColor } : { color: dynamicStyles.textColor },
                  { marginTop: 5, fontSize: 9, fontFamily: FontForWeight('SemiBold') }]}
                  numberOfLines={1} ellipsizeMode='tail'
                >{dummyCalculatorData[0]?.title}</Text>
              </View>
              <View style={{ alignItems: "center", justifyContent: "center", marginHorizontal: 3.5, width: '30%' }}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCalc(dummyCalculatorData[1])
                    setTimeout(() => {
                      navigateMe(dummyCalculatorData[1])
                    }, 500)
                  }}
                  style={[
                    selectedCalc?.title === dummyCalculatorData[1]?.title && { borderColor: dynamicStyles.primaryColor, borderWidth: 1 },
                    {
                      height: height * 0.09, width: width * 0.19, backgroundColor: "rgba(0, 0, 0, 0.03)", borderRadius: 10, alignItems: "center", justifyContent: "center"
                    }]}>
                  <Image source={dummyCalculatorData[1]?.image} style={{
                    height: 40, width: 40, resizeMode: "contain"
                  }} />
                </TouchableOpacity>
                <Text style={[
                  selectedCalc?.title === dummyCalculatorData[1]?.title ? { color: dynamicStyles.primaryColor } : { color: dynamicStyles.textColor },
                  { marginTop: 5, fontSize: 9, fontFamily: FontForWeight('SemiBold'), }]}
                  numberOfLines={1} ellipsizeMode='tail'
                >{dummyCalculatorData[1]?.title}</Text>
              </View>
            </View>

          </View>
        </View>
      </Modal>
    )
  }

  const navigateMe = (item) => {
    switch (item.title) {
      case translate('YieldCalculator'):
        setCalculatorOptions(!calculatorOptions)
        navigation.navigate('YieldCalculator', { calcType: item.title })
        setSelectedCalc(null)
        break;
      case translate('FertilizerCalculator'):
        setCalculatorOptions(!calculatorOptions)
        navigation.navigate('FertilizerCalculator', { calcType: item.title })
        setSelectedCalc(null)
        break;
      case translate('SeedPopulationCalculator'):
        setCalculatorOptions(!calculatorOptions)
        navigation.navigate('SeedCalculator', { calcType: item.title })
        setSelectedCalc(null)
        break;

      default:
        break;
    }
  }

  return (
    <View style={[{ width: '100%', height: '100%', backgroundColor: Colors.very_light_grey }]}>
      {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
      {console.log("weatherInfo", weatherInfo)}
      {headerSec()}
      {weatherIsVisible && weatherInfo &&
        <View style={[{ marginTop: 50, width: '100%', alignSelf: 'center', backgroundColor: 'red' }]}>
          {renderWeatherCard()}
        </View>}

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 160, // IMPORTANT: space for button + tab bar
        }}>
        <View>

          {showCarouselCard && carouselData?.length > 0 &&
            <View style={[{ marginTop: weatherIsVisible ? 10 : 120, width: '100%', alignSelf: 'center' }]}>
              {getCarouselUi()}
            </View>}

          <View
            style={[
              stylesheetStyles.whiteCard,
              { marginTop, minHeight: 210 }
            ]}
          >
            {summaryLoading ? (
              <View style={stylesheetStyles.cardLoader}>
                <ActivityIndicator
                  size="large"
                  color={dynamicStyles.primaryColor}
                />
              </View>
            ) : (
              <>
                <View>
                  <View style={stylesheetStyles.sectionHeader}>
                    <Text style={stylesheetStyles.sectionTitle}>
                      {translate('ActivitySummary')}
                    </Text>

                    <View style={{ alignSelf: 'flex-end' }}>
                      {activitySummaryList?.length > 0 && (
                        <TouchableOpacity
                          style={stylesheetStyles.dropdownBtn}
                          onPress={() => setProgramDropdownOpen(v => !v)}
                          activeOpacity={0.8}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={stylesheetStyles.dropdownText}>
                              {selectedProgram?.displayName}
                            </Text>
                            <Image
                              style={{
                                width: 14,
                                height: 8,
                                tintColor: 'black',
                                marginLeft: 8
                              }}
                              source={require('../src/assets/images/grayDownArrow.png')}
                            />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {programDropdownOpen && (
                    <View style={stylesheetStyles.dropdownMenu}>
                      {programsList.map(p => (
                        <TouchableOpacity
                          key={p.id}
                          style={stylesheetStyles.dropdownOption}
                          onPress={() => {
                            isManualProgramChange.current = true;
                            setSelectedProgram(p);
                            setProgramDropdownOpen(false);
                          }}
                        >
                          <Text
                            style={[
                              stylesheetStyles.dropdownOptionText,
                              p.id === selectedProgram.id &&
                              stylesheetStyles.dropdownOptionActive,
                            ]}
                          >
                            {p.displayName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  <FlatList
                    data={activitySummaryList}
                    keyExtractor={item => String(item.id)}
                    numColumns={2}
                    scrollEnabled={false}
                    renderItem={renderActivityItem}
                    columnWrapperStyle={stylesheetStyles.twoColRow}
                    ListEmptyComponent={
                      <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <Text
                          style={{
                            color: dynamicStyles.textColor,
                            fontSize: 13,
                            fontFamily: FontForWeight('SemiBold')
                          }}
                        >
                          {translate('no_data_available_en')}
                        </Text>
                      </View>
                    }
                  />
                </View>

                <View>
                  <View style={stylesheetStyles.sectionHeader}>
                    <Text style={stylesheetStyles.sectionTitle}>
                      {translate('CropInsights')}
                    </Text>
                  </View>

                  <FlatList
                    data={cropInsightsList}
                    keyExtractor={item => String(item.id)}
                    numColumns={2}
                    scrollEnabled={false}
                    renderItem={renderCropItem}
                    columnWrapperStyle={stylesheetStyles.twoColRow}
                    ListEmptyComponent={
                      <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <Text
                          style={{
                            color: dynamicStyles.textColor,
                            fontSize: 13,
                            fontFamily: FontForWeight('SemiBold')
                          }}
                        >
                          {translate('no_data_available_en')}
                        </Text>
                      </View>
                    }
                  />
                </View>
              </>
            )}
          </View>
        </View>

      </ScrollView>



      {/* Fixed Bottom Tab Bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          backgroundColor: '#fff',
          elevation: 10, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          zIndex: 999,
        }}
      >
        {tabBarUI()}
      </View>

      {calculatorOptions && renderCalculatorOptions()}

      {
        showAlert &&
        <CustomAlert
          onPressClose={() => { handleCancelAlert() }}
          title={alertTitle}
          showHeader={showAlertHeader}
          showHeaderText={showAlertHeaderText}
          message={alertMessage}
          onPressOkButton={() => { handleOkAlert() }}
          onPressNoButton={() => { handleCancelAlert() }}
          showYesButton={showAlertYesButton}
          showNoButton={showAlertNoButton}
          yesButtonText={showAlertyesButtonText}
          noButtonText={showAlertNoButtonText} />

      }


      <MediaModal
        visible={mediaVisible}
        link={mediaLink}
        onClose={() => setMediaVisible(false)}
        loaderColor={dynamicStyles.primaryColor}
      />

      <RetailerServicesModal
        visible={serviceModal}
        data={serviceMenuList}
        onClose={() => setServiceModal(false)}
        onItemPress={(item) => {
          console.log("Clicked:", item);
          onPressDashboardItem(item)
          setServiceModal(false);
        }}
      />

      <RetailerServicesModal
        visible={moreModal}
        data={moreMenuList}
        onClose={() => setMoreModal(false)}
        onItemPress={(item) => {
          console.log("Clicked:", item);
          onPressDashboardItem(item)
          setMoreModal(false);
        }}
      />

      <EmployeeActivityAlertModal
        visible={popupVisible}
        data={popupData}
        onClose={() => setPopupVisible(false)}
        onButtonPress={handlePopupAction}
      />

      {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
      {successLoading && <CustomSuccessLoader loading={successLoading} message={successLoadingMessage} />}
    </View >
  )
}

const stylesheetStyles = StyleSheet.create({
  title: {
    width: '50%',
    color: "rgba(255, 255, 255, 1)",
    position: "absolute"
  },
  circle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 177, 122, 1)',
    position: 'absolute',
    right: -2,
    top: -2,
    zIndex: 999,
  },
  leafHome: {
    height: 250,
    width: 250,
    resizeMode: "contain",
    position: "absolute",
    right: -60,
    // tintColor:"transparent"
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: responsiveHeight(12),
    width: "90%",
    backgroundColor: "white",
    alignSelf: "center",
    borderRadius: 10,
    marginVertical: 15,
    paddingHorizontal: 10,
    elevation: 5
  },
  tempContainer: {
    width: "40%"
  },
  tempWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  rangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    marginTop: Platform.OS === 'ios' ? 0 : 0,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginLeft: 10
  },
  tempText: { marginHorizontal: 5 },
  degreeText: { marginLeft: 2 },
  weatherIcon: { width: 50, height: 50, resizeMode: "contain", marginLeft: 2, marginRight: 10 },
  weatherDescription: { marginLeft: 5, marginTop: 1 },
  weatherDescText: { color: 'rgba(255, 181, 1, 1)', textTransform: 'capitalize', marginEnd: 5 },
  leftLeaf: {
    height: 200,
    width: 200,
    resizeMode: "contain",
    position: "absolute",
    left: -40,
  },
  divider: { width: 1, height: '60%', backgroundColor: '#d3d3d3', marginLeft: 5 },
  degree2Text: { color: '#d3d3d3', marginTop: -5 },
  rangeText: { color: '#d3d3d3' },
  locationContainer: { flexDirection: 'row', alignItems: 'center' },
  locationIcon: { width: 20, height: 20, resizeMode: "contain" },
  locationText: { marginLeft: 5, width: '70%' },

  image: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    position: "relative",
    // backgroundColor: 'rgba(52, 52, 52, 0.8)',
  },
  imageStyle: {
    borderRadius: 15,
  },
  button: {
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 15,
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  buttonText: {
    color: Platform.OS == 'android' ? "white" : "#fff",
  },
  card: {
    width: width * 0.85,
    height: height * 0.185,
    borderRadius: 15,
    overflow: "hidden",
    marginLeft: 15
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Platform.OS == 'android' ? "white" : '#F8F8F8',
    paddingVertical: 8,
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  iconTouch: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 70,
  },
  iconn: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  iconn3: {
    height: 20,
    width: 50,
    resizeMode: 'contain',
  },
  tabLabel: {
    color: '#f28c38',
    textAlign: 'center',
    flexWrap: 'wrap',
    width: '100%',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  scanButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    height: 60,
    width: 60,
    position: 'relative',
    top: -40,
  },
  // White card
  whiteCard: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 12,
    borderRadius: 16,
    padding: 10,
  },

  sectionHeader: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111' },

  // Program dropdown
  dropdownBtn: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  dropdownText: { fontSize: 14, color: '#333' },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#ddd',
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  dropdownOption: { paddingVertical: 10, paddingHorizontal: 14 },
  dropdownOptionText: { fontSize: 13, color: '#444' },
  dropdownOptionActive: { color: '#E53935', fontWeight: '600' },
  imageContainer: {
    width: 36,
    height: 36,
    // borderRadius: 18,
    overflow: 'hidden', // 🔥 this is key
  },

  summaryItem: {
    width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fafafa', borderRadius: 10,
    padding: 10, borderWidth: 0.5, borderColor: '#eee',
  },
  summaryImage: {
    width: '100%',
    height: '100%',
  },
  summaryImagePlaceholder: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#E3F2FD' },
  summaryTextWrap: { flex: 1 },
  summaryCount: { fontSize: 14, fontWeight: '700', color: '#000000' },
  summaryLabel: { fontSize: 12, color: '#000000', marginTop: 1 },

  // cropInsightsList — imageUrl / itemName / itemCount
  cropItem: {
    width: '48%', flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fafafa', borderRadius: 10,
    padding: 10, borderWidth: 0.5, borderColor: '#eee',
  },
  cropImage: { width: 34, height: 34 },
  cropImagePlaceholder: { width: 34, height: 34, borderRadius: 6, backgroundColor: '#E8F5E9' },
  cropKg: { fontSize: 13, fontWeight: '700', color: '#111' },
  cropCoupon: { fontSize: 12, fontFamily: FontForWeight('SemiBold'), color: '#000000', marginTop: 2 },
  couponCount: {
    fontSize: 11,
    color: '#000000',
    marginTop: 2,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  twoColRow: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalText: {
    textAlign: "center",
    color: "rgba(0, 0, 0, 1)",
  },
  modalView: {
    width: responsiveWidth(100),
    // margin: 20,
    backgroundColor: 'white',
    // borderTopRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginTop: "auto"
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#000000d6"
  },
  cardLoader: {
    flex: 1,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default EmployeeDashboardSDK;