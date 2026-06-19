const express = require('express');
const router = express.Router();
const emailsController = require('../controllers/emailsController');
const syncController = require('../controllers/syncController');

router.post('/sync', syncController.syncEmails);
router.get('/threads', emailsController.getThreads);
router.get('/stats', emailsController.getStats);
router.post('/compose', emailsController.handleCompose);
router.post('/reply', emailsController.handleReply);

module.exports = router;
