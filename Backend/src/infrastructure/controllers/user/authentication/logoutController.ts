import { Request, Response } from "express";

export default class logoutController {
  public async handle(req: Request, res: Response): Promise<Response | void> {
    try {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      });

      return res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ error: "An error occurred during logout" });
    }
  }
}
