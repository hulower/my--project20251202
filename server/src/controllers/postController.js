const postService = require('../services/postService');

async function listPosts(req, res, next) {
  try {
    console.log('Received request: GET /api/posts');
    const posts = await postService.getAllPosts();
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

async function getPost(req, res, next) {
  try {
    const id = Number(req.params.id);
    console.log('Received request: GET /api/posts/:id', id);
    const post = await postService.getPostById(id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
}

async function createPost(req, res, next) {
  try {
    console.log('Received request: POST /api/posts', req.body);
    const created = await postService.createPost(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function updatePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    console.log('Received request: PUT /api/posts/:id', id, req.body);
    const updated = await postService.updatePost(id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const id = Number(req.params.id);
    console.log('Received request: DELETE /api/posts/:id', id);
    const deleted = await postService.removePost(id);
    res.json(deleted);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};


