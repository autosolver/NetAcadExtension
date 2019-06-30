
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ccnaSelectDb', { useNewUrlParser: true });

const Schema = mongoose.Schema;

const questionSchema = new Schema({
    title: String,
    identifier:{type:String,unique:true},
    solution: {
        choices: [
            {
                name: String,
                isAnswer: Boolean,
            }
        ],
        explanation:String,
    },
    exam: String,
    version: String,
});

const qModel = mongoose.model('ModelName', questionSchema)

module.exports = qModel