if (!chrome) {
	var chrome = {};
}

function getFile(filename) {
	if(filename in files) {
		return files[filename];
	} 
	throw new Error(`File ${filename} not found`);
}

const noop = (...args) => {};

const chromeNewProperties = {
	browserAction: {
		setBadgeText: noop,
		setBadgeBackgroundColor: noop,
		setIcon: noop,
	},
	notifications: {
		create: noop,
	},
	webRequest: {
		onBeforeRequest: {
			addListener: noop,
		},
		onResponseStarted: {
			addListener: noop,
		},
		onHeadersReceived: {
			addListener: noop,
		},
	},
	storage: {
		local: {
			get: noop,
			set: noop,
		}
	},
	runtime: {
		onMessage: {
			addListener: noop,
		},
		onStartup: {
			addListener: noop,
		},
		onInstalled: {
			addListener: noop,
		},
		getManifest: () => ({
			version: 1,
		}),
		getUrl(...args) {
			return 'https://example.com/' + args.join('/');
		},
		lastError: null,
		sendMessage: noop,
	},
	tabs: {
		create: (...args) => {},
		onCreated: {
			callbacks: [],
			addListener: (callback) => {
				chrome.tabs.onCreated.callbacks.push(callback);
			},
		},
		onUpdated: {
			addListener: noop,
		},
		onRemoved: {
			addListener: noop,
		},
		insertCSS: (_, { file, code, ...x }, callback) => {
			if ((file && code) || (!file && !code)){
				throw new Error('chrome.tabs.insertCSS requires either file or code to be set, but not both');
			}

			code ??= getFile(file);

			const head = document.head || document.getElementsByTagName('head')[0],
			style = document.createElement('style');
	
			head.appendChild(style);
		
			style.type = 'text/css';
			style.appendChild(document.createTextNode(code));

			callback?.();
		},
		executeScript: (_, { file, code, ...x }, callback) => {

			if ((file && code) || (!file && !code)){
				throw new Error('chrome.tabs.executeScript requires either file or code to be set, but not both');
			}

			code ??= getFile(file);

			eval(code);
			callback?.();
		}
	},
	i18n: {
		getMessage: (key, ...args) => key,
	},
	webNavigation: {
		onCommitted: {
			addListener: noop,
		},
	},
};

for (let key in chromeNewProperties) {
	Object.defineProperty(chrome, key, {
		value: chromeNewProperties[key],
	});
}
