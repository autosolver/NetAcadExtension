
const express = require('express')
const app = express()
const Scrapper = require('./Scrapper')
const questionModel = require('./questionModel')


app.get("/pop", (req, res) => {



    populateTheDb(req, res)


})

app.get("/q/:q", (req, res) => {
    const query = new RegExp(req.params.q, 'i')
    questionModel.findOne({ title: query }, (err, question) => {
        if (err)
            return res.send(err)
        res.status(200)
        res.json(question)


        console.log(question.title)
    })
})


async function populateTheDb(req, res) {
    var scrapper = new Scrapper("https://www.ccna7.com/ccna3-v6-0/ccna3-v6-0-chapter-3-exam-full-100/")

    return await scrapper.getQuestions().then(result => {

        questionModel.collection.insertMany(result, (err, result) => {

            if (err)
                return res.send(err)

            res.send(result)

        })
    })
}


app.listen(3000)
console.log("sitati") 