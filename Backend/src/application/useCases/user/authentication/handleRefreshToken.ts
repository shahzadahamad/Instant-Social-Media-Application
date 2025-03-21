import TokenManager from "../../../providers/tokenManager";
import UserRepository from "../../../repositories/user/userRepository";

export default class HandleRefreshToken {
  private userRepository: UserRepository;
  private tokenManager: TokenManager;

  constructor(userRepository: UserRepository, tokenManager: TokenManager) {
    this.userRepository = userRepository;
    this.tokenManager = tokenManager;
  }
  public async execute(
    refreshToken: string
  ): Promise<{ token?: string; clearCookie?: boolean }> {
    if (!refreshToken) {
      throw new Error("No refresh token");
    }


    try {
      const decoded = (await this.tokenManager.verifyRefreshToken(
        refreshToken
      )) as { userId: string };
      const user = await this.userRepository.findById(decoded.userId);

      if (!user) {
        throw new Error("user not found");
      }

      const newAccessToken = await this.tokenManager.generateAccessToken({
        userId: user._id,
        role: "user",
      });

      return { token: newAccessToken };
    } catch (error) {
      return { clearCookie: true };
    }
  }
}
