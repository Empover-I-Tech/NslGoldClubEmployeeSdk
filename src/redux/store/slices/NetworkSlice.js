import { createSlice } from '@reduxjs/toolkit';
 
const initialState = {
  value: false,
};
 
const networkStateSlice = createSlice({
  name: 'NETWORK_STATE',
  initialState,
  reducers: {
    setNetworkConnectionStatus: (state, action) => {
      state.value = action.payload ?? false;
    },
  },
});
 
// Actions
export const { setNetworkConnectionStatus } = networkStateSlice.actions;
 
// Safe Selector
export const getNetworkStatus = (state) =>
  state?.NETWORK_STATE?.value ?? false;
 
// Reducer
export default networkStateSlice.reducer;