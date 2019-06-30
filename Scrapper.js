const cheerio = require('cheerio')
var request = require('request');


class Scrapper {

    constructor(URL) {
        this.pageUrl = URL

        this.titleSelectors =[
            "h3",
            'div[class="ai-stem"]>strong', 'strong'
      ]
          this.questionsSelectors =[
            'ol[class="wpProQuiz_list"] > li',
            "div.entry-content > ol > li", 

          ]
          this.choicesSelectors =[
              'li[class="wpProQuiz_questionListItem"]',
              'ul > li' 
          ]
    }


     

    async getQuestions() {



        var pageStr = await this.getPageString().then((result) => {
            return result
        })


        const $ = cheerio.load(pageStr)

        var questions = [] 
 
        //loops through the questions list   
    var questionsEl= this.getElement($,this.questionsSelectors,$("body"))
    if(questionsEl)
       questionsEl.each((questionIndex, questionEl) => {
            var question = {}

            try {
                 
                var titleEl =  this.getElement($,this.titleSelectors, questionEl)
                if(titleEl)
            var title = titleEl.text()
            try {
                var title = titleEl.text().split("Explanation:")[0]
            } catch (error) {
                console.log(error)
            }
            } catch (error) {
                console.log(error)

            }

            question.title = this.prettifyString(title)
            question.solution = this.getSolution($, questionEl)

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
    getSolution($, questionEl) {

        var solution = { choices: [] }
        
        var choicesEl=this.getElement($,this.choicesSelectors,questionEl)
        if(choicesEl)
        choicesEl.each((choiceIndex, choiceEl) => {
            var choice = {}
            var cleanChoice = ""
            try {
                cleanChoice = this.prettifyString($(choiceEl).text())
                try {
                    cleanChoice = this.prettifyString($(choiceEl).text()).split("Explanation:")[0]
                    console.log("hi yaaaa")

                    var expl = $('div[class="itemfeedback"]', choiceEl).text()|| this.prettifyString($(choiceEl).text()).split("explanation")[1]
                } catch (error) {
                    console.log("hi yaaaa",error)
                } 
                if (expl)
                    solution.explanation = this.prettifyString(expl)

            } catch (error) {
                console.log("Error cleaning answer...", error)
                cleanChoice = $(choiceEl).text()
            }


            choice.name = cleanChoice
            if ($('span[style*="color"]', choiceEl).text()) {

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


  

    getElement($,selectors,root) {  
        var element=null
        for (var i = 0; i < selectors.length; i++) {
            element=$(selectors[i],root)

            
            if (element&&element.length>0){ 
                 
                  return element
                   
                   
            }
              

        }  

        if(element)
        console.log("FATAL ERROR _______________",this.pageUrl, selectors,"_______________________")
        return false
    } 

}






module.exports = Scrapper