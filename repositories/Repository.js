import axios from 'axios';
const baseDomain = 'https://reactstorefronts.com/'; // API for products
export const basePostUrl = 'https://reactstorefronts.com/'; // API for post
export const baseStoreURL = 'https://reactstorefronts.com/'; // API for vendor(store)

export const customHeaders = {
    Accept: 'application/json',
};

export const baseUrl = `${baseDomain}`;

export default axios.create({
    baseUrl,
    headers: customHeaders,
});

export const serializeQuery = (query) => {
    return Object.keys(query)
        .map(
            (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`
        )
        .join('&');
};