const TEMPdefaultVariables = {
	publicVapid: 'BP_QrGDbKkoFatPv0iiMEfl5XINAZSknNz171ID_uNXmmA5_bRnmGgt7zqfyDOgzwptrG9w0lqEU94ru34teLQU',
	couchBaseURL: 'http://localhost:5984'
}

const createEnvVarsObj = () => {
	return {
		publicVapid: process.env.PUBLIC_VAPID,
		couchBaseURL: proccess.env.COUCH_BASE_URL
	}
}

export const getEnvVars = () => {
	let envVars;

	if (process.env.NODE_ENV === 'production') {
		envVars = createEnvVarsObj();
	} else {
		envVars = TEMPdefaultVariables;
	}

	return envVars;
}