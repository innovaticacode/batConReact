import { actionTypes } from './action';

export const initState = {
    isLoggedIn: false,
    user: null,
};

function reducer(state = initState, action) { // action, payload kullanmadan action olarak değiştirildi
    switch (action.type) { // action olarak değiştirildi
        case actionTypes.LOGIN_SUCCESS:
            return {
                ...state,
                isLoggedIn: true, // user kısmı kaldırıldı, zaten payload ile geliyor
            };
        case actionTypes.LOGOUT_SUCCESS:
            return {
                ...state,
                isLoggedIn: false,
                user: null,
            };
        case actionTypes.SET_USER:
            return {
                ...state,
                user: action.payload, // payload olarak gelen user verisi atanıyor
            };
        default:
            return state;
    }
}

export default reducer;