import React, { useEffect, useMemo, useRef, useState } from "react";
import { Styles } from "../assets/style/styles";
import { BuildStyleOverwrite } from "../assets/style/BuildStyle";
import { View, Image, Text, TouchableOpacity, FlatList, ScrollView, Modal, Platform, StatusBar } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Colors } from "../assets/Utils/Color";
import { strings } from "../strings/strings";
import CustomInputDropDown from "../Components/CustomInputDropDown";
import CustomButton from "../Components/CustomButton";
import { GetApiHeaders, GetRequest, PostRequest, getNetworkStatus } from "../NetworkUtils/NetworkUtils";
import SimpleToast from "react-native-simple-toast";
import CustomLoader from "../Components/CustomLoader";
import { HTTP_OK, configs } from "../helpers/URLConstants";
import CustomListViewModal from "../Modals/CustomListViewModal";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { useSelector } from "react-redux";
import { filterArrayOfObjects2, filterObjects } from "../assets/Utils/Utils";
import CustomCalanderSelection from "../Components/CustomCalanderSelection";
import { translate } from "../Localisation/Localisation";
import { createStyles } from "../assets/style/createStyles";
import { getCompanyStyles } from "../redux/store/slices/CompanyStyleSlice";

var styles = BuildStyleOverwrite(Styles);

const records_per_page = 10;

function EmpScanHistory({ route }) {
    styles = useMemo(() => createStyles(), [global.selectedLanguageCode]);
    const companyStyle = useSelector(getCompanyStyles);
    const [dynamicStyles, setDynamicStyles] = useState(companyStyle.value);
    const navigation = useNavigation();
    const [totalPoints, setTotalPoints] = useState('0');
    const roleID = route?.params?.roleid;
    const [loaderImage, setLoaderImage] = useState(require('../assets/images/neutralloader.gif'))
    const networkStatus = useSelector(state => state.networkStatus.value)
    const [dropDownData, setdropDownData] = useState();
    const [showDropDowns, setShowDropDowns] = useState(false)
    const [dropDownType, setDropDownType] = useState("");
    const [selectedDropDownItem, setSelectedDropDownItem] = useState("");


    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setDatePicker] = useState(false);
    const [minimumDate, setMinDate] = useState();
    const [maximumDate, setMaxDate] = useState();
    const [scanHistoryData, setScanHistoryData] = useState([])
    const [scanHistoryDataDummy, setScanHistoryDataDummy] = useState([])
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isSelectingFromDate, setIsSelectingFromDate] = useState(true);
    const [showCouponDetails, setShowCouponDetails] = useState(false)
    const [numberOfRecords, setNumberOfRecords] = useState(0);
    const [numberOfPages, setNumberOfPages] = useState(0);
    const [itemClicked, setItemClicked] = useState({})
    const [pagesArray, setPagesArray] = useState([])
    const [selectedPageIndex, setSelectedPageIndex] = useState(0);
    const [showCropData, setShowCropData] = useState(true)
    const [showProductData, setShowProductData] = useState(false)
    const [showScanData, setShowScanData] = useState(false)
    const [cropHistoryData, setCropHistoryData] = useState([])
    const [productsHistoryData, setProductsHistoryData] = useState([])
    const [cropName, setCropName] = useState('')
    const [cropId, setCropId] = useState('')
    const [productName, setProductName] = useState('')
    const [productId, setProductId] = useState('')
    const [bonusPoints, setBonusPoints] = useState(0)
    const [productItem, setProductItem] = useState({})
    const [retailerSelected, setRetailerSelected] = useState('')
    const [retailerSelectedId, setRetailerSelectedId] = useState(0)
    const [retailerMaster, setRetailerMaster] = useState([]);
    const [activeRetilerCount, setActiveRetilerCount] = useState('');
    const [signUpBonusPoints, setSignUpBonusPoints] = useState(0)
    const [key, setKey] = useState(1);
    const [statesMasterOriginal, setStatesMasterOriginal] = useState([])
    const [stateSelectedName, setStateSelectedName] = useState('')
    const [stateSelectedId, setStateSelectedId] = useState(0)

    const [districtsMasterOriginal, setDistrictsMasterOriginal] = useState([])
    const [districtsMasterFilter, setDistrictsMasterFilter] = useState([])
    const [districtSelectedName, setDistrictSelectedName] = useState('')
    const [districtSelectedId, setDistrictSelectedId] = useState(0)

    const [subDistrictsMasterOriginal, setSubDistrictsMasterOriginal] = useState([])
    const [subDistrictsMasterFilter, setSubDistrictsMasterFilter] = useState([])
    const [subDistrictSelectedName, setSubDistrictSelectedName] = useState('')
    const [subDistrictSelectedId, setSubDistrictSelectedId] = useState(0)


    const [villageMaster, setVillageMaster] = useState([])
    const [villageSelectedName, setVillageSelectedName] = useState('')
    const [villageSelectedId, setVillageSelectedId] = useState(0)


    const [loadingCount, setLoadingCount] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('');
    const flatListRef = useRef(null);

    const startLoading = (msg = '') => {
        setLoadingMessage(msg);
        setLoadingCount(prev => prev + 1);
    };

    const stopLoading = () => {
        setLoadingCount(prev => Math.max(prev - 1, 0));
    };

    const loading = loadingCount > 0;

    useEffect(() => {
        if (subDistrictSelectedId != 0 || villageSelectedId != 0) {
            callVillageRetailerApiMaster(subDistrictSelectedId, villageSelectedId)
        }

    }, [subDistrictSelectedId, subDistrictSelectedName, villageSelectedName, villageSelectedId])


    useEffect(() => {
        if (statesMasterOriginal?.length == 1) {
            onSelectedState(statesMasterOriginal[0])
        }
    }, [statesMasterOriginal])

    useEffect(() => {
        if (districtsMasterFilter?.length == 1) {
            onSelectedDistrict(districtsMasterFilter[0])
        }
    }, [districtsMasterFilter])

    useEffect(() => {

    }, [numberOfPages, pagesArray])

    useEffect(() => {

    }, [selectedPageIndex])

    useFocusEffect(
        React.useCallback(() => {
            handleFocus();
            return () => {
                console.log('Screen is no longer focused!');
            };
        }, [])
    );

    useEffect(() => {

        console.log("showCropData", showCropData)
        console.log("showProductData", showProductData)
        console.log("showScanData", showScanData)

    }, [showCropData, showProductData, showScanData])

    const handleFocus = () => {
        console.log('Screen is focused!');
        if (networkStatus) {
            getFilterDropDown();
            submitButtonPress()
        }
    };


    const goBack = async () => {
        navigation.goBack()
    };

    const callVillageRetailerApiMaster = async (subDistrictSelectedId = "0", villageSelectedId = "0") => {
        var networkStatus = await getNetworkStatus()

        if (!networkStatus) return;
        startLoading(translate('please_wait_getting_data'));

        try {

            var villageRetURL = configs.BASE_URL + configs.EMPLOYEEDASHBOARD.VILLAGE_RETAILER_MASTER;
            var getHeaders = await GetApiHeaders();

            var inputRequest = {
                "subDistrictId": subDistrictSelectedId,
                "villageId": villageSelectedId,
                "roleId": roleID
            }
            console.log('url is', villageRetURL)
            console.log('getHeaders is', getHeaders)
            console.log('inputRequest', inputRequest)

            var APIResponse = await PostRequest(villageRetURL, getHeaders, inputRequest);
            console.log('the dropdown Resp is001', JSON.stringify(APIResponse))
            if (APIResponse.statusCode == HTTP_OK) {
                var response = APIResponse.response
                console.log("response", response)
                setVillageMaster(response?.villageList);
                setRetailerMaster(response?.retailersList);
            }

        } catch (error) {
            console.log("error", error)
        }
        finally {
            stopLoading()
        }

    }


    const getFilterDropDown = async () => {
        if (!networkStatus) return;
        startLoading(translate('please_wait_getting_data'));

        try {
            var dashboardFilter = configs.BASE_URL + configs.EMPLOYEEDASHBOARD.SCAN_FILTER_HISTORY;
            var getHeaders = await GetApiHeaders();
            var APIResponse = await GetRequest(dashboardFilter, getHeaders);

            if (APIResponse != undefined && APIResponse != null) {

                if (APIResponse.statusCode == HTTP_OK) {

                    var response = APIResponse.response
                    console.log("response", response)
                    setStatesMasterOriginal(response?.statesList);
                    setDistrictsMasterOriginal(response?.districtsList);
                    setSubDistrictsMasterOriginal(response?.subDistrictsList);

                }
                else {
                    SimpleToast.show(APIResponse?.message != null ? APIResponse?.message : translate('something_went_wrong'))
                }
            } else {
                SimpleToast.show(APIResponse?.message != null ? APIResponse?.message : translate('something_went_wrong'))
            }
        } catch (error) {
            console.log("error", error)
        }
        finally {
            stopLoading()
        }

    }

    const submitButtonPress = async () => {

        try {

            startLoading(translate('please_wait_getting_data'));

            const header = await GetApiHeaders();
            const input = {
                userId: header?.userId,
                programName: 0,
                stateId: stateSelectedId?.toString() || '',
                districtId: districtSelectedId?.toString() || '',
                subDistrictId: subDistrictSelectedId?.toString() || '',
                villageId: villageSelectedId?.toString() || '',
                retailerId: retailerSelectedId?.toString() || '',
                fromDate: fromDate ? moment(fromDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
                toDate: toDate ? moment(toDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
            };

            const url = `${configs.BASE_URL}${configs.EMPLOYEEDASHBOARD.FILTER_GET_DETAILS_HISTORY}`;

            console.log("URL =>", url, " Headers =>", header, " Input =>", input);
            const apiResponse = await PostRequest(url, header, input);

            console.log("apiResponse", JSON.stringify(apiResponse))
            setCropHistoryData(apiResponse?.response?.scanHistory);
            setTotalPoints(apiResponse?.response?.totalCashbackEarnedPoints);
            setActiveRetilerCount(apiResponse?.response?.activeRetailers);
            setShowScanData(false);
            setShowProductData(false);
            setShowCropData(true);
            setNumberOfRecords(apiResponse?.response?.count);

            const total_pages = Math.ceil(apiResponse?.response?.count / records_per_page);
            const pagesAr = generateIntegerArray(total_pages);
            setBonusPoints(apiResponse?.response?.bonusPoints);
            setSignUpBonusPoints(apiResponse?.response?.signUpBonusPoints);
            setPagesArray(pagesAr);
            setNumberOfPages(total_pages);
            setKey(prevKey => prevKey + 1);  // Update key to force re-render
            console.log("pagesAr", pagesAr, "--", total_pages);

        } catch (error) {
            console.log("error", error)
        }
        finally {
            stopLoading()
        }
    };


    function generateIntegerArray(n) {
        const result = [];
        for (let i = 1; i <= n; i++) {
            result.push(i);
        }
        return result;
    }

    async function getProductsScanned(item) {
        if (networkStatus) {
            try {
                startLoading(translate('please_wait_getting_data'));
                var header = await GetApiHeaders();
                var input = {

                    userId: header?.userId,
                    productName: "",
                    programName: "",
                    stateId: stateSelectedId?.toString() || '',
                    districtId: districtSelectedId?.toString() || '',
                    subDistrictId: subDistrictSelectedId?.toString() || '',
                    villageId: villageSelectedId?.toString() || '',
                    retailerId: retailerSelectedId?.toString() || '',
                    fromDate: fromDate ? moment(fromDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
                    toDate: toDate ? moment(toDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
                    cropName: item?.cropName,
                    cropId: item?.cropId,
                };

                var url = configs.BASE_URL + configs.QRSCAN.SCANNED_PRODUCTS_EMPLOYEE;

                var apiResponse = await PostRequest(url, header, input);

                console.log("SAINATH", JSON.stringify(apiResponse));
                setNumberOfRecords(apiResponse?.response?.count)
                setProductsHistoryData(apiResponse?.response?.scanHistory)
                setShowCropData(false)
                setShowProductData(true)
            } catch (error) {
                console.log("error", error)
            }
            finally {
                stopLoading()
            }
        }
    }

    async function getScannedHistory(item, page) {

        if (!networkStatus) return;
        startLoading(translate('please_wait_getting_data'));

        try {
            var header = await GetApiHeaders();
            var input = {
                userId: header?.userId,
                stateId: stateSelectedId?.toString() || '',
                districtId: districtSelectedId?.toString() || '',
                subDistrictId: subDistrictSelectedId?.toString() || '',
                villageId: villageSelectedId?.toString() || '',
                retailerId: retailerSelectedId?.toString() || '',
                fromDate: fromDate ? moment(fromDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
                toDate: toDate ? moment(toDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
                productName: item?.productName,
                cropId: cropId,
                itemsPerPage: 10,
                page: page,
                productId: item?.productId,
                fromDate: fromDate != undefined && fromDate != "" ? moment(fromDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
                toDate: toDate != undefined && toDate != "" ? moment(toDate, "DD-MM-YYYY").format("YYYY-MM-DD") : "",
            };
            console.log("SAINATH_PROducts", JSON.stringify(apiResponse));

            var url = configs.BASE_URL + configs.QRSCAN.SCAN_HIS_BY_PRODUCTS_EMPLOYEE;

            var apiResponse = await PostRequest(url, header, input);
            console.log("SAINATH_PROducts", JSON.stringify(apiResponse));
            setNumberOfRecords(apiResponse?.response?.count)
            setScanHistoryData(apiResponse?.response?.scanHistory)
            setScanHistoryDataDummy(apiResponse?.response?.scanHistory)
            setShowCropData(false)
            setShowProductData(false)
            setShowScanData(true)
            const total_pages = Math.ceil(apiResponse?.response?.count / records_per_page);
            const pagesAr = generateIntegerArray(total_pages)
            setPagesArray(pagesAr)
            setNumberOfPages(total_pages)
            setKey(prevKey => prevKey + 1);
        } catch (error) {
            console.log("error", error)
        }
        finally {
            stopLoading()
        }

    }

    function renderScanHistory(item, index) {
        return (
            <TouchableOpacity style={[{ height: 50, width: '100%', borderTopWidth: 0.5, borderColor: '#B4B4B4', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]} key={index.toString()} onPress={() => {
                setShowCouponDetails(true);
                setItemClicked(item)
            }}>
                <View style={[styles['centerItems'], { width: '15%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{(((selectedPageIndex + 1) - 1) * 10) + index + 1}</Text>
                </View>
                {!showScanData && <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_align_center'], styles['font_size_13_semibold'], { color: '#00881E' }]}>{item?.productName}</Text>
                </View>}
                <View style={[styles['centerItems'], { width: showScanData ? '50%' : '35%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{item?.couponCode}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%' }]}>
                    {/* <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{item?.pointsEarned}</Text> */}
                    <Text style={[(item?.creditOrDebit.toLowerCase() == translate('credit').toLowerCase() ? styles['text_color_green'] : styles['text_color_red']), styles['font_size_13_semibold'], styles['text_align_center']]}>{item.creditOrDebit.toLowerCase() == translate('credit').toLowerCase() ? " + " + item.pointsEarned : item.pointsEarned == 0 ? item.pointsEarned : " - " + item.pointsEarned}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    function renderProductsItems(item, index) {
        return (
            <TouchableOpacity style={[{ height: 50, width: '100%', borderTopWidth: 0.5, borderColor: '#B4B4B4', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]} key={index.toString()} onPress={() => {
                setProductId(item.productId)
                setProductName(item.productName)
                getScannedHistory(item, 1)
                setProductItem(item)
            }}>
                <View style={[styles['centerItems'], { width: '15%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{index + 1}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_align_center'], styles['font_size_13_semibold'], { color: '#00881E' }]}>{item.productName}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '35%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{item.noOfBagsScanned}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{item.pointsEarned}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    function renderCropHistoryItem(item, index) {
        return (
            <TouchableOpacity style={[{ height: 50, width: '100%', borderTopWidth: 0.5, borderColor: '#B4B4B4', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]} key={index.toString()} onPress={() => {
                // setShowCropData(false)
                // setShowProductData(true)
                setCropName(item.cropName)
                setCropId(item.cropId)
                getProductsScanned(item)
            }}>
                <View style={[styles['centerItems'], { width: '15%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{index + 1}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_align_center'], styles['font_size_13_semibold'], { color: '#00881E' }]}>{item.cropName}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '35%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{item.noOfBagsScanned}</Text>
                </View>
                <View style={[styles['centerItems'], { width: '25%' }]}>
                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{item.pointsEarned}</Text>
                </View>
            </TouchableOpacity>
        )
    }



    const changeDropDownData = (dropDownData, type, selectedItem) => {
        setShowDropDowns(true);
        setdropDownData(dropDownData);
        setDropDownType(type);
        setSelectedDropDownItem(selectedItem);
    }

    const onSelectedState = async (itemdata) => {
        if (itemdata != null) {
            setStateSelectedId(itemdata?.id)
            setStateSelectedName(itemdata?.name)
            setShowDropDowns(false)
            setDistrictSelectedId("0")
            setDistrictSelectedName(translate('SelectDistrict'))
            setSubDistrictSelectedId("0")
            setSubDistrictSelectedName(translate('select') + " " + translate('sub_district'))
            setVillageSelectedId("0")
            setVillageSelectedName(translate('select') + " " + translate('village'))
            setRetailerSelected(translate('selectRetailerName'))
            setRetailerSelectedId("0")


            console.log('the filter data is district')
            setTimeout(async () => {
                if (itemdata?.id == 0) {
                    var filterList = districtsMasterOriginal
                    setDistrictsMasterFilter(filterList)
                }
                else {
                    var filterList = await filterObjects(districtsMasterOriginal, "stateId", itemdata?.id)
                    setDistrictsMasterFilter(filterList)
                }
            }, 500);
        }
    }
    const onSelectedDistrict = async (itemdata) => {
        if (itemdata != null) {
            console.log("itemdata", itemdata)
            setDistrictSelectedId(itemdata?.id)
            setDistrictSelectedName(itemdata?.name)
            setShowDropDowns(false)
            setSubDistrictSelectedId("0")
            setSubDistrictSelectedName(translate('select') + " " + translate('sub_district'))
            setVillageSelectedId("0")
            setVillageSelectedName(translate('select') + " " + translate('village'))
            setRetailerSelected(translate('selectRetailerName'))
            setRetailerSelectedId("0")


            console.log('the filter data is sub district')
            setTimeout(async () => {
                if (itemdata?.id == 0) {
                    var filterList = subDistrictsMasterOriginal
                    setSubDistrictsMasterFilter(filterList)
                }
                else {
                    var filterList = await filterArrayOfObjects2(subDistrictsMasterOriginal, "districtId", itemdata?.id, "stateId", itemdata?.stateId)
                    console.log("after filter", filterList.length)
                    setSubDistrictsMasterFilter(filterList)
                }
            }, 500);
        }
    }
    const onSelectedSubDistrict = async (itemdata) => {
        if (itemdata != null) {
            setSubDistrictSelectedId(itemdata?.id)
            setSubDistrictSelectedName(itemdata?.name)
            setShowDropDowns(false)
            setVillageSelectedId("0")
            setVillageSelectedName(translate('select') + " " + translate('village'))
            setRetailerSelected(translate('selectRetailerName'))
            setRetailerSelectedId("0")
        }
    }
    const onSelectedVillage = async (itemdata) => {
        if (itemdata != null) {
            setVillageSelectedId(itemdata?.id)
            setVillageSelectedName(itemdata?.name)
            setShowDropDowns(false)

            setRetailerSelected(translate('selectRetailerName'))
            setRetailerSelectedId("0")
        }
    }
    const onSelectedRetailerName = async (itemdata) => {
        if (itemdata != null) {
            setRetailerSelectedId(itemdata?.id)
            setRetailerSelected(itemdata?.name)
            setShowDropDowns(false)
        }
    }

    const openFromDatePicker = () => {
        console.log("Open Calender");
        var minDate = '';
        minDate = new Date();
        minDate.setMonth(minDate.getMonth() - 432);
        setMinDate(new Date(minDate))
        setMaxDate(new Date())
        setIsSelectingFromDate(true);
        setDatePicker(true)
    };

    const openToDatePicker = () => {
        var minDate = '';
        minDate = new Date();
        minDate.setMonth(minDate.getMonth() - 432);
        setMinDate(new Date(minDate))
        setMaxDate(new Date())
        setIsSelectingFromDate(false);
        setDatePicker(true)
    }

    const onpressIndexClicked = (index) => {
        let newIndex = index + 1;
        var fromIndex = (newIndex - 1) * 10
        var toIndex = (newIndex * 10) - 1

        var filteredArr = pagesArray.filter(function (item, newIndex) {
            return newIndex >= fromIndex && newIndex <= toIndex
        })
        setSelectedPageIndex(index);
        setPagesArray(filteredArr);

    }


    const handleConfirm = (date) => {
        var selectedDate = moment(date).format('DD-MM-YYYY');

        if (isSelectingFromDate) {
            setFromDate(selectedDate);
            setToDate("")
        } else {
            if (moment(selectedDate, 'DD-MM-YYYY').isBefore(moment(fromDate, 'DD-MM-YYYY'))) {
                SimpleToast.show(translate('toDateAfterFromDate'));
                setDatePicker(false);
                return;
            }
            setToDate(selectedDate);
        }

        setDatePicker(false);
    }

    const handleCancel = () => {
        setDatePicker(false)
    }

    const nextPage = () => {
        if (selectedPageIndex < pagesArray?.length - 1 && showScanData) {

            const nextIndex = selectedPageIndex + 1;

            setSelectedPageIndex(nextIndex);

            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
                viewPosition: 0.5,
            });

            getScannedHistory(productItem, nextIndex + 1);
        }
    };

    const previousPage = () => {
        if (selectedPageIndex > 0 && showScanData) {

            const prevIndex = selectedPageIndex - 1;

            setSelectedPageIndex(prevIndex);

            flatListRef.current?.scrollToIndex({
                index: prevIndex,
                animated: true,
                viewPosition: 0.5,
            });

            getScannedHistory(productItem, prevIndex + 1);
        }
    };

    const renderPageNumber = (item, index) => {
        return (
            <View style={[{ borderRadius: 25, borderWidth: 0.5, borderColor: Colors.very_light_grey, padding: 5, margin: 5, height: 30, minWidth: 30, backgroundColor: selectedPageIndex == index ? dynamicStyles.primaryColor : Colors.white }]}>
                <TouchableOpacity style={[{ height: '100%', width: '100%' }]} onPress={() => {
                    setSelectedPageIndex(index)
                    if (showScanData) {
                        getScannedHistory(productItem, index + 1)
                    }
                }}>
                    <Text style={[{ textAlign: 'center', color: selectedPageIndex == index ? Colors.white : Colors.black }, styles['font_size_12_semibold']]}>{item}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const showCouponData = () => {
        const momentDate = moment(itemClicked?.scanDate, "YYYY-MM-DD HH:mm:ss.SSS");
        return (
            <Modal animationType="slide"
                transparent={true}
                visible={showCouponDetails}
                onRequestClose={() => setShowCouponDetails(false)}>
                {/* <TouchableOpacity style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.blackTransparent }} onPress={() => setShowCouponDetails(false)}> */}
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: Colors.blackTransparent }}>
                    <View style={{ height: 75, width: 75, borderRadius: 40, backgroundColor: 'white', bottom: -55, alignSelf: 'center', padding: 10 }}>
                        <View style={[{ height: '100%', width: '100%', backgroundColor: "#D9D9D9", borderRadius: 40 }]}>
                        </View>
                    </View>
                    {console.log(itemClicked, "========> SAINATH")}
                    <View style={[{ borderTopRightRadius: 20, borderTopLeftRadius: 20, overflow: 'hidden', backgroundColor: 'white', height: 25 }]}>
                    </View>
                    <View style={[{ backgroundColor: 'white' }]}>
                        <View style={[{ height: 125, width: 125, backgroundColor: Colors.imageUploadBackColor, borderRadius: 100, alignSelf: 'center' }]}>
                            <Image source={require('../assets/images/ic_gift.png')} style={[{ height: '100%', width: '100%' }]} />
                        </View>
                        <TouchableOpacity style={[{ position: 'absolute', height: 20, width: 20, end: 0, marginEnd: 25 }]} onPress={() => { setShowCouponDetails(false) }}>
                            <Image style={[{ height: '100%', width: '100%' }]} source={require('../assets/images/ic_close_red.png')} />
                        </TouchableOpacity>
                        <View style={{ width: '80%', borderRadius: 15, padding: 10, backgroundColor: "#1ebb001f", alignSelf: 'center', marginTop: 10, marginBottom: 15 }}>
                            <View style={styles.flex_direction_row}>
                                <Image style={[styles.font_size_16_semibold, { height: 50, width: 50, padding: 10, alignSelf: 'flex-start' }]} source={itemClicked == undefined ? require('../assets/images/ic_default_scan.png') : { uri: itemClicked?.productImage }} resizeMode="contain" />
                                <View style={[styles['margin_left_15']]}>
                                    <Text style={[styles['font_size_14_regular'], { textAlign: 'center', color: 'black', padding: 2 }]}>{itemClicked?.brandName}</Text>
                                    <Text style={[styles['font_size_12_regular'], { textAlign: 'center', color: 'grey', padding: 2 }]}>{itemClicked?.productDescription + " | " + itemClicked?.packSize}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[{ height: 1, width: '90%', borderTopWidth: 1, marginTop: 5, marginBottom: 5, borderTopColor: Colors.very_light_grey, alignSelf: 'center' }]}></View>
                        <View style={[{ justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginBottom: 20 }]}>
                            <View style={[styles['flex_direction_row'], styles['space_evenly'], { width: '85%', marginTop: 5 }]}>
                                <Text style={[styles['font_size_14_semibold'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{translate('coupon_id')}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '10%' }]}>{":"}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{itemClicked.couponCode}</Text>
                            </View>

                            <View style={[styles['flex_direction_row'], styles['space_evenly'], { width: '85%', marginTop: 5 }]}>
                                <Text style={[styles['font_size_14_semibold'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{translate('transaction_id')}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '10%' }]}>{":"}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{itemClicked.tansactionId}</Text>
                            </View>

                            <View style={[styles['flex_direction_row'], styles['space_evenly'], { width: '85%', marginTop: 5 }]}>
                                <Text style={[styles['font_size_14_semibold'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{translate('transaction_date')}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '10%' }]}>{":"}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{moment(momentDate).format("DD-MMM-YYYY")}</Text>
                            </View>

                            <View style={[styles['flex_direction_row'], styles['space_evenly'], { width: '85%', marginTop: 5 }]}>
                                <Text style={[styles['font_size_14_semibold'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{translate('transaction_time')}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '10%' }]}>{":"}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{moment(momentDate).format('hh:mm A')}</Text>
                            </View>

                            <View style={[styles['flex_direction_row'], styles['space_evenly'], { width: '85%', marginTop: 5 }]}>
                                <Text style={[styles['font_size_14_semibold'], { textAlign: 'left', color: 'black', padding: 2, width: '45%' }]}>{itemClicked.creditOrDebit == translate('credit') ? translate('credit_points') : translate('debit_points')}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: 'black', padding: 2, width: '10%' }]}>{":"}</Text>
                                <Text style={[styles['font_size_14_regular'], { textAlign: 'left', color: itemClicked?.creditOrDebit == translate('credit') ? Colors.green : dynamicStyles.primaryColor, padding: 2, width: '45%' }]}>{itemClicked?.creditOrDebit == translate('credit') ? "+ " + itemClicked?.pointsEarned : " - " + itemClicked?.pointsEarned}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    const checkPagesDisplying = () => {
        if (showScanData) {
            setShowScanData(false)
            setShowProductData(true)
            setShowCropData(false)
        } else if (showProductData && !showScanData) {
            setShowScanData(false)
            setShowProductData(false)
            setShowCropData(true)
        }
        setSelectedPageIndex(0)

        console.log("showScanData", showScanData, selectedPageIndex)
    }

    return (
        <View style={[styles['full_screen'], { backgroundColor: Colors.very_light_grey }]}>
            {Platform.OS === 'android' && <StatusBar backgroundColor={dynamicStyles.primaryColor} barStyle='dark-content' />}
            <View style={[{ backgroundColor: dynamicStyles.primaryColor, borderBottomEndRadius: 10, borderBottomStartRadius: 10, paddingTop: Platform.OS === 'ios' ? 60 : 0 }]}>
                <TouchableOpacity style={[styles['flex_direction_row'], {alignItems:'center'}]} onPress={() => { goBack() }}>
                    <Image style={[styles['margin_left_20'], styles[''], styles['tint_color_white'], { height: 15, width: 20, top: Platform.OS == 'ios' ? 10 : 0 }]} source={require('../assets/images/previous.png')}></Image>
                    <Text style={[styles['margin_left_10'], styles[''], styles['text_color_white'], styles[''], styles['font_size_18_bold']]}>{translate('scan_history')}</Text>
                </TouchableOpacity>

                <View style={[styles['flex_direction_row'], styles['width_90%'], styles['height_80'], styles['bg_white'], styles['border_radius_10'], styles['centerItems'], { marginTop: 20, marginBottom: 10 }]}>
                    <View style={[{ width: '15%' }]}>
                        <Image style={[styles['width_height_50'], { marginRight: 25 }]} source={require('../assets/images/ic_cummulative.png')}></Image>
                    </View>
                    <View style={[styles['flex_direction_column'], styles['margin_left_20'], { width: '60%' }]}>
                        <Text style={[styles['font_size_16_bold'], styles['text_color_black'], styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_5']]}>{totalPoints}</Text>
                        <Text style={[styles['font_size_12_semibold'], styles['text_color_grey'], styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['top_5']]}>{translate('totalPoints') + " " + translate('EarnedTillDate')}</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={[{ marginTop: 5, marginBottom: numberOfPages > 1 ? 55 : 20, }]}>
                <View style={[{ padding: 10, width: '95%', backgroundColor: 'white', marginTop: 10 }, styles['centerItems'], styles['border_radius_8']]}>


                    <CustomInputDropDown
                        width={[styles['width_95%'], styles['top_5'], styles['centerItems']]}
                        defaultValue={statesMasterOriginal?.length == 1 ? statesMasterOriginal[0].name : stateSelectedName != undefined ? stateSelectedName : translate('SelectState')}
                        labelName={translate('state')}
                        IsRequired={false}
                        placeholder={translate('SelectState')}
                        onEndEditing={async event => {
                        }}
                        onFocus={() => {
                            {
                                statesMasterOriginal?.length == 1 ? undefined
                                    : changeDropDownData(statesMasterOriginal, strings.state, stateSelectedName)
                            }
                        }}
                    />


                    <CustomInputDropDown
                        width={[styles['width_95%'], styles['top_5'], styles['centerItems']]}
                        defaultValue={districtsMasterFilter?.length == 1 ? districtsMasterFilter[0].name : districtSelectedName != undefined ? districtSelectedName : translate('SelectDistrict')}
                        labelName={translate('district')}
                        IsRequired={false}
                        placeholder={translate('SelectDistrict')}
                        onEndEditing={async event => {
                        }}
                        onFocus={() => {
                            {
                                districtsMasterFilter?.length == 1 ? undefined
                                    : changeDropDownData(districtsMasterFilter, strings.district, districtSelectedName)
                            }
                        }}
                    />

                    <CustomInputDropDown
                        width={[styles['width_95%'], styles['top_5'], styles['centerItems']]}
                        defaultValue={subDistrictsMasterFilter?.length == 1 ? subDistrictsMasterFilter[0].name : subDistrictSelectedName != undefined ? subDistrictSelectedName : translate('select') + " " + translate('sub_district')}
                        labelName={translate('sub_district')}
                        IsRequired={false}
                        placeholder={translate('select') + " " + translate('sub_district')}
                        onEndEditing={async event => {
                        }}
                        onFocus={() => {
                            {
                                subDistrictsMasterFilter?.length == 1 ? undefined
                                    : changeDropDownData(subDistrictsMasterFilter, strings.sub_district, subDistrictSelectedName)
                            }
                        }}
                    />

                    <CustomInputDropDown
                        width={[styles['width_95%'], styles['top_5'], styles['centerItems']]}
                        defaultValue={villageMaster?.length == 1 ? villageMaster[0].name : villageSelectedName != undefined ? villageSelectedName : translate('select') + " " + translate('village')}
                        labelName={translate('village')}
                        IsRequired={false}
                        placeholder={translate('select') + " " + translate('village')}
                        onEndEditing={async event => {
                        }}
                        onFocus={() => {
                            {
                                villageMaster?.length == 1 ? undefined
                                    : changeDropDownData(villageMaster, strings.villageCity, villageSelectedName)
                            }
                        }}
                    />

                    <CustomInputDropDown
                        width={[styles['width_95%'], styles['top_5'], styles['centerItems']]}
                        defaultValue={(retailerMaster != undefined && retailerMaster?.length == 1) ? retailerMaster[0].name : retailerSelected != undefined ? retailerSelected : translate('selectRetailerName')}
                        labelName={translate('retailerName')}
                        IsRequired={false}
                        placeholder={translate('selectRetailerName')}
                        onEndEditing={async event => {
                        }}

                        onFocus={() => {
                            {
                                retailerMaster?.length == 1 ? undefined
                                    : changeDropDownData(retailerMaster, strings.retailerName, retailerSelected)
                            }
                        }}
                    />

                    <View style={[styles['flex_direction_row'], styles['flexGrow_1'], styles['space_between'], styles['width_95%'], styles['top_5']]}>
                        <CustomCalanderSelection
                            width={{ width: '48%' }}
                            defaultValue={fromDate}
                            labelName={translate('from_Date')}
                            placeholder={translate('select')}
                            IsRequired={true}
                            onEndEditing={event => {
                            }}
                            onFocus={openFromDatePicker}
                        />

                        <CustomCalanderSelection
                            width={{ width: '48%' }}
                            defaultValue={toDate}
                            labelName={translate('to_date')}
                            placeholder={translate('select')}
                            IsRequired={true}
                            onEndEditing={event => {
                            }}
                            onFocus={openToDatePicker}
                        />
                    </View>
                    <View style={[{ height: 15 }]}>
                    </View>
                    <CustomButton title={translate('getDetails')} onPress={() => { submitButtonPress(1) }} buttonBg={dynamicStyles.primaryColor} btnWidth={"95%"} titleTextColor={Colors.white} />
                </View>

                <View style={[styles['centerItems'], styles['top_20'], { height: '100%', width: '95%', }]}>
                    <View style={[{ height: '100%', width: '100%', backgroundColor: Colors.white, borderRadius: 8, padding: 5, paddingBottom: 25 }]}>
                        {showCropData && activeRetilerCount != "" &&
                            <View style={[{ height: 50, width: '50%', marginLeft: 15, flexDirection: 'row', justifyContent: 'space-between', top: 10 }]}>
                                <Text style={[styles['font_size_16_semibold'], styles['margin_left_10'], styles['text_color_black']]}>{translate('activeRetailers')}</Text>
                                <Text style={[styles['font_size_16_semibold'], styles['margin_left_5'], styles['text_color_black']]}>{activeRetilerCount}</Text>
                            </View>
                        }
                        {!showCropData &&
                            <View style={[{ height: 50, width: '100%', marginLeft: 15, flexDirection: 'row', justifyContent: 'space-between' }]}>
                                <TouchableOpacity style={[{ alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'row' }]} onPress={() => { checkPagesDisplying() }}>
                                    <Image style={[{ alignSelf: 'center', height: 15, width: 20, transform: [{ scaleX: -1 }], tintColor: 'black' }]} source={require('../assets/images/arrowLineWhite.png')} />
                                    <Text style={[styles['font_size_16_semibold'], styles['margin_left_10'], styles['text_color_black']]}>{translate('back')}</Text>
                                </TouchableOpacity>
                                <View style={[{ alignSelf: 'center' }]}>
                                    <Text style={[styles['font_size_13_semibold'], { textAlign: 'right', marginEnd: 50, color: '#00881E' }]}>{cropName}
                                        {showScanData && <Text style={[{ color: Colors.black }]}>{" -- "} <Text style={[styles['font_size_13_semibold'], { textAlign: 'right', marginEnd: 50, color: '#00881E' }]}>{productName}</Text></Text>}</Text>
                                </View>
                            </View>}

                        <View style={[{ borderRadius: 8, borderWidth: 0.5, borderColor: '#B4B4B4', overflow: 'hidden' }]}>
                            <View style={[{ height: 50, width: '100%', backgroundColor: '#E5E5E5', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between' }]}>
                                <View style={[styles['centerItems'], { width: '15%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('sno')}</Text>
                                </View>
                                {!showScanData && <View style={[styles['centerItems'], { width: '25%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{showCropData ? translate('crop') : translate('products')}</Text>
                                </View>}
                                <View style={[styles['centerItems'], { width: showScanData ? '50%' : '35%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{!showScanData ? translate('noofbagsScanned') : translate('couponCode')}</Text>
                                </View>
                                <View style={[styles['centerItems'], { width: '25%' }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('points')}</Text>
                                </View>
                            </View>

                            {/* cropHistoryData?.length == 0 && productsHistoryData?.length == 0 && scanHistoryData?.length == 0 && */}
                            {showCropData ? (
                                ((cropHistoryData != undefined && cropHistoryData?.length == 0)) &&
                                <View style={[styles['centerItems'], { width: '100%', margin: 8 }]}>
                                    <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('no_data_available')}</Text>
                                </View>
                            ) :
                                showProductData ? (
                                    ((productsHistoryData != undefined && productsHistoryData?.length == 0)) &&
                                    <View style={[styles['centerItems'], { width: '100%', margin: 8 }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('no_data_available')}</Text>
                                    </View>
                                ) :
                                    showScanData ? (
                                        ((scanHistoryData != undefined && scanHistoryData?.length == 0)) &&
                                        <View style={[styles['centerItems'], { width: '100%', margin: 8 }]}>
                                            <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('no_data_available')}</Text>
                                        </View>
                                    )
                                        :
                                        undefined
                            }
                            {showCropData ? (
                                <FlatList
                                    data={cropHistoryData != undefined ? cropHistoryData : []}
                                    renderItem={({ item, index }) => renderCropHistoryItem(item, index)}
                                    keyExtractor={(item, index) => index.toString()}
                                    scrollEnabled={false}
                                />
                            ) :
                                showProductData ? (
                                    <FlatList
                                        data={productsHistoryData != undefined ? productsHistoryData : []}
                                        renderItem={({ item, index }) => renderProductsItems(item, index)}
                                        keyExtractor={(item, index) => index.toString()}
                                        scrollEnabled={false}
                                    />
                                ) :
                                    showScanData ? (
                                        <FlatList

                                            data={scanHistoryData != undefined ? scanHistoryData : []}
                                            renderItem={({ item, index }) => renderScanHistory(item, index)}
                                            keyExtractor={(item, index) => index.toString()}
                                        />
                                    ) : (
                                        <View style={[styles['centerItems'], { width: '100%', margin: 8 }]}>
                                            {/* <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('no_data_available')}</Text> */}
                                        </View>

                                    )}

                            {showCropData && cropHistoryData?.length > 0 &&
                                <View style={[{ height: 60, width: '100%', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between', borderTopWidth: 0.5, borderColor: '#B4B4B4', }]}>
                                    <View style={[styles['centerItems'], { width: '22%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4', padding: 2 }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('totalPoints')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '22%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('bonus_points')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '22%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('signUp_bonus_points')}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '22%', padding: 2 }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{translate('grand_total')}</Text>
                                    </View>
                                </View>}

                            {showCropData && cropHistoryData?.length > 0 &&
                                <View style={[{ height: 50, width: '100%', flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between', borderTopWidth: 0.5, borderColor: '#B4B4B4' }]}>
                                    <View style={[styles['centerItems'], { width: '22%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{cropHistoryData != undefined ? cropHistoryData.reduce((acc, crop) => acc + crop.pointsEarned, 0) : 0}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '22%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{bonusPoints}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '22%', borderRightWidth: 0.5, height: '100%', borderColor: '#B4B4B4' }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{signUpBonusPoints}</Text>
                                    </View>
                                    <View style={[styles['centerItems'], { width: '22%' }]}>
                                        <Text style={[styles['text_color_black'], styles['text_align_center'], styles['font_size_13_semibold']]}>{(Number.parseInt(signUpBonusPoints) + Number.parseInt(bonusPoints) + Number.parseInt(cropHistoryData != undefined ? cropHistoryData.reduce((acc, crop) => acc + crop.pointsEarned, 0) : 0) || 0).toString()}</Text>
                                    </View>
                                </View>
                            }

                        </View>
                    </View>
                </View>
            </ScrollView>

            {numberOfPages > 1 && pagesArray?.length > 0 && showScanData && (
                <View style={[{ minHeight: 40, width: '95%', position: 'absolute', bottom: 0, marginBottom: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: 'white', borderTopWidth: 0.5, borderColor: Colors.lightish_grey }, styles['centerItems']]}>
                    <Text style={[styles['font_size_16_bold'], styles['text_color_black'], styles['text_align_left'], styles['left_5'], styles['width_100%'], styles['margin_top_minus_12']]}></Text>
                    <View style={[{ height: '100%', width: '100%', flexDirection: 'row', justifyContent: 'space-between' }]}>
                        <TouchableOpacity style={[styles['width_15%'], styles['centerItems'], { height: '100%' }]} onPress={() => { selectedPageIndex > 0 ? previousPage() : '' }}>
                            <Image source={require('../assets/images/ic_forward.png')} style={[styles['width_height_10'], styles['align_self_center'], styles['margin_left_10'], { tintColor: Colors.black, transform: [{ scaleX: -1 }] }]} />
                        </TouchableOpacity>
                        <View style={[{ height: '100%', width: '70%' }, styles['centerItems']]}>
                            <FlatList
                                ref={flatListRef}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={pagesArray}
                                renderItem={({ item, index }) => renderPageNumber(item, index)}
                                keyExtractor={(item, index) => index.toString()}
                                contentContainerStyle={{
                                    alignItems: 'center',
                                    paddingHorizontal: 5,
                                }}
                            />
                        </View>
                        <TouchableOpacity style={[styles['width_15%'], styles['centerItems'], { height: '100%' }]} onPress={() => { nextPage() }}>
                            <Image source={require('../assets/images/ic_forward.png')} style={[styles['width_height_10'], styles['align_self_center'], styles['margin_left_10'], { tintColor: Colors.black }]} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {
                showDropDowns &&
                <CustomListViewModal
                    dropDownType={dropDownType}
                    listItems={dropDownData}
                    selectedItem={selectedDropDownItem}
                    onSelectedState={(item) => { onSelectedState(item) }}
                    onSelectedDistrict={(item) => { onSelectedDistrict(item) }}
                    onSelectedSubDistrict={(item) => { onSelectedSubDistrict(item) }}
                    onSelectedVillage={(item) => { onSelectedVillage(item) }}
                    onSelectedRetailerName={(item) => { onSelectedRetailerName(item) }}
                    closeModal={() => setShowDropDowns(false)}
                />
            }

            {
                showDatePicker && (
                    <DateTimePickerModal
                        isVisible={true}
                        mode="date"
                        is24Hour={false}
                        date={new Date(selectedDate)}
                        maximumDate={new Date()}
                        onConfirm={(date) => { handleConfirm(date) }}
                        onCancel={() => handleCancel()}
                    />

                )
            }
            {showCouponDetails && showCouponData()}
            {loading && <CustomLoader loading={loading} message={loadingMessage} loaderImage={loaderImage} />}
        </View>
    )
}

export default EmpScanHistory;