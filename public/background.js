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
    // chrome.sidePanel.setOptions({
    //   tabId: tab.id,
    //   path: "index.html",
    //   enabled: true,
    // });
    // await chrome.sidePanel.open({ tabId: tab.id });
    await chrome.sidePanel.open({ windowId: tab.windowId });

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

// const GOOGLE_ORIGIN = "https://www.bing.com";
// chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
//   if (!tab.url) return;
//   const url = new URL(tab.url);
//   // Enables the side panel on bing.com
//   if (url.origin === GOOGLE_ORIGIN) {
//     await chrome.sidePanel.setOptions(
//       {
//         tabId,
//         path: 'index.html',
//         enabled: true
//       }   
//     );
//   } 
//   // else {
//   //   // Disables the side panel on all other sites
//   //   await chrome.sidePanel.setOptions(
//   //     {
//   //       tabId,
//   //       enabled: false
//   //     }
//   //   );
//   // }
// });
