// 簡單的內存數據層，後續可以替換為資料庫

let posts = [
  {
    id: 1,
    title: '我的第一篇博客',
    content: '這是一個示例博客內容。',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextId = 2;

function listPosts() {
  return posts;
}

function findPostById(id) {
  return posts.find((p) => p.id === id);
}

function createPost({ title, content }) {
  const now = new Date().toISOString();
  const newPost = {
    id: nextId++,
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };
  posts.unshift(newPost);
  return newPost;
}

function updatePost(id, { title, content }) {
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated = {
    ...posts[index],
    title,
    content,
    updatedAt: new Date().toISOString(),
  };

  posts[index] = updated;
  return updated;
}

function deletePost(id) {
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const deleted = posts[index];
  posts.splice(index, 1);
  return deleted;
}

module.exports = {
  listPosts,
  findPostById,
  createPost,
  updatePost,
  deletePost,
};


