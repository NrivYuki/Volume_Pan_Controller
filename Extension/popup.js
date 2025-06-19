const port = chrome.extension.connect();
const volSlide = document.getElementById("de-vol-range");
const volDisplay = document.getElementById("vol-display");
const panSlide = document.getElementById("de-pan-range");

function currentTabId(callback) {
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    callback(tabs[0].id);
});
}

currentTabId((id) => {
port.postMessage({ action: "popup", id: id });

chrome.runtime.sendMessage({ type: "getSliderValues", tabId: id }, (response) => {
    if (response) {
    volSlide.value = response.vol * 100;
    volDisplay.textContent = `Current Volume: ${volSlide.value}`;
    panSlide.value = response.pan;
    }
});
});

volSlide.oninput = () => {
currentTabId((id) => {
    port.postMessage({ id: id, type: "vol", action: volSlide.value });
    volDisplay.textContent = `Current Volume: ${volSlide.value}`;
});
};

panSlide.oninput = () => {
currentTabId((id) => {
    port.postMessage({ id: id, type: "pan", action: panSlide.value });
});
};
