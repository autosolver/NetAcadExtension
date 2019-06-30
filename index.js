
const express = require('express')
const app = express()
const Scrapper = require('./Scrapper')
const questionModel = require('./questionModel')
const examLinks = require("./allExamLinks")


app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get("/pop/:url", (req, res) => {
    console.log(req.params.url)
    populateTheDb(req, res)


})

app.get("/q/:q", (req, res) => {

    smartFindOne( req, res)

})

function smartFindOne(req, res) {


    var query = req.params.q
    var cleanQ = "________"
    try {
        cleanQ = query.split("?")[0]
    } catch (error) {

    }

    questionModel.findOne({ title: cleanQ }, (err, question) => {
        if (err)
            return res.send(err)





        if (!question) {
            try {
                cleanQ = query.split("").splice(8).join("")
            } catch (error) {

            }
            return questionModel.findOne({ title: cleanQ }, (err, question) => {
                res.status(200)
                return res.json(question)
            })


        } else {
            res.status(200)
            return res.json(question)
        }


    })
}
app.get("/all", (req, res) => {
    const query = new RegExp(req.params.q, 'i')
    questionModel.find({}, (err, question) => {
        if (err)
            return res.send(err)
        res.status(200)
        res.json(question)



    })
})


async function populateTheDb(req, res) {
    var scrapper = new Scrapper(req.params.url)
console.log("######## populating with link "+req.params.url)
    return await scrapper.getQuestions().then(results => {
        var cleanResults=[]
        for (var j in results) {
            if (results[j].title) { 

                results[j].identifier =  "#"+req.params.url + "-" + results[j].title.replace(/\ /g,"")

                cleanResults.push(results[j])
            }

        }

        questionModel.collection.insertMany(cleanResults, (err, result) => {

            if (err)
                return res.send(err)

            res.send(result)

        })
    })
}

var lockPop = false
app.get("/populate/:pin", (req, res) => {

    if (req.params.pin == "2346" && !lockPop) {
        lockPop = true
        populateFullDb()
        res.send("populating db")
    }
    else if (lockPop) {
        res.send("Pupulating db in process. Locked! ")
    } else {
        res.send("INCORRECT PIN")
    }

})

async function populateFullDb() {
    for (var i in examLinks) {
        try {
             var scrapper = new Scrapper(examLinks[i])
        console.log("############# " + i + " of " + examLinks.length + " ################")

        await scrapper.getQuestions().then(results => {
            console.log("---> Questions retrieved: " + results.length)
            var cleanResults = []
            for (var j in results) {
                if (results[j].title) { 

                    results[j].identifier = "#"+examLinks[i] + "-" + results[j].title.replace(/\ /g,"")

                    cleanResults.push(results[j])
                }

            }

            questionModel.collection.insertMany(cleanResults, (err, result) => {

                if (err)
                    return console.log("---> " + examLinks[i] + " failed")

                console.log("---> " + (examLinks[i]) + " successful")

            })
        })
        } catch (error) {
            console.log("EXIT ERROR *** "+examLinks[i])
        } 
       
    }

    lockPop = false

}

app.listen(3000)
console.log("sitati") 