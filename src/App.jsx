import { useEffect, useLayoutEffect, useRef, useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";

// Nav menu 
// import { ReactComponent as PlusIcon } from './icons/plus.svg';
import AddIcon from '@mui/icons-material/Add';
// import { ReactComponent as CaretIcon } from './icons/caret.svg';
import { Navbar } from './components/NavBar';
import { Dropdown } from "./components/Dropdown";
// import { Dropdown } from './components/Dropdown';
const CONSTANT = {
  MIN_TEXTAREA_HEIGHT: 10,
  MAX_NEWTEXT_TEXTAREA_HEIGHT: 150,
  MAX_PROMPT_TEXTAREA_HEIGHT: 100,
  TEXTAREA_WIDTH: `100%`,
  MIN_TEXTAREA_WIDTH: `200px`
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
  // chrome.storage.local.get('key', (result) => {
  //   console.log(result.key); // Logs the value of 'key' from storage
  // });
  useLayoutEffect(() => {
    console.log("useLayoutEffect")
    // console.log("useLayoutEffect" + textAreaNewTextRef + textAreaNewTextRef?.current + textAreaNewTextRef?.current?.style);
    // console.log(JSON.stringify(textAreaNewTextRef))
    // Reset height - important to shrink on delete
    // let maxHeightValue;
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
      // maxHeightValue = `${Math.min(maxHeightValue, CONSTANT.MAX_NEWTEXT_TEXTAREA_HEIGHT)}px`
      // console.log(textAreaNewTextRef.current.scrollHeight, CONSTANT.MIN_TEXTAREA_HEIGHT, CONSTANT.MAX_NEWTEXT_TEXTAREA_HEIGHT, "Final height:" + maxHeightValue)
      // textAreaNewTextRef.current.style.height = maxHeightValue
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

    console.log("Completed useLayoutEffect")
  }, [selectedText, promptToUse]);




  useEffect(() => {
    console.log("useeffect")

    if (flags.firstRun == true) {
      chrome.storage.session.get(["selectedText"]).then((result) => {
        console.log("Value retrieved from storage 1" + result.selectedText);
        setSelectedText(result.selectedText)
      });
      flags.firstRun = false;
    }
    const handleStorageChange = (changes, namespace) => {
      let [key, { oldValue, newValue }] = Object.entries(changes)[0];
      console.log(
        `Storage key "${key}" in namespace "${namespace}" changed. flags.firstRun : ${flags.firstRun}`,
        `Old value was "${oldValue}", new value is "${newValue}".`
      );
      setSelectedText(newValue)
      // for (let [key, { oldValue, newValue }] of Object.entries(changes)) {}
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
        console.log("Identified a non Json value")
        retrievedData = {}
      }
      // console.log("Value retrieved for promptData" + result.promptData + Object.keys(retrievedData));
      // console.log("From local" + result + result?.promptData)
      if (Object.keys(retrievedData).length != 0) {
        console.log("Setting retrievedData inside useeffect")

        setPromptData(retrievedData)
        // Checking for default key
        chrome.storage.local.get(["promptDataDefaultKey"]).then((result) => {
          const promptDataDefaultKey = result.promptDataDefaultKey
          if (promptDataDefaultKey in retrievedData) {
            setDropDownSelectText(promptDataDefaultKey)
            setPromptToUse(retrievedData[promptDataDefaultKey])
          }
        }).catch((error) => {
          console.error("Checking for default key failed, " + error);
          const promptDataFirstKey = Object.keys(retrievedData)[0]
          setDropDownSelectText(promptDataFirstKey)
          setPromptToUse(retrievedData[promptDataFirstKey])
        })
      }
      else {
        // chrome.storage.local.set({ promptData: JSON.stringify(promptDataDefault) }).then(() => {
        //   console.log("Value is set with default");
        // });
        console.log("Setting default inside useeffect")
        const promptDataFirstKey = Object.keys(promptDataDefault)[0]
        setPromptData(promptDataDefault)
        setDropDownSelectText(promptDataFirstKey)
        setPromptToUse(promptDataDefault[promptDataFirstKey])

      }


    });
    // Cleanup
    return () => {

      chrome.storage.onChanged.removeListener(handleStorageChange);
      // window.removeEventListener('resize', handleResize);
      console.log("Listener Removed")
    };

  }, []);
  const handleChangeOnNewText = (event) => {
    setSelectedText(event.target.value);
  };
  const handleChangeOnPrompt = (event) => {
    setPromptToUse(event.target.value);
  };
  const handleSubmit = (event) => {
    event.preventDefault();

    let url = "https://www.bing.com/search?q=" + encodeURIComponent(promptToUse + '\n' + selectedText);
    chrome.tabs.create({ url: url });
    // alert("Tab created");

  };
  const handleDropDownClick = (element) => {
    setAddPageOpen(false)
    setPromptToUse(promptData[element]);
    setDropDownSelectText(element);

    // Set default value by rearranging the json 
    chrome.storage.local.set({ promptDataDefaultKey: element }).then(() => {
      console.log("Value is set after default is set");
    });
  }
  const handleDeleteClick = () => {
    let promptDataCopy = { ...promptData }
    delete promptDataCopy[dropDownSelectText]
    setPromptData(promptDataCopy)
    chrome.storage.local.set({ promptData: JSON.stringify(promptDataCopy) }).then(() => {
      console.log("Value is set after deletion");
      // alert("Deleted")
      // const promptDataFirstKey = Object.keys(retrievedData)[0]
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
        console.log("Value is set after addition");
        // alert("Saved")
        // const promptDataFirstKey = Object.keys(retrievedData)[0]
        setAddPageOpen(false)
        setDropDownSelectText(promptName)
        setPromptName('')

        // setPromptToUse()
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
        {/* <div > */}
        <form onSubmit={handleSubmit} style={{
          display: "flex",
          height: "100%",
          alignItems: "flex-start",
          flexDirection: "column"
          // textAlign: "left"
        }}>

          {/* <label> */}
          {addPageOpen && <>
            <h3 >Prompt Name to save:</h3>
            {/* <textarea rows="1" style="resize: none; white-space: nowrap; overflow-x: scroll;"></textarea> */}
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
            onChange={(event) => setPromptToUse(event.target.value)}
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
            onChange={(event) => setSelectedText(event.target.value)}
            style={{
              minHeight: CONSTANT.MIN_TEXTAREA_HEIGHT,
              resize: "none",
              width: CONSTANT.TEXTAREA_WIDTH,
              minWidth: CONSTANT.MIN_TEXTAREA_WIDTH
            }}
          />
          {/* </label> */}
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
