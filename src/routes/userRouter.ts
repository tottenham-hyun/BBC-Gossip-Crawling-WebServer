import {Router} from 'express'
import * as userController from '../controllers/userController'
import {checkAuthenticated, checkNotAuthenticated} from '../middleware/auth'
const router = Router()

router.post('/signup', checkNotAuthenticated ,userController.userSignup)
router.post('/login', checkNotAuthenticated, userController.userLogin)
router.post('/logout', checkAuthenticated, userController.userLogout)

router.patch('/subscribe', checkAuthenticated, userController.userSubscribe)
router.patch('/unsubscribe', checkAuthenticated, userController.userUnsubscribe)

router.patch('/:id/modify-info', checkAuthenticated, userController.userModifyInfo)
router.patch('/:id/modify-password', checkAuthenticated, userController.userChangePassword)

router.post('/:id/send-code', checkAuthenticated, userController.sendCode)
router.delete('/:id/withdraw', checkAuthenticated, userController.userWithdraw)

export default router