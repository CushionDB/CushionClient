const path = require('path');
const rootDir = path.dirname(require.main.filename);
let configObj = require (rootDir + 'cushionConfig.json');

if (! configObj) {
 configObj = require('../../.defaultCushionConfig.json');
}


export const getConfigObj = () => {
	return configObj;
}


