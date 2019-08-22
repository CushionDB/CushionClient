import PouchDB from 'pouchdb';
import path from 'path';
import * as utils from '../utils/cushionWorkerUtils';

class CushionWorker {
  constructor() {
    this.pushEvents = [];
    this.messageEvents = [];
    this.syncEvents = [];
  }

  getMetaDB() {
    const cushionMeta = new PouchDB('cushionMeta');
    return cushionMeta.get('cushionMeta');
  }

  pushEventTriggered(evt) {
    const eventData = JSON.parse(evt.data.text());

    return utils.triggerEvents(this.pushEvents, eventData.action, evt);
  }

  messageEventTriggered(evt) {
    const eventData = evt.data;

    return utils.triggerEvents(this.messageEvents, eventData.id, evt);
  }

  syncEventTriggered(evt) {
    return utils.triggerEvents(this.syncEvents, evt.tag, evt);
  }

  addPushEvent(id, evt) {
    this.pushEvents = utils.addEventToArr(this.pushEvents, id, evt);
  }

  addMessageEvent(id, evt) {
    this.messageEvents = utils.addEventToArr(this.messageEvents, id, evt);
  }

  addSyncEvent(id, evt) {
    this.syncEvents = utils.addEventToArr(this.syncEvents, id, evt);
  }

  removePushEvent(id) {
    this.pushEvents = utils.removeEventFromArr(this.pushEvents, id);
  }

  removeSyncEvent(id) {
    this.syncEvents = utils.removeEventFromArr(this.syncEvents, id);
  }

  removeMessageEvent(id) {
    this.messageEvents = utils.removeEventFromArr(this.messageEvents, id);
  }
}

export default CushionWorker;
