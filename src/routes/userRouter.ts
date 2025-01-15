import {Router} from 'express'
import * as userController from '../controllers/userController'
import {checkAuthenticated, checkNotAuthenticated} from '../middleware/auth'
const router = Router()

router.post('/signup', checkNotAuthenticated ,userController.userSignup)
router.post('/login', checkNotAuthenticated, userController.userLogin)
router.post('/logout', checkAuthenticated, userController.userLogout)
router.put('/subscribe', checkAuthenticated, userController.userSubscribe)
router.put('/unsubscribe', checkAuthenticated, userController.userUnsubscribe)
router.post('/:id/send-code', checkAuthenticated, userController.sendWithdrawMail)
router.delete('/:id/withdraw', checkAuthenticated, userController.userWithdraw)

export default router