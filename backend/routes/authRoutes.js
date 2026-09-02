import express from 'express';
import {
  handleLogin,
  handleSignup,
  handleGoogleAuth,
  handleAppleAuth,
  getGoogleAuthUrl,
  getAppleAuthUrl,
  handleGetMe
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', handleLogin);
router.post('/signup', handleSignup);
router.post('/google', handleGoogleAuth);
router.post('/apple', handleAppleAuth);
router.get('/google/url', getGoogleAuthUrl);
router.get('/apple/url', getAppleAuthUrl);
router.get('/me', handleGetMe);

export default router;

