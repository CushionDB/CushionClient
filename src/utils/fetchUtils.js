export const getFetchOpts = ({ method, data }) => {
	let fetchOpts =  {
		method,
		headers: {
			'Content-Type': 'application/json'
		}
	}

	return data ? { ...fetchOpts, body: JSON.stringify(data) } : fetchOpts;
}
