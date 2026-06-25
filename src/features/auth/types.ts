export type Session = {
  token: string;
  userId: string;
};

export type User = {
  id: string;
  nickname: string;
  intro: string;
};

export type VerifyPhoneResult =
  | { status: "LOGIN"; session: Session; user: User }
  | { status: "SIGNUP_REQUIRED"; signupToken: string };

export type CompletePhoneSignupResult = {
  session: Session;
  user: User;
};

export type KakaoLoginResult =
  | {
      __typename: "KakaoLoginSuccessPayload";
      requiresPhone: false;
      session: Session;
      user: User;
    }
  | {
      __typename: "KakaoRequiresPhonePayload";
      requiresPhone: true;
      kakaoToken: string;
      nickname: string | null;
    };
