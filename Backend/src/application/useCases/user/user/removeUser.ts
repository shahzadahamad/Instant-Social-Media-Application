import SocketService from "../../../../infrastructure/service/socketService";
import FriendsRepository from "../../../repositories/user/friendsRepository";
import NotificationRepository from "../../../repositories/user/notificationRepository";
import UserMoreDataRepository from "../../../repositories/user/userMoreDataRepository";
import UserRepository from "../../../repositories/user/userRepository";

export default class RemoveUser {
  private userRepository: UserRepository;
  private friendsRepository: FriendsRepository;
  private notificationRepository: NotificationRepository;
  private UserMoreDataRepository: UserMoreDataRepository;

  constructor(userRepository: UserRepository, friendsRepository: FriendsRepository, notificationRepository: NotificationRepository, UserMoreDataRepository: UserMoreDataRepository) {
    this.userRepository = userRepository;
    this.friendsRepository = friendsRepository;
    this.notificationRepository = notificationRepository;
    this.UserMoreDataRepository = UserMoreDataRepository;
  }

  public async execute(currentUserId: string, unfollowUserId: string): Promise<void> {

    const unfollowingUser = await this.userRepository.findById(unfollowUserId);

    if (!unfollowingUser) {
      throw new Error("User not found!");
    };

    await this.notificationRepository.removeAllNotificationOfSingleUser(currentUserId, unfollowingUser._id.toString(), 'follow');

    await this.notificationRepository.removeNotificationOfUserByMessage(unfollowingUser._id.toString(), currentUserId, 'accepted your follow request.');
    await this.notificationRepository.editAllNotificationOfRelationFollow(unfollowingUser._id.toString(), currentUserId, 'follow', 'follow');
    await this.friendsRepository.unFollowUser(unfollowingUser._id.toString(), currentUserId);
    SocketService.getInstance().clearNotification(unfollowingUser._id.toString());
  }
}
