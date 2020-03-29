(async function () {
    miniDb = []
    let rootURL = 'https://ccna.aimuhire.com'
    let query = ""
    let oldQuery = ""
    function getQuestionSolution() {



        let q = window.getSelection().toString()

        try {
            query = document.querySelector('div[class="question"] span[class="questionText"]').innerText
        } catch (error) {
            query = q
        }

        // do not make similar queries!!
        if (query === oldQuery)
            return

        //check if solution already in minidb
        for (let i in miniDb) {
            if (miniDb.length > 0 && miniDb[i].title == query)
                return displaySolution(miniDb[i])
        }


        if (!query || query.length < 10) {
            //  document.querySelector("answer").innerHTML=""
            return
        }



        // console.log("old: ",oldQuery,"new: ",query)

        getSolution(rootURL + '/q/' + encodeURIComponent(query), (err, result) => {

            oldQuery = query
            if (err)
                return


            //    console.log("--old: ",oldQuery,"--new: ",query)
            let examResult = JSON.parse(result)
            if (!examResult)
                return

            console.log("exres", examResult)
            let solution = examResult.questions[0]
            miniDb.push(solution)
            displaySolution(solution)
        })




    }
    function createAnswerDiv() {
        let answerEl = document.createElement("div")
        answerEl.id = "answer"

        answerEl.className = "noselect"
        document.body.appendChild(answerEl)
        return answerEl
    }

    function createShowHide() {
        let showHide = document.createElement("div")

        showHide.id = "showHide"

        let show = document.createElement("span")
        show.id = "show"

        show.className = "noselect"
        show.innerText = "Show Question"
        show.style = "display:none"

        showHide.style.cursor = "pointer"
        showHide.appendChild(show)


        let hide = document.createElement("span")
        hide.id = "hide"
        hide.className = "noselect"
        hide.innerText = "Hide Question"
        showHide.appendChild(hide)
        hide.addEventListener("click", (e) => {
            if (!document.getElementById("answer"))
                return
            document.getElementById("answer").style.display = "none"
            hide.style.display = "none"
            show.style.display = "block"
        })

        show.addEventListener("click", (e) => {
            if (!document.getElementById("answer"))
                return
            document.getElementById("answer").style.display = "block"
            show.style.display = "none"
            hide.style.display = "block"


        })
        document.body.appendChild(showHide)
    }


    function createHelp() {
        let helpDiv = document.createElement("div")
        helpDiv.id = "help"

        let helpText = document.createElement("div")
        helpText.id = "helpText"
        helpText.innerHTML = `
    <span style="display:block">Answers are in red. <a href="https://github.com/autosolver/NetAcadExtension/issues">Report a bug.</a>.</span>
    <span  >Not the correct answer? </span>
   
    <a href="https://google.com/search?q=${query} CCNA answer" target="_blank">search answer online.</a>
   
    <span style="display:block">This tool is open-source. Please, support development. <a target="_blank" href="https://github.com/autosolver/NetAcadExtension">GitHub Repo</a></span>
 

    `


        helpDiv.appendChild(helpText)

        helpDiv.style.marginBottom = "30px"
        return helpDiv
    }

    function createTitle() {
        let title = document.createElement("h4")
        title.id = "answerTitle"
        title.innerText = "loading..."
        return title
    }


    function createChoiceList() {
        let choiceList = document.createElement("ol")
        choiceList.id = "answerList"

        return choiceList
    }


    function getSolution(url, callback) {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                callback(null, xmlHttp.responseText);
            } else if (xmlHttp.readyState == 4) {
                callback(true, null)
            }

        }
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }



    function checkTrueAnswers(choices) {

        for (let i in choices)
            if (choices[i].isAnswer)
                checkChoice(choices[i])

    }

    function checkChoice(choice) {
        let options = document.querySelectorAll('div[class="question"] label')
        //if choice.name ends with asteriks remove it.
        let correctChoice = choice.name
        if (correctChoice.endsWith("*"))
            correctChoice = correctChoice.substring(0, correctChoice.length - 1)
        for (let i in options) {
            if (options[i].innerText == correctChoice)
                document.querySelectorAll('div[class="question"] input')[i].checked = true
        }

    }



    function displaySolution(result) {

        try {
            for (let i in document.querySelectorAll('[id="answer"]'))
                document.querySelectorAll('[id="answer"]')[i].outerHTML = ""


        } catch (error) {

        }

        let answerDiv = createAnswerDiv()
        answerDiv.appendChild(createTitle())
        let choiceList = createChoiceList()
        answerDiv.appendChild(choiceList)

        if (result)
            if (result.title)
                document.getElementById("answerTitle").innerText = result.title

        if (result && result.solution && result.solution.choices)
            document.getElementById("answerList").innerHTML = ""
        result.solution.choices.forEach(choice => {
            let li = document.createElement("li")
            li.innerText = choice.name
            if (choice.isAnswer)
                li.style = "color:#ff5858"
            document.getElementById("answerList").appendChild(li)
        })


        if (result.htmlSolution) {
            let innerH = result.htmlSolution.replace('href="', 'href="#"')
            answerDiv.innerHTML = innerH
        }


        if (result.solution.explanation) {
            let expEl = document.createElement("p")
            expEl.id = "explanation"
            expEl.innerHTML = "<strong>Explanation: </strong>" + result.solution.explanation
            answerDiv.appendChild(expEl)
        }
        document.getElementById("answer").appendChild(createHelp())
        checkTrueAnswers(result.solution.choices)



    }

    window.onload = function () {
        let intervalID = setInterval(async function () {
            let isPowerOn = await getStorageValue("IS_POWER_ON")
            let isSelectOn = await getStorageValue("IS_SELECT_ON")

            if (!isPowerOn || !isSelectOn) {
                clearInterval(intervalID)
            }
            if (!isPowerOn) {
                return removeElementsFromView()
            }


            let logQuestion = document.querySelector('div[class="question"] span[class="questionText"]')
            //    if (logQuestion)
            getQuestionSolution()

            let answerDiv = document.getElementById("answer")
            let controlView = document.getElementById("showHide")
            if (answerDiv && !controlView) {
                createShowHide()

            }

            console.clear()
            console.log("(((((((NETACAD AUTO SOLVER EXTENSION RUNNING)))))))")

        }, 1000)


    }


    function removeElementsFromView() {
        let answerEl = window.document.getElementById("answer")
        if (answerEl)
            answerEl.hidden = true
        let showHideEl = window.document.getElementById("showHide")
        if (showHideEl)
            showHideEl.hidden = true
    }

    function getStorageValue(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get([key], function (result) {
                resolve(result[key])
            });
        })


    }
})()
