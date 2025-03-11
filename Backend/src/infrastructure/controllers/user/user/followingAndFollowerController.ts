import { Request, Response } from "express";
import FriendsRepository from "../../../../application/repositories/user/friendsRepository";
import { HttpStatusCode } from "../../../enums/enums";
import { MESSAGES } from "../../../constants/messages";
import FollowingAndFollower from "../../../../application/useCases/user/user/followingAndFollower";

export default class FollowingAndFollowerController {
  public async handle(req: Request, res: Response): Promise<void> {
    const { userId } = req.user;

    const followingAndFollower = new FollowingAndFollower(new FriendsRepository());

    try {
      const friendData = await followingAndFollower.execute(userId);

      res.status(HttpStatusCode.OK).json(friendData);
    } catch (error) {
      if (error instanceof Error) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ error: error.message });
        return;
      }
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ error: MESSAGES.ERROR.UNKNOWN_ERROR });
    }
  }
}
