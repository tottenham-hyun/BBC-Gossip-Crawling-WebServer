import {Router} from 'express'
import * as articleController from '../controllers/articleController'

const router = Router()

// router.get('/', articleController.getAllArticle)
router.get('/', articleController.getPageArticle)

export default router