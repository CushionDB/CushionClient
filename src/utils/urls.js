import { getConfigObj } from './configUtils';

const configObj = getConfigObj();

export const subscribeDeviceToPush = () => `${configObj.cushionServerBaseURL}/subscribe_device_to_notifications`;
export const signup = () => `${configObj.cushionServerBaseURL}/signup`;
export const isSubscribedToPush = (username) => `${configObj.cushionServerBaseURL}/is_subscribed_to_push/${username}`;
export const changePassword = ()  => `${configObj.cushionServerBaseURL}/updatePassword`;
export const triggerUpdateDevices = () => `${configObj.cushionServerBaseURL}/trigger_update_user_devices`;
