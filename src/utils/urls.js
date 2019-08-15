const config = require('../../.cushionConfig.json');

export const subscribeDeviceToPush = () => `${config.couchBaseURL}/subscribe_device_to_notifications`;
export const signup = () => `${config.cushionServerBaseURL}/signup`;
export const isSubscribedToPush = (username) => `${config.cushionServerBaseURL}/is_subscribed_to_push/${username}`;