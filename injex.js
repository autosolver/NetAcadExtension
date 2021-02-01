class NetAcadExtension {
  constructor() {
    this.handleSolutionResult = this.handleSolutionResult.bind(this);
  }
  miniDb = {};
  failingQueryDb = {};
  rootURL = "https://api.autosolver.xyz";
  query = "";
  previousQuery = "";
  statusBarElement = null;
  choiceList = null;
  explanationElement = null;

  getQuestionSolution() {
    const selectedQuery = window.getSelection().toString();
    const questionText = document.querySelector(
      'div[class="question"] span[class="questionText"]'
    )?.innerText;
    this.query = questionText || selectedQuery;
    // Do not repeat failing query.
    if (this.failingQueryDb[this.query] == 404) return;
    // do not make similar queries!!
    if (this.query === this.previousQuery) return;
    //check if solution already in minidb
    if (this.miniDb.hasOwnProperty(this.query)) {
      return this.displaySolution(this.miniDb[this.query]);
    }
    // don't make short length queries
    if (!this.query || this.query.length < 10) {
      if (this.statusBarElement) {
        this.statusBarElement.innerText = "Query too short.";
      }
      return;
    }
    if (this.statusBarElement) this.statusBarElement.innerText = "Querying...";
    fetch(`${this.rootURL}/q/${encodeURIComponent(this.query)}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status == 404) {
          this.failingQueryDb[this.query] = 404;
          if (this.statusBarElement)
            this.statusBarElement.innerText = `No result found for query: "${this.query}"`;
        } else if (this.statusBarElement) {
          this.statusBarElement.innerText = "Something went wrong.";
        }
        this.hideQuestionAnswer();
      })
      .then((solutionData) => {
        if (solutionData?.errmsg || solutionData?.message) {
          this.failingQueryDb[this.query] = 500;
          if (this.statusBarElement) {
            this.statusBarElement.innerText =
              solutionData?.message || "Something went wrong.";
            this.hideQuestionAnswer();
          }
        } else {
          this.handleSolutionResult(solutionData);
        }
      })
      .catch((err) =>
        console.error("NetAcad Autosolver Extension Request Error", err)
      );
  }

  handleSolutionResult(examResult) {
    this.previousQuery = this.query;
    if (!examResult) return;
    const solution = examResult?.questions ? examResult.questions[0] : null;
    if (!solution) return;
    // Save query in local db.
    this.miniDb[this.query] = solution;
    this.displaySolution(solution);
  }

  createAnswerDiv() {
    let answerEl = document.createElement("div");
    answerEl.id = "answer";
    answerEl.className = "noselect";
    document.body.appendChild(answerEl);
    return answerEl;
  }

  createShowHide() {
    let showHide = document.createElement("div");

    showHide.id = "showHide";

    let show = document.createElement("span");
    show.id = "show";

    show.className = "noselect";
    show.innerText = "Show";
    show.style = "display:none";

    showHide.style.cursor = "pointer";
    showHide.appendChild(show);

    let hide = document.createElement("span");
    hide.id = "hide";
    hide.className = "noselect";
    hide.innerText = "Hide";
    showHide.appendChild(hide);
    hide.addEventListener("click", (e) => {
      if (!document.getElementById("answer")) return;
      document.getElementById("answer").style.display = "none";
      hide.style.display = "none";
      show.style.display = "block";
    });

    show.addEventListener("click", (e) => {
      if (!document.getElementById("answer")) return;
      document.getElementById("answer").style.display = "block";
      show.style.display = "none";
      hide.style.display = "block";
    });
    document.body.appendChild(showHide);
  }

  createHelp() {
    let helpDiv = document.createElement("div");
    let search_query = encodeURIComponent(`"${this.query}" CCNA answer`);
    helpDiv.id = "help";
    let helpText = document.createElement("div");
    helpText.id = "helpText";
    helpText.innerHTML = `
    <span style="font-size:0.7em; display:block">Answers are in red. <a href="https://github.com/autosolver/NetAcadExtension/issues">Report a bug.</a>.</span>
    <span style="font-size:0.7em">Not the right question?</span>
    <a style="font-size:0.7em" href="https://google.com/search?q=${search_query}" target="_blank">search answer online.</a>
    <span style="font-size:0.7em; display:block">You can stop this extension by clicking on the extension icon.</span>
    <span style="display:block">This tool is open-source. Please, support development.<br/> <a target="_blank" href="https://www.paypal.com/donate?hosted_button_id=W6YN7K46K5ZSN">Donate</a>   or   <a target="_blank" href="https://github.com/autosolver/NetAcadExtension">Code :)</a></span>`;

    helpDiv.appendChild(helpText);
    helpDiv.style.marginBottom = "30px";
    return helpDiv;
  }

  createTitle() {
    let title = document.createElement("h4");
    title.id = "answerTitle";
    title.innerText = "loading...";
    return title;
  }

  createStatusBarContainer() {
    let statusBar = document.createElement("p");
    statusBar.id = "statusBarDiv";
    statusBar.innerText = "loading...";
    statusBar.style = `font-size: 0.7em;
    display: flex;
    justify-content: center;
    color: blue;
    font-family: monospace;`;
    return statusBar;
  }

  createChoiceList() {
    let choiceList = document.createElement("ol");
    choiceList.id = "answerList";
    return choiceList;
  }

  checkTrueAnswers(choices) {
    for (let i in choices)
      if (choices[i].isAnswer) this.checkChoice(choices[i]);
  }

  checkChoice(choice) {
    let options = document.querySelectorAll('div[class="question"] label');
    //if choice.name ends with asteriks remove it.
    let correctChoice = choice.name;
    if (correctChoice.endsWith("*"))
      correctChoice = correctChoice.substring(0, correctChoice.length - 1);
    for (let i in options) {
      if (options[i].innerText == correctChoice)
        document.querySelectorAll('div[class="question"] input')[
          i
        ].checked = true;
    }
  }

  displaySolution(result) {
    let answerElements = document.querySelectorAll('[id="answer"]');
    for (let i in answerElements) {
      let answerElement = answerElements[i];
      if (typeof answerElement === "object") answerElement.outerHTML = "";
    }
    let answerDiv = this.createAnswerDiv();
    this.statusBarElement = this.createStatusBarContainer();
    this.statusBarElement.innerText = "Completed!";
    answerDiv.appendChild(this.statusBarElement);

    if (result?.title && !result.htmlSolution) {
      this.titleElement = this.createTitle();
      answerDiv.appendChild(this.titleElement);
      document.getElementById("answerTitle").innerText = result.title;
    }

    this.choiceList = this.createChoiceList();
    answerDiv.appendChild(this.choiceList);
    if (result && result.solution && result.solution.choices)
      document.getElementById("answerList").innerHTML = "";
    result.solution.choices.forEach((choice) => {
      let li = document.createElement("li");
      li.innerText = choice.name;
      if (choice.isAnswer) li.style = "color:#ff5858";
      document.getElementById("answerList").appendChild(li);
    });

    if (result.htmlSolution) {
      const htmlSolution = result.htmlSolution.replace('href="', 'href="#"');
      const htmlSolutionEl = document.createElement("div");
      htmlSolutionEl.id = "htmlSolution";
      htmlSolutionEl.innerHTML = htmlSolution;
      answerDiv.appendChild(htmlSolutionEl);
    }

    if (result.solution.explanation) {
      this.explanationElement = document.createElement("p");
      this.explanationElement.id = "explanation";
      this.explanationElement.innerHTML = `<strong>Explanation: </strong> ${result.solution.explanation}`;
      answerDiv.appendChild(this.explanationElement);
    }
    document.getElementById("answer").appendChild(this.createHelp());
    this.checkTrueAnswers(result.solution.choices);
  }

  closeQuestionAnswerBox() {
    let answerEl = window.document.getElementById("answer");
    answerEl?.remove();
    let showHideEl = window.document.getElementById("showHide");
    showHideEl?.remove();
  }

  hideQuestionAnswer() {
    this.choiceList?.remove();
    this.explanationElement?.remove();
    this.titleElement?.remove();
  }
  getStorageValue(key) {
    return new Promise((resolve, reject) => {
      if (!chrome.storage) return alert("chrome storage not available");
      chrome.storage?.sync.get([key], function (result) {
        resolve(result[key]);
      });
    });
  }
}

window.onload = function () {
  const netAcadAutosolver = new NetAcadExtension();
  let intervalID = setInterval(async function () {
    const isPowerOn = await netAcadAutosolver.getStorageValue("IS_POWER_ON");
    const isSelectOn = await netAcadAutosolver.getStorageValue("IS_SELECT_ON");

    if (!isPowerOn || !isSelectOn) {
      clearInterval(intervalID);
    }
    if (!isPowerOn && typeof isPowerOn != "undefined") {
      return netAcadAutosolver.closeQuestionAnswerBox();
    }

    netAcadAutosolver.getQuestionSolution();

    const answerDiv = document.getElementById("answer");
    const controlView = document.getElementById("showHide");
    if (answerDiv && !controlView) {
      netAcadAutosolver.createShowHide();
    }
  }, 1000);
};
