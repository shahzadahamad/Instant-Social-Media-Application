import { Link } from "react-router-dom";
import { ImageProps } from "../../types/authentication/authenticationTypes";
import formImage from '/form-image.png';

const Image = ({
  accountMessage,
  loginText,
  forgetPass,
  message,
}: ImageProps) => {
  return (
    <div className="bg-black w-1/2 h-[100vh] hidden md:flex flex-col justify-center items-center">
      <img
        src={formImage}
        className="w-3/5 md:w-3/4 lg:w-3/5 h-auto"
        alt=""
      />
      {message ? (
        <div className="text-center">
          <p className="text-white text-lg hover:cursor-pointer">
            {accountMessage}&nbsp;
            <Link to={forgetPass ? "/sign-up" : "/sign-in"}>
              <span className="text-[#52C2FB] hover:underline">{loginText}</span>
            </Link>
          </p>
          {forgetPass ? (
            <Link to={'/forgot-password'}>
              <p className="text-[#0070B8] hover:underline text-base">
                Forgotten your password?
              </p>
            </Link>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Image;
