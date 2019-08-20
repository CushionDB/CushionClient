import CushionWorker from './cushionWorker';
import { getFetchOpts } from '../utils/fetchUtils';
import * as urls from '../utils/urls';
import MetaDB from '../metaDB';

const configObj = getConfigObj();
const useIcons = configObj.appPushIcons;
const ROOT_DIR = path.dirname(require.main.filename);

global.cushionWorker = new CushionWorker();

cushionWorker.addPushEvent('SYNC', (event) => { 
	const metaDB = new MetaDB(); 
  const title = configObj.appname;
  const options = {
    body: "is updating in the background.",
    silent: true,
    renotify: false
  };

  if (useIcons) {
    options = {
      ...options,
      icon: '.\icons\logo-icon.png',
      badge: '.\icons\logo-badge.png'
    }
  }

  return metaDB.ready.then(_ => {
    return Promise.all([
      utils.pouchSync(metaDB.remoteDBName(), metaDB.localDBName()),
      self.registration.showNotification(title, options)
    ]);
  });
});

cushionWorker.addMessageEvent('SCHEDULE_PUSH', () => {
  self.registration.sync.register('REPLICATE_TO_SERVER');
  return Promise.resolve();
});

cushionWorker.addMessageEvent('SCHEDULE_PULL', () => {  
  self.registration.sync.register('REPLICATE_FROM_SERVER');
  return Promise.resolve();
});

cushionWorker.addSyncEvent('REPLICATE_TO_SERVER', () => {
	const metaDB = new MetaDB();
  let userDoc;

	return metaDB.ready.then(_ => {
    return utils.pouchSync(metaDB.localDBName(), metaDB.remoteDBName());
  })

  .then(() => {
    if (metaDB.subscribedToPush()) {

	    const data = {
	      username: userDoc.username,
	      device: navigator.platform
	    };

		  return fetch(
		  	urls.triggerUpdateDevices(),
		  	getFetchOpts({
		  		method: 'POST',
		  		data
		  	})
			);
		}
  })

  .catch(err => Promise.reject(err));
});

cushionWorker.addSyncEvent('REPLICATE_FROM_SERVER', () => {
	const metaDB = new MetaDB();

	return metaDB.ready.then(_ => {
		if (!metaDB.remoteDBAddress()) return;

		return utils.pouchSync(metaDB.remoteDBName(), metaDB.localDBName());
	})

	.catch(err => Promise.reject(err));
});
