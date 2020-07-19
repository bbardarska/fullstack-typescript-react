/**
 * THIS HEADER SHOULD BE KEPT INTACT IN ALL CODE DERIVATIVES AND MODIFICATIONS.
 * 
 * This file provided by IPT is for non-commercial testing and evaluation
 * purposes only. IPT reserves all rights not expressly granted.
 *  
 * The security implementation provided is DEMO only and is NOT intended for production purposes.
 * It is exclusively your responsisbility to seek advice from security professionals 
 * in order to secure the REST API implementation properly.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * IPT BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { History } from 'history';

import { AppThunk } from '../../app/store';
import { Post } from '../../model/post.model';
import PostService from '../../service/post-service';
import { getErrorMessage } from '../../service/service-utils';
import { IdType } from '../../shared/shared-types';

interface PostsState {
  currentPostId: IdType | null;
  posts: Post[];
  loading: boolean;
  error: string | null;
  message: string | null;
}

interface PostsLoaded {
  posts: Post[];
}

const initialState: PostsState = {
  currentPostId: null,
  posts: [],
  loading: false,
  error: null,
  message:null
}

const posts = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    getPostsStart(state) {
      state.loading = true
      state.error = null
    },
    getPostsSuccess(state, action: PayloadAction<PostsLoaded>) {
      const { posts } = action.payload;
      state.posts = posts;
      state.loading = false;
      state.error = null;
    },
    postsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },
    selectPostById(state, action: PayloadAction<IdType>) {
      state.currentPostId = action.payload;
    },
    getPostByIdStart(state, action: PayloadAction<IdType>) {
      state.currentPostId = action.payload;
      state.loading = true;
      state.error = null;
    },
    getPostByIdSuccess(state, action: PayloadAction<Post>) {
      const post = action.payload;
      const index = state.posts.findIndex(p => p._id === post._id);
      if (index < 0) {
        state.posts.push(post)
      } else {
        state.posts[index] = post;
      }
      state.loading = false;
      state.error = null;
    },
    createPostStart(state, action: PayloadAction<Post>) {
      state.currentPostId = action.payload._id;
      state.loading = true;
      state.error = null;
    },
    createPostSuccess(state, action: PayloadAction<Post>) {
      const post = action.payload;
      state.posts.push(post)
      state.loading = false;
      state.error = null;
      state.message = `Post "${action.payload.title}" created successfully.`;
    },
    updatePostStart(state, action: PayloadAction<Post>) {
      state.currentPostId = action.payload._id;
      state.loading = true;
      state.error = null;
    },
    updatePostSuccess(state, action: PayloadAction<Post>) {
      const post = action.payload;
      const index = state.posts.findIndex(p => p._id === post._id);
      if (index < 0) {
        state.posts.push(post)
      } else {
        state.posts[index] = post;
      }
      state.loading = false;
      state.error = null;
      state.message = `Post "${action.payload.title}" updated successfully.`;
    },
    deletePostByIdStart(state, action: PayloadAction<IdType>) {
      state.currentPostId = action.payload;
      state.loading = true;
      state.error = null;
    },
    deletePostByIdSuccess(state, action: PayloadAction<Post>) {
      const post = action.payload;
      const index = state.posts.findIndex(p => p._id === post._id);
      if (index >= 0) {
        state.posts.splice(index, 1);
      }
      state.loading = false;
      state.error = null;
      state.message = `Post "${action.payload.title}" deleted successfully.`;
    },
  }
})

export const {
  getPostsStart,
  getPostsSuccess,
  postsFailure,
  selectPostById,
  getPostByIdStart,
  getPostByIdSuccess,
  createPostStart,
  createPostSuccess,
  updatePostStart,
  updatePostSuccess,
  deletePostByIdStart,
  deletePostByIdSuccess,
} = posts.actions
export default posts.reducer

export const fetchPosts = (): AppThunk => async (dispatch) => {
  try {
    dispatch(getPostsStart())
    const localPosts = localStorage.getItem('posts');
    if (localPosts) {
      console.log(localPosts);
      dispatch(getPostsSuccess({ posts: JSON.parse(localPosts) as Post[] }));
    }
    const posts = await PostService.getAllPosts()
    dispatch(getPostsSuccess({ posts }))
    localStorage.setItem('posts', JSON.stringify(posts));
  } catch (err) {
    dispatch(postsFailure(getErrorMessage(err)))
  }
}

export const fetchPostById = (postId: IdType): AppThunk => async (dispatch) => {
  try {
    dispatch(getPostByIdStart(postId));
    const post = await PostService.getPostById(postId);
    dispatch(getPostByIdSuccess(post));
  } catch (err) {
    dispatch(postsFailure(getErrorMessage(err)))
  }
}

export const createPost = (
  post: Post, 
  history: History<History.PoorMansUnknown>, 
  // setSubmitting: (isSubmitting: boolean) => void
  ): AppThunk => async (dispatch, getState) => {
  try {
    dispatch(createPostStart(post));
    const authToken = getState().auth.token;
    const created = await PostService.createNewPost(post, authToken);
    dispatch(createPostSuccess(created));
    history.push('/posts');
  } catch (err) {
    dispatch(postsFailure(getErrorMessage(err)))
  } 
  // finally {
  //   setSubmitting(false);
  // }
}

export const updatePost = (
  post: Post, 
  history: History<History.PoorMansUnknown>, 
  // setSubmitting: (isSubmitting: boolean) => void
  ): AppThunk => async (dispatch) => {
  try {
    dispatch(updatePostStart(post));
    const created = await PostService.updatePost(post);
    dispatch(updatePostSuccess(created));
    history.push('/posts');
  } catch (err) {
    dispatch(postsFailure(getErrorMessage(err)))
  } 
  // finally {
  //   setSubmitting(false);
  // }
}

export const deletePost = (postId: IdType): AppThunk => async (dispatch) => {
  try {
    dispatch(deletePostByIdStart(postId));
    const deleted = await PostService.deletePost(postId);
    dispatch(deletePostByIdSuccess(deleted));
  } catch (err) {
    dispatch(postsFailure(getErrorMessage(err)))
  }
}
