import { getConfigObj } from './configUtils';

const configObj = getConfigObj();

export const subscribeDeviceToPush = () => `${configObj.couchBaseURL}/subscribe_device_to_notifications`;
export const signup = () => `${configObj.cushionServerBaseURL}/signup`;
export const isSubscribedToPush = (username) => `${configObj.cushionServerBaseURL}/is_subscribed_to_push/${username}`;
export const changePassword = ()  => `${configObj.cushionServerBaseURL}/updatePassword`;
