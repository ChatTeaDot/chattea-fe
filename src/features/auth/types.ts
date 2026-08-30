export type Session = {
  accessToken: string;
  refreshToken: string;
};

export type Gender = "male" | "female";

export type User = {
  id: string;
  userName: string;
  gender: Gender;
  intro: string;
};

export type VerifyPhoneResult =
  | { status: "LOGIN"; session: Session }
  | { status: "SIGNUP_REQUIRED"; signupToken: string };

export type CompletePhoneSignupResult = {
  session: Session;
};

export type KakaoLoginResult =
  | {
      __typename: "KakaoLoginSuccessPayload";
      requiresPhone: false;
      session: Session;
    }
  | {
      __typename: "KakaoRequiresPhonePayload";
      requiresPhone: true;
      kakaoPhoneVerificationToken: string;
      userName: string | null;
    };
