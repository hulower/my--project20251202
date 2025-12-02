import { get, post, put, del } from './httpClient';

export function fetchPosts() {
  return get('/api/posts');
}

export function fetchPostById(id) {
  return get(`/api/posts/${id}`);
}

export function createPost(payload) {
  return post('/api/posts', payload);
}

export function updatePost(id, payload) {
  return put(`/api/posts/${id}`, payload);
}

export function deletePost(id) {
  return del(`/api/posts/${id}`);
}


