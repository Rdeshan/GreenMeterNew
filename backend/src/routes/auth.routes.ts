import express from 'express';
import { registerUser, loginUser, updateProfile, changePassword, forgotPassword, resetPassword, forgotPasswordOtp, resetPasswordWithOtp } from '../controllers/auth.controller';
import { auth } from '../middlewares/auth';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/me', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/forgot-password-otp', forgotPasswordOtp);
router.post('/reset-password-otp', resetPasswordWithOtp);

export default router;
