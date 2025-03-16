import { Request, Response } from "express";
import PostRepository from "../../../../application/repositories/user/postRepository";
import { HttpStatusCode } from "../../../enums/enums";
import { MESSAGES } from "../../../constants/messages";
import FriendsRepository from "../../../../application/repositories/user/friendsRepository";
import UserMoreDataRepository from "../../../../application/repositories/user/userMoreDataRepository";
import LoadingPagePost from "../../../../application/useCases/user/post/loadingPagePost";
import LikeRepository from "../../../../application/repositories/user/likeRepository";

export default class LoadingPagePostController {
  public async handle(req: Request, res: Response): Promise<void> {
    const { page = 0 } = req.query;
    const { userId } = req.user;
    const pageNumber = parseInt(page as string);

    const loadingPagePost = new LoadingPagePost(
      new PostRepository(),
      new FriendsRepository(),
      new UserMoreDataRepository(),
      new LikeRepository(),
    );

    try {
      const postData = await loadingPagePost.execute(userId, pageNumber);
      res.status(HttpStatusCode.OK).json(postData);
    } catch (error) {
      if (error instanceof Error) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ error: error.message });
        return;
      }
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.ERROR.UNKNOWN_ERROR });
    }
  }
}
