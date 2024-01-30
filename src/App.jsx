import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./App.css";

// Nav menu 
import AddIcon from '@mui/icons-material/Add';
import { Navbar } from './components/NavBar';
import { Dropdown } from "./components/Dropdown";

const CONSTANT = {
  MIN_TEXTAREA_HEIGHT: 10,
  MAX_NEWTEXT_TEXTAREA_HEIGHT: 150,
  MAX_PROMPT_TEXTAREA_HEIGHT: 100,
  TEXTAREA_WIDTH: `100%`,
  MIN_TEXTAREA_WIDTH: `200px`,
  Max_COUNTER_Length: 3999
}

const flags = {
  firstRun: true
}

let promptDataDefault = {
  "Repharse": `Repharse the following:`
}



function App() {
  const [promptData, setPromptData] = useState()
  const [promptToUse, setPromptToUse] = useState('');
  const [promptName, setPromptName] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const textAreaNewTextRef = useRef(null)
  const textAreaPromptTextRef = useRef(null)
  const [dropDownSelectText, setDropDownSelectText] = useState('Select Prompt')
  const [addPageOpen, setAddPageOpen] = useState(false)
  const [counterLetter, setCounterLetter] = useState(0)

  useLayoutEffect(() => {
    console.log("useLayoutEffect")
    if (textAreaNewTextRef?.current?.style) {
      textAreaNewTextRef.current.style.height = "inherit";
      // Set height
      const maxHeightValue = Math.max(
        textAreaNewTextRef.current.scrollHeight,
        CONSTANT.MIN_TEXTAREA_HEIGHT
      )
      textAreaNewTextRef.current.style.height = `${Math.min(
        maxHeightValue,
        CONSTANT.MAX_NEWTEXT_TEXTAREA_HEIGHT
      )}px`;
    }
    if (textAreaPromptTextRef?.current?.style) {
      textAreaPromptTextRef.current.style.height = "inherit";
      // Set height
      const maxHeightValue = Math.max(
        textAreaPromptTextRef.current.scrollHeight,
        CONSTANT.MIN_TEXTAREA_HEIGHT
      )
      textAreaPromptTextRef.current.style.height = `${Math.min(
        maxHeightValue,
        CONSTANT.MAX_PROMPT_TEXTAREA_HEIGHT
      )}px`;
    }

    // console.log("Completed useLayoutEffect")
  }, [selectedText, promptToUse]);




  useEffect(() => {
    console.log("useeffect")

    if (flags.firstRun == true) {
      chrome.storage.session.get(["selectedText"]).then((result) => {
        // console.log("Value retrieved from storage 1" + result.selectedText);
        setSelectedText(result.selectedText)
        // setCounterLetter(result.selectedText.length + promptData.length)
      });
      flags.firstRun = false;
    }
    const handleStorageChange = (changes, namespace) => {
      let [key, { oldValue, newValue }] = Object.entries(changes)[0];
      // console.log(
      //   `Storage key "${key}" in namespace "${namespace}" changed. flags.firstRun : ${flags.firstRun}`,
      //   `Old value was "${oldValue}", new value is "${newValue}".`
      // );
      console.log("onchangest")
      setSelectedText(newValue)
    }
    chrome.storage.session.onChanged.addListener(handleStorageChange);

    chrome.storage.local.get(["promptData"]).then((result) => {
      // console.log("Value retrieved for promptData" + JSON.stringify(result));
      const data = result.promptData
      let retrievedData
      try {
        retrievedData = JSON.parse(data)
      }
      catch {
        // console.log("Identified a non Json value")
        retrievedData = {}
      }
      // console.log("Value retrieved for promptData" + result.promptData + Object.keys(retrievedData));
      // console.log("From local" + result + result?.promptData)
      if (Object.keys(retrievedData).length != 0) {
        // console.log("Setting retrievedData inside useeffect")

        setPromptData(retrievedData)
        // Checking for default key
        chrome.storage.local.get(["promptDataDefaultKey"]).then((result) => {
          const promptDataDefaultKey = result.promptDataDefaultKey
          if (promptDataDefaultKey in retrievedData) {
            setDropDownSelectText(promptDataDefaultKey)
            setPromptToUse(retrievedData[promptDataDefaultKey])
          }
        }).catch((error) => {
          // console.error("Checking for default key failed, " + error);
          const promptDataFirstKey = Object.keys(retrievedData)[0]
          setDropDownSelectText(promptDataFirstKey)
          setPromptToUse(retrievedData[promptDataFirstKey])
        })
      }
      else {
        // console.log("Setting default inside useeffect")
        const promptDataFirstKey = Object.keys(promptDataDefault)[0]
        setPromptData(promptDataDefault)
        setDropDownSelectText(promptDataFirstKey)
        setPromptToUse(promptDataDefault[promptDataFirstKey])
      }
    });
    // Cleanup
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      // console.log("Listener Removed")
    };
  }, []);
  // const handleChangeOnNewText = (event) => {
  //   setSelectedText(event.target.value);
  // };
  // const handleChangeOnPrompt = (event) => {
  //   setPromptToUse(event.target.value);
  // };
  const sendContentToTab = (promptedData) => {
    // console.log("Inside new function")
    // Retreive the textarea element
    const eleSearchBox = document.querySelector("#b_sydConvCont > cib-serp").shadowRoot.querySelector("#cib-action-bar-main").shadowRoot.querySelector("div > div.main-container > div > div.input-row > cib-text-input").shadowRoot.querySelector("#searchbox");
    eleSearchBox.focus();
    eleSearchBox.value = promptedData;

    // Simulate a letter typing
    const char = '.'; // Character to type
    let event = new KeyboardEvent("keydown", { // create a keydown event
      key: char, // the key property is the character
      code: "Key" + char.toUpperCase(), // the code property is the key code
      keyCode: char.charCodeAt(0), // the keyCode property is the ASCII value
      which: char.charCodeAt(0), // the which property is the same as keyCode
      shiftKey: false, // no modifier keys
      ctrlKey: false,
      metaKey: false
    });
    eleSearchBox.dispatchEvent(event); // dispatch the keydown event
    event = new KeyboardEvent("beforeinput", { // create a beforeinput event
      key: char,
      code: "Key" + char.toUpperCase(),
      keyCode: char.charCodeAt(0),
      which: char.charCodeAt(0),
      shiftKey: false,
      ctrlKey: false,
      metaKey: false
    });
    eleSearchBox.dispatchEvent(event); // dispatch the beforeinput event
    eleSearchBox.value += char; // append the character to the eleSearchBox value
    event = new KeyboardEvent("input", { // create an input event
      key: char,
      code: "Key" + char.toUpperCase(),
      keyCode: char.charCodeAt(0),
      which: char.charCodeAt(0),
      shiftKey: false,
      ctrlKey: false,
      metaKey: false
    });
    eleSearchBox.dispatchEvent(event); // dispatch the input event
    event = new KeyboardEvent("keyup", { // create a keyup event
      key: char,
      code: "Key" + char.toUpperCase(),
      keyCode: char.charCodeAt(0),
      which: char.charCodeAt(0),
      shiftKey: false,
      ctrlKey: false,
      metaKey: false
    });
    eleSearchBox.dispatchEvent(event); // dispatch the keyup event    
    let eleSendBtn = document.querySelector("#b_sydConvCont > cib-serp").shadowRoot.querySelector("#cib-action-bar-main").shadowRoot.querySelector("div > div.main-container > div > div.bottom-controls > div.bottom-right-controls > div.control.submit > button")
    setTimeout(() => {
      eleSendBtn.click()
    }, 1000)

    // return "";


  }
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  const handleSubmit = async (event) => {
    event.preventDefault();
    const promptedData = promptToUse + '\n' + selectedText
    // let url = "https://www.bing.com/search?q=" + encodeURIComponent(promptedData);
    let url = "https://www.bing.com/chat"
    let createdTab = await chrome.tabs.create({ url: url });
    // console.log(document.readyState)
    await delay(1000)
    let injectionResults = await chrome.scripting.executeScript({
      target: { tabId: createdTab.id },
      func: sendContentToTab,
      args: [promptedData]
    });
    // Inject script only if loaded 
    // if (document.readyState === 'ready' || document.readyState === 'complete') {
    //   console.log("page state:" + document.readyState)
    //   injectionResults = await chrome.scripting.executeScript({
    //     target: { tabId: createdTab.id },
    //     func: sendContentToTab,
    //     args: [promptedData]
    //   });
    // } else {
    //   console.log("listener added:" + document.readyState)
    //   document.onreadystatechange = async function () {
    //     if (document.readyState == "complete") {
    //       injectionResults = await chrome.scripting.executeScript({
    //         target: { tabId: createdTab.id },
    //         func: sendContentToTab,
    //         args: [promptedData]
    //       });
    //     }
    //   }
    // }

    // console.log("injected a function");
    let { result } = injectionResults[0];
    console.log("Out: " + result);
    // alert("Tab created");

  };
  const handleDropDownClick = (element) => {
    setAddPageOpen(false)
    setPromptToUse(promptData[element]);
    setDropDownSelectText(element);

    // Set default value by rearranging the json 
    chrome.storage.local.set({ promptDataDefaultKey: element }).then(() => {
      console.log("Default is set");
    });
  }
  const handleDeleteClick = () => {
    let promptDataCopy = { ...promptData }
    delete promptDataCopy[dropDownSelectText]
    setPromptData(promptDataCopy)
    chrome.storage.local.set({ promptData: JSON.stringify(promptDataCopy) }).then(() => {
      // console.log("Value is set after deletion");
      alert("Deleted")
      setDropDownSelectText('Select Prompt')
      setPromptToUse('')
    });
  }

  const handleSaveClick = () => {
    if (promptName) {
      let promptDataCopy = { ...promptData }
      promptDataCopy[promptName] = promptToUse
      setPromptData(promptDataCopy)
      chrome.storage.local.set({ promptData: JSON.stringify(promptDataCopy) }).then(() => {
        // console.log("Value is set after addition");
        alert("Saved")
        setAddPageOpen(false)
        setDropDownSelectText(promptName)
        setPromptName('')
      });
    }
    else {
      alert("Prompt name is missing")
    }

  }
  const handleAddClick = () => {
    setAddPageOpen(!addPageOpen)
    setPromptName(dropDownSelectText)
  }
  const handlePromptNameChange = (event) => {
    const val = event.target.value
    if (typeof val === 'string' && val.length < 30) {
      setPromptName(val)
    }
  }
  const handlePromptToUse = (event) => {
    const val = event.target.value
    setPromptToUse(val)
    // setCounterLetter(selectedText.length + val.length)
  }
  const handleSelectedText = (event) => {
    const val = event.target.value
    setSelectedText(val)
    // setCounterLetter(promptToUse.length + val.length)
  }
  // const funcSetSelectedText = (value) => {
  //   console.log(value + " ## " + promptToUse)
  //   setCounterLetter(value.length + promptToUse.length)
  //   setSelectedText(value)
  // }

  // const funcSetPromptToUse = (value) => {
  //   setCounterLetter(value.length + selectedText.length)
  //   setPromptToUse(value)
  // }
  return (
    <>
      {/* APP BAR */}
      <Navbar>
        <Dropdown dropDownSelectText={dropDownSelectText}>
          {promptData && Object.keys(promptData).length > 0 ? (
            Object.keys(promptData).map((element) => {
              return <a href="#" onClick={(e) => handleDropDownClick(element)}>{element}</a>
            })
          ) : (
            <div>No prompt available</div>
          )}
        </Dropdown>
        <button type="button" onClick={handleAddClick} className="navbtn" style={{
          width: "auto",
          maxWidth: "200px",
          minWidth: "10px"
        }}>
          <AddIcon fontSize="small" />

        </button>
      </Navbar >

      {/* APP BODY */}
      < div className="appBody" >


        <h1 >BingPrompter!</h1>
        <form onSubmit={handleSubmit} style={{
          display: "flex",
          height: "100%",
          alignItems: "flex-start",
          flexDirection: "column"
        }}>

          {/* <label> */}
          {addPageOpen && <>
            <h3 >Prompt Name to save:</h3>
            <textarea
              value={promptName}
              onChange={handlePromptNameChange}
              style={{
                height: "2em",
                padding: "3px",
                whiteSpace: "nowrap",
                resize: "none",
                width: CONSTANT.TEXTAREA_WIDTH,
                minWidth: CONSTANT.MIN_TEXTAREA_WIDTH
              }}
            /></>}
          <h3 >Prompt:</h3>
          <textarea
            value={promptToUse} ref={textAreaPromptTextRef}
            onChange={handlePromptToUse}
            // {(event) => setPromptToUse(event.target.value)}
            style={{
              minHeight: CONSTANT.MIN_TEXTAREA_HEIGHT,
              resize: "none",
              width: CONSTANT.TEXTAREA_WIDTH,
              minWidth: CONSTANT.MIN_TEXTAREA_WIDTH
            }}
          />
          <h3>Selected Text:</h3>
          <textarea
            value={selectedText} ref={textAreaNewTextRef}
            onChange={handleSelectedText}
            // {(event) => setSelectedText(event.target.value)}
            style={{
              minHeight: CONSTANT.MIN_TEXTAREA_HEIGHT,
              resize: "none",
              width: CONSTANT.TEXTAREA_WIDTH,
              minWidth: CONSTANT.MIN_TEXTAREA_WIDTH
            }}
          />
          <h4>{promptToUse.length + selectedText.length}/{CONSTANT.Max_COUNTER_Length}</h4>

          <div style={{ textAlign: "center", width: "100%" }}>
            <button type="submit" style={{
              width: "30%",
              maxWidth: "200px",
              minWidth: "10px"
            }}>
              Submit
            </button>
            {addPageOpen ? <button type="button" onClick={handleSaveClick} style={{
              width: "30%",
              maxWidth: "200px",
              minWidth: "10px",
              marginInline: "2%"
            }}>
              Save
            </button> : <button type="button" onClick={handleDeleteClick} style={{
              width: "30%",
              maxWidth: "200px",
              minWidth: "10px",
              marginInline: "2%"
            }}>
              Delete
            </button>}
          </div>
        </form >
      </div >
    </>
  );
}

export default App;
