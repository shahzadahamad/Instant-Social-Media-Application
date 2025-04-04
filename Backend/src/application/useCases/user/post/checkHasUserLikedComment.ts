import LikeRepository from "../../../repositories/user/likeRepository";
import PostRepository from "../../../repositories/user/postRepository";

export default class CheckHasUserLikedComment {
  private postRepository: PostRepository;
  private likeRepository: LikeRepository;

  constructor(postRepository: PostRepository, likeRepository: LikeRepository) {
    this.postRepository = postRepository;
    this.likeRepository = likeRepository;
  }

  public async execute(
    postId: string,
    userId: string,
    commentIds: string[]
  ): Promise<{ [key: string]: { liked: boolean; count: number } }> {
    const post = await this.postRepository.findPostById(postId);

    if (!post) {
      throw new Error("Post not found!");
    }

    const checking = await this.likeRepository.hasUserLikedComment(
      postId,
      userId,
      commentIds
    );
    return checking;
  }
}
