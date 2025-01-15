import * as mongoose from 'mongoose'

const articleSchema = new mongoose.Schema({
    img : {
        type : String,
        required : true
    },
    link:{
        type : String,
        required : true,
        unique : true
    },
    description:{
        type : String,
        required : true
    },
    date:{
        type : String,
        required : true
    }
})

const Article = mongoose.model('articles', articleSchema)

export default Article;