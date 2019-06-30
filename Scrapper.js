const cheerio = require('cheerio')
var request = require('request');


class Scrapper {

    constructor(URL) {
        this.pageUrl = URL


    }



    async getQuestions() {



        var pageStr = await this.getPageString().then((result) => {
            return result
        })


        const $ = cheerio.load(pageStr)

        var questions = []

        //loops through the questions list  
console.log("count: ",  $("div.entry-content > ol > li").length)
        $("div.entry-content > ol > li").each((questionIndex, questionEl) => {
            var question = {}

            var title = this.getTitle($, questionEl)

            question.title = this.prettifyString(title)
            question.solution = this.getSolution($, questionIndex)

            question.exam = $("div.entry-content > h2").text()
            question.version = ""
            questions.push(question)

        })
        return questions


    }
    getPageString() {

        return new Promise((resolve, reject) => {

            request(this.pageUrl, function (error, response, body) {

                if (error)
                    reject(error)

                resolve(body)
            })

        })
    }
    getSolution($, questionIndex) {

        var solution = { choices: [] }
        $("div.entry-content > ol > li:nth-child(" + (questionIndex + 1) + ") > ul > li").each((choiceIndex, choiceEl) => {
            var choice = {}
            var cleanChoice = ""
            try { 
                cleanChoice = this.prettifyString($(choiceEl).text())
              var  expl=$('div[class="itemfeedback"]',choiceEl).text()
                if (expl)
                    solution.explanation = this.prettifyString()

            } catch (error) {
                console.log("Error cleaning answer...", error)
                cleanChoice = $(choiceEl).text()
            }


            choice.name = cleanChoice
            if ($('span[style*="color"]',choiceEl).text()) {

                choice.isAnswer = true
                solution.choices.push(choice)

            } else {
                choice.isAnswer = false
                solution.choices.push(choice)
            }



        })


        return solution

    }

    prettifyString(input) {
        var output = "";
        try {

            output = input.replace(/[\r\n( )]+/g, " ").trim()

        } catch (error) {

        }
        return output

    }


    getTitle($, questionEl) {

        var selectors = [
            "h3", 
            'div[class="ai-stem"]>strong','strong'
        ]
        var title = ""
        selectors.forEach((selector) => {
            title = $(selector, questionEl).text() 
            if (title)
                return

        })

        return title;

    }
 

}




module.exports = Scrapper