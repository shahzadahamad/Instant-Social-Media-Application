import { IOtp } from "../../../infrastructure/database/models/otpVerificationModel";
import { EmailOptions } from "../../interface/emailInterface";
import { sendEmail } from "../../providers/nodeMailer";
import { GenerateOTP } from "../../providers/otpGenerate";
import PasswordHasher from "../../providers/passwordHasher";
import OtpRepository from "../../repositories/otpRepository";
import UserRepository from "../../repositories/userRepository";

export default class OtpSend {
  private otpRepository: OtpRepository;
  private userRepository: UserRepository;
  private passwordHasher: PasswordHasher;
  private generateOTP: GenerateOTP;

  constructor(
    otpRepository: OtpRepository,
    userRepository: UserRepository,
    passwordHasher: PasswordHasher,
    generateOTP: GenerateOTP
  ) {
    this.otpRepository = otpRepository;
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.generateOTP = generateOTP;
  }

  public async execute(
    email: string,
    fullname: string,
    username: string
  ): Promise<IOtp> {
    const otp = await this.generateOTP.generate();

    const hashedOtp = await this.passwordHasher.hash(otp);

    const emailOptions: EmailOptions = {
      to: email,
      otp: otp,
      fullname: fullname,
    };

    const isEmailExist = await this.userRepository.findByEmail(email);
    const isUsernameExist = await this.userRepository.findByUsername(username);

    if (isEmailExist) {
      throw new Error("User already exists");
    }

    if (isUsernameExist) {
      throw new Error("Username already exists");
    }

    const newOtp = await this.otpRepository.createOtp(hashedOtp);
    await sendEmail(emailOptions);

    return newOtp;
  }
}
