import express from 'express';
import { registerUser, loginUser, updateProfile, changePassword } from '../controllers/auth.controller';
import { auth } from '../middlewares/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/me', auth, updateProfile);
router.put('/change-password', auth, changePassword);

export default router;
