// realmConfig.js
import Realm from 'realm';
// Put all your schema definitions here
const schemaList = [
  {
    name: 'programDetailsOff',
    properties: {
      programDetailsInfo: 'string',
    },
  },
  {
    name: 'productsListPscreen',
    properties: { data: 'string' },
  },
  {
    name: 'cropsMasterProducts',
    properties: { data: 'string' },
  },
  {
    name: 'companiesListInProducts',
    properties: { data: 'string' },
  },
  {
    name: 'couponsDataInSH',
    properties: { data: 'string' },
  },
  {
    name: 'cropsListDataInSH',
    properties: { data: 'string' },
  },
  {
    name: 'productsListDataInSH',
    properties: { data: 'string' },
  },
  {
    name: 'ScanHistoryResponse',
    properties: {
      _id: 'date',
      data: 'string',
      timestamp: 'date',
    },
  },
  {
    name: 'ScanHistoryProgramsList',
    properties: {
      _id: 'date',
      data: 'string',
      timestamp: 'date',
    },
  },
  {
    name: 'YieldCalculatorResponse',
    properties: {
      _id: 'date',
      data: 'string',
      timestamp: 'date',
    },
  },
  {
    name: 'SeedCalSubmit',
    properties: {
      _id: 'string',
      data: 'string',
    },
  },
  {
    name: 'YieldCalSubmit',
    properties: {
      _id: 'string',
      data: 'string',
    },
  },
  {
    name: 'fertiliserCalculatorResponse',
    properties: {
      _id: 'date',
      data: 'string',
      timestamp: 'date',
    },
  },
  {
    name: 'fertiliserCalculatorMaster',
    properties: {
      _id: 'date',
      data: 'string',
      timestamp: 'date',
    },
  },
  {
    name: 'SeedCalculatorResponse',
    properties: {
      _id: 'date',
      data: 'string',
      timestamp: 'date',
    },
  },
  {
    name: 'cropsListProducts',
    properties: {
      _id: 'date',
      data: 'string',
      timestamp: 'date',
    },
  },
  {
    name: 'productsMasterOffline',
    properties: {
      _id: 'date',
      data: 'string',
      timestamp: 'date',
    },
  },
  {
    name: 'Complaint',
    primaryKey: 'localId',
    properties: {
      localId: 'string',
      userId: 'int',
      categoryId: 'int',
      subCategoryId: 'int',
      categoryName: 'string',
      subcategoryName: 'string',
      remarks: 'string',
      status: 'bool',
      coupon: 'string?',
      scanCouponLabel: 'string?',
      complaintImage: 'string?',
      createdOn: 'date',
    },
  },
  {
    name: 'ComplaintData',
    primaryKey: 'localId',
    properties: {
      localId: 'string',
      data: 'string',
    },
  },
  {
    name: 'helpDeskPageOff',
    properties: {
      langCode: 'string',
      langId: 'string?',
      langName: 'string',
      data: 'string',
    },
  },
  {
    name: 'complaintCategoriesList',
    properties: { categoriesData: 'string' },
  },
  {
    name: 'RetailerEntries',
    properties: { RetailerEntriesData: 'string' },
  },
  {
    name: 'finalRetailerEntries',
    properties: { finalRetailerEntriesData: 'string' },
  },
  {
    name: 'companyCodeMasterPlanningTool',
    properties: { companyCodeMasterPlanningToolData: 'string' },
  },
  {
    name: 'hybridMasterPlanningTool',
    properties: { hybridMasterPlanningToolData: 'string' },
  },
  {
    name: 'cropMasterPlanningTool',
    properties: { cropMasterPlanningToolData: 'string' },
  },
  {
    name: 'weatherRes',
    properties: {
      weatherInfo: 'string',
    },
  },
  {
    name: 'carouselDataOff',
    properties: {
      carouselInfo: 'string',
    },
  },
  {
    name: 'homePageIconsList',
    properties: {
      Buy: 'string',
      appIcon: 'string',
      faq: 'string',
      home: 'string',
      samadhan: 'string',
      scan: 'string',
    },
  },
  {
    name: 'qrCodeData',
    properties: {
      qrCodeData: 'string?',
      scannedDate: 'string?',
      geoLocations: 'string?', // ✅ NEW FIELD ADDED HERE
    },
  },
  {
    name: 'scannedCoupons',
    properties: {
      loginUserId: 'string?',
      loginMobileNumber: 'string?',
      retailerId: 'string?',
      retailerMobileNumber: 'string?',
      deviceType: 'string?',
      type: 'string?',
      geoLocations: 'string?',
      isOnlineRecord: 'string?',
      scannedDate: 'string?',
      qrCodeScanData: { type: 'list', objectType: 'qrCodeData' },
    },
  },
  {
    name: 'dashboardData',
    properties: {
      userList: { type: 'list', objectType: 'kycData' },
      userPointsReedemed: 'int',
      userPointsEarned: 'int',
    },
  },
  {
    name: 'kycData',
    properties: {
      ekycSubmitted: 'bool',
      ekycDoneDate: 'string',
      notificationCount: 'int',
      mobileNumber: 'string',
      profilePic: 'string',
      ekycRaiseRequestStatus: 'string',
      proprietorName: 'string',
      territoryManagerMobileNumber: 'string',
      raiseRequest: 'bool',
      ekycStatus: 'string',
      territoryManagerName: 'string',
    },
  },
];

const realm = new Realm({
  path: 'User.realm',
  schema: schemaList,
  schemaVersion: 6,
  migration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion < 6) {
      const oldCoupons = oldRealm.objects('scannedCoupons');
      const newCoupons = newRealm.objects('scannedCoupons');

      for (let i = 0; i < oldCoupons.length; i++) {
        const oldObj = oldCoupons[i];
        const newObj = newCoupons[i];

        if (!newObj) continue;

        newObj.loginUserId = oldObj.loginUserId || null;
        newObj.loginMobileNumber = oldObj.loginMobileNumber || null;
        newObj.retailerId = oldObj.retailerId || null;
        newObj.retailerMobileNumber = oldObj.retailerMobileNumber || null;
        newObj.deviceType = oldObj.deviceType || null;
        newObj.type = oldObj.type || null;
        newObj.geoLocations = oldObj.geoLocations || '';
        newObj.isOnlineRecord = oldObj.isOnlineRecord || null;
        newObj.scannedDate = oldObj.scannedDate || null;
      }

      const oldQR = oldRealm.objects('qrCodeData');
      const newQR = newRealm.objects('qrCodeData');

      for (let i = 0; i < oldQR.length; i++) {
        const oldObj = oldQR[i];
        const newObj = newQR[i];

        if (!newObj) continue;

        newObj.qrCodeData = oldObj.qrCodeData || '';
        newObj.scannedDate = oldObj.scannedDate || '';
        newObj.geoLocations = oldObj.geoLocations || '';
      }
    }
  },
});

console.log('✅ Realm initialized:', realm.path);

export default realm;
