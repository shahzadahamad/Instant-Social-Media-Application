import { Request, Response } from "express";
import PostRepository from "../../../../application/repositories/user/postRepository";
import UserRepository from "../../../../application/repositories/user/userRepository";
import CommentRepository from "../../../../application/repositories/user/commentRepository";
import ReplyComment from "../../../../application/useCases/user/post/replyComment";
import { MESSAGES } from "../../../constants/messages";
import { HttpStatusCode } from "../../../enums/enums";

export default class ReplyCommentController {
  public async handle(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;
    const { userId } = req.user;
    const { comment } = req.body;

    const replyComment = new ReplyComment(
      new PostRepository(),
      new UserRepository(),
      new CommentRepository()
    );

    try {
      const data = await replyComment.execute(
        postId,
        userId,
        commentId,
        comment
      );
      res.status(HttpStatusCode.OK).json({ data: data });
    } catch (error) {
      if (error instanceof Error) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ error: error.message });
        return;
      }
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.ERROR.UNKNOWN_ERROR });
    }
  }
}
