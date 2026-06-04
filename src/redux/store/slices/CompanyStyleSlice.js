import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: {},
};

export const companyStylesSlice = createSlice({
  name: 'COMPANY_STYLES',
  initialState,
  reducers: {
    updateCompanyStyles: (state, action) => {
      console.log('Updating company styles with:', action.payload);
      state.value = action.payload || {};
    },
  },
});

// Actions
export const { updateCompanyStyles } = companyStylesSlice.actions;

// Safe selector
export const getCompanyStyles = (state) =>
  state?.COMPANY_STYLES || initialState;

// Reducer
export default companyStylesSlice.reducer;