const postStore = require('../models/postStore');

function getAllPosts() {
  return postStore.listPosts();
}

function getPostById(id) {
  return postStore.findPostById(id);
}

function createPost(payload) {
  const { title, content } = payload;
  if (!title || !content) {
    const error = new Error('Title and content are required');
    error.statusCode = 400;
    throw error;
  }
  return postStore.createPost({ title, content });
}

function updatePost(id, payload) {
  const { title, content } = payload;
  if (!title || !content) {
    const error = new Error('Title and content are required');
    error.statusCode = 400;
    throw error;
  }
  const updated = postStore.updatePost(id, { title, content });
  if (!updated) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }
  return updated;
}

function removePost(id) {
  const deleted = postStore.deletePost(id);
  if (!deleted) {
    const error = new Error('Post not found');
    error.statusCode = 404;
    throw error;
  }
  return deleted;
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  removePost,
};


