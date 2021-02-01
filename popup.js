console.log("popup.js RUNNING");
(async function () {
  let power = window.document.getElementById("powerbtn");
  let select = window.document.getElementById("selectbtn");

  //find if the storage has a saved state

  let isPowerOn = await getStorageValue("IS_POWER_ON").then((result) => result);
  let isSelectOn = await getStorageValue("IS_SELECT_ON").then(
    (result) => result
  );
  power.innerHTML = isPowerOn
    ? "Stop NetAcad AutoSolver"
    : "Start NetAcad AutoSolver<br/>(Will Reload Page)";
  select.innerHTML = isSelectOn
    ? "Disable Select for Answer"
    : "Enable Select for Answer<br/>(Will Reload Page)";
  makePowerStyle(isPowerOn);
  makeSelectStyle(isSelectOn);
  //if ispoweron is undefined, it's first use so use powered on styles
  if (typeof isPowerOn === "undefined") {
    makePowerStyle(true);
    await setStorageValue("IS_POWER_ON", true);
    isPowerOn = true;
  }
  if (typeof isSelectOn === "undefined") {
    makePowerStyle(true);
    await setStorageValue("IS_SELECT_ON", true);

    isSelectOn = true;
  }

  power.addEventListener("click", async function (event) {
    isPowerOn = await getStorageValue("IS_POWER_ON").then((result) => result);
    power.innerText = isPowerOn ? "Stopping..." : "Starting...";
    isPowerOn = !isPowerOn;
    await setStorageValue("IS_POWER_ON", isPowerOn);
    if (isPowerOn) refreshPage();
    isPowerOn = await getStorageValue("IS_POWER_ON").then((result) => result);
    setTimeout(() => {
      power.innerHTML = isPowerOn
        ? "Stop NetAcad AutoSolver"
        : "Start NetAcad AutoSolver<br/>(Will Reload Page)";
      makePowerStyle(isPowerOn);
    }, 1000);
  });

  select.addEventListener("click", async function (event) {
    isSelectOn = await getStorageValue("IS_SELECT_ON").then((result) => result);
    if (!isSelectOn && !isPowerOn)
      if (
        confirm(
          "Are you sure you want to Enable Select For Answer and Start the extension?(Will Reload Page)"
        )
      ) {
        power.click();
      } else return;

    select.innerText = isSelectOn ? "disabling..." : "enabling...";
    isSelectOn = !isSelectOn;

    await setStorageValue("IS_SELECT_ON", isSelectOn);

    if (isSelectOn) refreshPage();
    isSelectOn = await getStorageValue("IS_SELECT_ON").then((result) => result);
    setTimeout(() => {
      select.innerHTML = isSelectOn
        ? "Disable Select for Answer"
        : "Enable Select for Answer<br/>(Will Reload Page)";
      makeSelectStyle(isSelectOn);
    }, 1000);
  });

  function refreshPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
    });
  }

  function makePowerStyle(isPowerOn) {
    if (isPowerOn)
      power.style = `
border-radius: 20px;
width:200px;
padding:10px;
outline: none; 
color:red;
border: red 2px solid;
display: block;
font-size: 1.1em;
background-color:white; 
box-shadow: 1px 1px 8px 0px rgba(0,0,0,0.75);`;
    else
      power.style = `
border-radius: 20px;
padding:10px;
width:200px;
outline: none; 
color:green;
border: green 1px solid;
display: block;
font-size: 1.1em;
background-color:white; 
box-shadow: 1px 1px 8px 0px rgba(0,0,0,0.75);`;
  }
  function makeSelectStyle(isPowerOn) {
    select.style = isSelectOn
      ? `
border-radius: 20px;
width:200px;
padding:10px;
outline: none; 
color:#42003f;
border: #42003f 1px solid;
display: block;
font-size: 1.1em;
background-color:white; 
box-shadow: 1px 1px 8px 0px rgba(0,0,0,0.75);
`
      : `
border-radius: 20px;
padding:10px;
width:200px;
outline: none; 
color:green;
border: green 1px solid;
display: block;
font-size: 1.1em;
background-color:white;
box-shadow: 1px 1px 8px 0px rgba(0,0,0,0.75);
`;
  }

  function setStorageValue(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [key]: value }, function (e) {
        resolve(value);
      });
    });
  }

  function getStorageValue(key) {
    return new Promise((resolve, reject) => {
      if (!chrome.storage) return alert("chrome storage not available");
      chrome.storage?.sync.get([key], function (result) {
        resolve(result[key]);
      });
    });
  }
})();
