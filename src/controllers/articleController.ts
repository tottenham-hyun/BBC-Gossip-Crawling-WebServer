import Article from '../models/Article'
import {Request, Response} from 'express'

// 전부 다 가져오기
// export const getAllArticle = (req:Request,res:Response)=>{
//     Article.find({})
//     .then(data => {
//         res.send(data)
//     })
//     .catch(err => {
//         console.log(err)
//         res.status(503).send('실패')
//     })
// }


// 페이징
export const getPageArticle = async (req : Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1 // 기본 시작 페이지는 1
    const limit = parseInt(req.query.limit as string) || 10 // 한 페이지에 10개
    const skip = (page-1) * limit // 가져올 시작위치

    try {
        const articles = await Article.find()
                        .skip(skip) // 페이징
                        .limit(limit) // 가져올 개수

        const total = await Article.countDocuments() // 전체 데이터 개수
        res.send({
            page,
            limit,
            total,
            articles
        })
    } catch(err){
        res.send(err)
    }
}
