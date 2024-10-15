import { PostUpdateFormData } from "@/types/profile/profile";
import apiClient from "../apiClient";

export const checkHasUserLikedThePost = async (postId: string) => {
  const response = await apiClient.get(
    `/user/post/has-user-liked-post/${postId}`
  );
  return response.data;
};

export const likeAndDisLikePost = async (postId: string, status: string) => {
  const response = await apiClient.patch(
    `/user/post/like-or-unlike/${postId}/${status}`
  );
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get(`/user/get-current-user`);
  return response.data;
};

export const deletePost = async (postId: string) => {
  const response = await apiClient.delete(`/user/post/delete-post/${postId}`);
  return response.data;
};

export const getPostData = async (postId: string) => {
  const response = await apiClient.get(`/user/post/get-post-data/${postId}`);
  return response.data;
};

export const editPostApi = async (
  postId: string,
  formData: PostUpdateFormData
) => {
  const response = await apiClient.patch(
    `/user/post/update-post/${postId}`,
    formData
  );
  return response.data;
};
