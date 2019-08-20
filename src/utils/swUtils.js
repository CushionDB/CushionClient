import urlB64ToUint8Array from './64to8';
import { getConfigObj } from './configUtils';

const configObj = getConfigObj();

const getServiceWorker = () => {
	if (navigator.serviceWorker.controller) {
	  return Promise.resolve(navigator.serviceWorker);
	}

	return new Promise((resolve) => {
	  function onControllerChange() {
	    navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
	    resolve(navigator.serviceWorker);
	  }

	  navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
	});
}

const postMessage = (id, payload, sw) => {
  return new Promise((res, rej) => {
    const msgChannel = new MessageChannel();
    msgChannel.port1.onmessage = (evt) => {
      if (evt.data.error) {
        rej(evt.data.error);
      } else {
        res(evt.data);
      }
    }

    sw.controller.postMessage({ id, payload }, [msgChannel.port2]);
  });
}

export const subscribeDeviceToNotifications = () => {
  return getServiceWorker().then(sw => {
    return sw.ready.then(reg => {
      return reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(configObj.publicVapid),
      });
    });
  });
}

export const scheduleSyncPush = () => {
  console.log('scheduleSyncPush called');
  getServiceWorker().then(sw => {
    console.log(sw);
    postMessage('SCHEDULE_PUSH', {}, sw);
  });
}

export const scheduleSyncPull = () => {
  getServiceWorker().then(sw => {
    postMessage('SCHEDULE_PULL', {}, sw);
  });
}

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../../sw.js');
  }
}