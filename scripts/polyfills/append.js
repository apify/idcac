chrome.tabs.onCreated.callbacks.forEach((callback) => {
	callback({id: 0, url: window.location.href});
})
