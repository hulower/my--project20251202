const express = require('express');

const router = express.Router();

router.get('/hello', (req, res) => {
  console.log('Received request: GET /api/hello');
  res.json({ message: 'Hello from Node.js backend!' });
});

module.exports = router;


