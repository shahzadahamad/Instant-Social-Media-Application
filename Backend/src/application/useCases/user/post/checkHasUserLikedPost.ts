import LikeRepository from "../../../repositories/user/likeRepository";
import PostRepository from "../../../repositories/user/postRepository";

export default class CheckHasUserLikedPost {
  private postRepository: PostRepository;
  private likeRepository: LikeRepository;

  constructor(postRepository: PostRepository, likeRepository: LikeRepository) {
    this.postRepository = postRepository;
    this.likeRepository = likeRepository;
  }

  public async execute(postId: string, userId: string): Promise<boolean> {
    const post = await this.postRepository.findPostById(postId);

    if (!post) {
      throw new Error("Post not found!");
    }

    const checking = await this.likeRepository.hasUserLikedPost(postId, userId);
    return checking;
  }
}
