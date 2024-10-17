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

const userRouter = Router();

const getUserDataController = new GetUserDataController();
const editUserDataController = new EditUserDataController();
const createPostGetUserDataController = new CretePostGetUserDataController();
const createPostGetTaggedUserDataController =
  new CreatePostGetTaggedUserDataController();
const getCurrentUserController = new GetCurrentUserController();
const getUserDataByUsernameController = new GetUserDataByUsernameController();
const getUserDataBySearchingUsername =
  new GetUserDataBySearchingUsernameController();

userRouter.get("/get-user-data", authMiddleware, getUserDataController.handle);
userRouter.get(
  "/create-post/get-data",
  authMiddleware,
  createPostGetUserDataController.handle
);
userRouter.get(
  "/get-tagged-user-data",
  authMiddleware,
  createPostGetTaggedUserDataController.handle
);
userRouter.post(
  "/edit-profile",
  authMiddleware,
  upload.single("profilePicture"),
  editUserDataController.handle
);
userRouter.get(
  "/get-current-user",
  authMiddleware,
  getCurrentUserController.handle
);
userRouter.get(
  "/get-user-data-by-username/:username",
  authMiddleware,
  getUserDataByUsernameController.handle
);
userRouter.get(
  "/get-user-data-by-search-username/:search",
  authMiddleware,
  getUserDataBySearchingUsername.handle
);

export default userRouter;
