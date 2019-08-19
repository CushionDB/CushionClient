const CONFIG = require('../../.cushionConfig.json');

export const subscribeDeviceToPush = () => `${CONFIG.couchBaseURL}/subscribe_device_to_notifications`;
export const signup = () => `${CONFIG.cushionServerBaseURL}/signup`;
export const isSubscribedToPush = (username) => `${CONFIG.cushionServerBaseURL}/is_subscribed_to_push/${username}`;
export const changePassword = ()  => `${CONFIG.cushionServerBaseURL}/updatePassword`;
