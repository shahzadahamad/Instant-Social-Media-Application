import { Router } from "express";
import GetUserDataController from "../../../infrastructure/controllers/user/user/getUserDataController";
import EditUserDataController from "../../../infrastructure/controllers/user/user/editUserDataController";
import { upload } from "../../../infrastructure/configs/multer";
import authMiddleware from "../../../infrastructure/middlewares/authMiddleware";
import CretePostGetUserDataController from "../../../infrastructure/controllers/user/user/cretePostGetUserDataController";
import CreatePostGetTaggedUserDataController from "../../../infrastructure/controllers/user/user/createPostGetTaggedUserDataController";
import GetCurrentUserController from "../../../infrastructure/controllers/user/user/getCurrentUserController";
import GetUserDataByUsernameController from "../../../infrastructure/controllers/user/user/getUserDataByUsernameController";
import GetUserDataBySearchingUsernameController from "../../../infrastructure/controllers/user/user/getUserDataBySearchingUsernameController";
import CheckUserByUsernameController from "../../../infrastructure/controllers/user/user/checkUserByUsernameController";
import FollowUserController from "../../../infrastructure/controllers/user/user/followUserController";
import GetUnreadNotificationCountController from "../../../infrastructure/controllers/user/user/getUnreadNotificationCountController";
import GetFollowDetialsController from "../../../infrastructure/controllers/user/user/getFollowDetialsController";
import GetNotificationDataController from "../../../infrastructure/controllers/user/user/getNotificationDataController";

const userRouter = Router();

const getUserDataController = new GetUserDataController();
const editUserDataController = new EditUserDataController();
const createPostGetUserDataController = new CretePostGetUserDataController();
const createPostGetTaggedUserDataController = new CreatePostGetTaggedUserDataController();
const getCurrentUserController = new GetCurrentUserController();
const getUserDataByUsernameController = new GetUserDataByUsernameController();
const getUserDataBySearchingUsername = new GetUserDataBySearchingUsernameController();
const checkUserByUsernameController = new CheckUserByUsernameController();
const followUserController = new FollowUserController();
const getUnreadNotificationCountController = new GetUnreadNotificationCountController();
const getFollowDetialsController = new GetFollowDetialsController();
const getNotificationDataController = new GetNotificationDataController();

userRouter.get("/get-user-data", authMiddleware, getUserDataController.handle);
userRouter.get("/create-post/get-data", authMiddleware, createPostGetUserDataController.handle);
userRouter.get("/get-tagged-user-data", authMiddleware, createPostGetTaggedUserDataController.handle);
userRouter.post("/edit-profile", authMiddleware, upload.single("profilePicture"), editUserDataController.handle);
userRouter.get("/get-current-user", authMiddleware, getCurrentUserController.handle);
userRouter.get("/get-user-data-by-username/:username", authMiddleware, getUserDataByUsernameController.handle);
userRouter.get("/get-user-data-by-search-username/:search", authMiddleware, getUserDataBySearchingUsername.handle);
userRouter.get("/check-user/:username", authMiddleware, checkUserByUsernameController.handle);
userRouter.post('/follow/:username', authMiddleware, followUserController.handle);
userRouter.get('/notification-count', authMiddleware, getUnreadNotificationCountController.handle);
userRouter.get('/follow-detials/:username', authMiddleware, getFollowDetialsController.handle);
userRouter.get('/notification', authMiddleware, getNotificationDataController.handle);

export default userRouter;
