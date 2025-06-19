var tabs = {};

chrome.extension.onConnect.addListener((port) => {
port.onMessage.addListener((msg) => {
	var curTab = msg.id;
	if (!tabs[curTab]) {
	tabs[curTab] = {};
	}

	if (msg.action === "popup") {
	try {
		tabs[curTab].audioCtx = new (window.AudioContext)();

		chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
		if (!stream) {
			console.error("Tab capture failed:", chrome.runtime.lastError);
			return;  // ユーザー通知なし
		}

		try {
			tabs[curTab].source = tabs[curTab].audioCtx.createMediaStreamSource(stream);
			tabs[curTab].gainNode = tabs[curTab].audioCtx.createGain();
			tabs[curTab].panNode = tabs[curTab].audioCtx.createStereoPanner();

			tabs[curTab].source.connect(tabs[curTab].gainNode);
			tabs[curTab].gainNode.connect(tabs[curTab].panNode);
			tabs[curTab].panNode.connect(tabs[curTab].audioCtx.destination);

			tabs[curTab].gainNode.gain.value = 1;
		} catch (audioErr) {
			console.error("Error setting up AudioNodes:", audioErr);
		}
		});
	} catch (ctxErr) {
		console.error("AudioContext creation failed:", ctxErr);
	}
	}

	if (msg.type === "vol") {
	if (tabs[curTab] && tabs[curTab].gainNode) {
		tabs[curTab].gainNode.gain.value = parseFloat(msg.action / 100);
	}
	}

	if (msg.type === "pan") {
	if (tabs[curTab] && tabs[curTab].panNode && tabs[curTab].audioCtx) {
		tabs[curTab].panNode.pan.setValueAtTime(parseFloat(msg.action), tabs[curTab].audioCtx.currentTime);
	}
	}
});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
if (request.type === "getSliderValues") {
	if (tabs[request.tabId] && tabs[request.tabId].gainNode && tabs[request.tabId].panNode) {
	sendResponse({
		vol: tabs[request.tabId].gainNode.gain.value,
		pan: tabs[request.tabId].panNode.pan.value,
	});
	} else {
	sendResponse({ vol: 1, pan: 0 }); // デフォルト値返却
	}
}
});
