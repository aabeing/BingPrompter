chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    title: "Prompt-Assisted Search",
    contexts: ["selection"],
    id: "jobScan",
  });
});

const getTabId = async () => {
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome.tabs.query(queryOptions);
  return tabs[0].id;
};
function copySelectedText() {
  const copyText = window.getSelection().toString();
  document.execCommand("copy");
  return copyText;
}

let flagSidePanelOpened = false
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "jobScan") {
    // console.log("Inside click:" + tab);
    // console.log("Inside click:" + info);
    //Just for sidepanel
    chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: "index.html",
      enabled: true,
    });
    await chrome.sidePanel.open({ tabId: tab.id });


    let injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copySelectedText,
    })
    // console.log("Injected:" + injectionResults);
    let { result } = injectionResults[0];
    console.log("Result read: ", result);
    // console.log("flagSidePanelOpened:", flagSidePanelOpened)
    chrome.storage.session.set({ selectedText: result }).then(() => {
      console.log("Value was set");
    });




    console.log("Onclick: Last line");
  }
});
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   if (request.type == "sidePanelLoaded") {
//     console.log("Result inside: ", result);
//     // sendResponse({ selectedText: result });
//     await chrome.runtime.sendMessage({
//       from: "copySelectedText",
//       data: result,
//     });
//     console.log("Onclick: Message send");
//   }
// }
// );

// for (const { frameId, result } of injectionResults) {
//   console.log(`Frame ${frameId} result:`, result);
// }





// chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
//   console.log("Inside updated:" + info);
//   if (!tab.url) return;

//   // const url = new URL(tab.url);
//   // Enables the side panel on google.com
//   await chrome.sidePanel.setOptions({
//     tabId,
//     path: "index.html",
//     enabled: true,
//   });
// });
