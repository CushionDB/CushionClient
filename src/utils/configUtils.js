const path = require('path');
const rootDir = path.dirname(require.main.filename);
let configObj = require('../../.defaultCushionConfig.json');

export const getConfigObj = () => {
  let userConfig;

  try {
    userConfig = require (rootDir + 'cushionConfig.json');
  } catch {
    userConfig = undefined;
  }

  return userConfig ? {...configObj, ...userConfig} : configObj;
}
