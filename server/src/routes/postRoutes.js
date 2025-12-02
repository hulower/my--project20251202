const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

router.get('/', postController.listPosts);
router.get('/:id', postController.getPost);
router.post('/', postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

module.exports = router;


