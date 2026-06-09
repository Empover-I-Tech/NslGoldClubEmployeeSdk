import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    id: '',
    proprietorName: '',
    firmName: '',
    roleName: '',
    deviceToken: '',
    mobileNumber: '',
    profilePic: '',
    stateName: '',
    districtName: '',
    pincode: '',
    fcmToken: '',
    userMenuControl: {},
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            const userData = Array.isArray(action.payload)
                ? action.payload[0]
                : action.payload;

            return userData || initialState;
        },

        clearUser: () => initialState,
    },
});

export const { setUser, clearUser } = userSlice.actions;

/**
 * Compatibility selector:
 * - Old persisted data: [{...}]
 * - New data: {...}
 */
export const selectUser = (state) => {
    const user = state.user;

    return Array.isArray(user)
        ? user[0]
        : user;
};

export default userSlice.reducer;