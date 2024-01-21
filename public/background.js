// Context creation
chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    title: "Prompt-Assisted Search",
    contexts: ["selection"],
    id: "prompter",
  });
});

function copySelectedText() {
  const copyText = window.getSelection().toString();
  return copyText;
}
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "prompter") {
    //Just for sidepanel
    chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: "index.html",
      enabled: true,
    });
    await chrome.sidePanel.open({ tabId: tab.id });
    // Get the selected content 
    let injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copySelectedText,
    })
    let { result } = injectionResults[0];
    // console.log("Result read: ", result);
    chrome.storage.session.set({ selectedText: result }).then(() => {
      // console.log("Value was set");
    });
    console.log("Onclick: Completed");
  }
});