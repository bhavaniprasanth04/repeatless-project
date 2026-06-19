const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);
router.get('/status', authController.getStatus);
router.post('/logout', authController.logout);

module.exports = router;
