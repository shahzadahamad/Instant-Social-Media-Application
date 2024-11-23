import { Request, Response } from "express";
import PostRepository from "../../../../application/repositories/user/postRepository";
import GetPostCount from "../../../../application/useCases/user/post/getPostCount";
import { HttpStatusCode } from "../../../enums/enums";
import { MESSAGES } from "../../../constants/messages";

export default class GetPostCountController {
  public async handle(req: Request, res: Response): Promise<void> {
    const { userId } = req.user;
    const getPostCount = new GetPostCount(new PostRepository());
    try {
      const data = await getPostCount.execute(userId);
      res.status(HttpStatusCode.OK).json(data);
    } catch (error) {
      if (error instanceof Error) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ error: error.message });
        return;
      }
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.ERROR.UNKNOWN_ERROR });
    }
  }
}
