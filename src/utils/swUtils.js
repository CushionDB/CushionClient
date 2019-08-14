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
export const scheduleSyncPush = () => {
  getServiceWorker().then(sw => {
    postMessage('SCHEDULE_PUSH', {}, sw);
  });
}

export const scheduleSyncPull = () => {
  getServiceWorker().then(sw => {
    postMessage('SCHEDULE_PULL', {}, sw);
  });
}
