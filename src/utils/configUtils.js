const path = require('path');
const rootDir = path.dirname(require.main.filename);
let configObj;

try {
	configObj = require (rootDir + 'cushionConfig.json');
} catch {	
 configObj = require('../../.defaultCushionConfig.json');
}

export const getConfigObj = () => {
	return configObj;
}
