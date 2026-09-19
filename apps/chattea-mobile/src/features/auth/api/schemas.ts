export type Gender = "male" | "female";

export type User = {
  id: string;
  userName: string;
  gender: Gender;
  intro: string;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
};

export type CompleteKakaoSignupResult = {
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

export type SignupProfileInput = {
  readonly gender: Gender;
  readonly heightCm?: number;
  readonly job?: string;
  readonly mbti?: string;
  readonly termsAccepted: boolean;
  readonly userName: string;
};

export type LoginWithKakaoMutation = {
  readonly loginWithKakao:
    | {
        readonly __typename: "KakaoLoginSuccessPayload";
        readonly requiresPhone: false;
        readonly session: {
          readonly accessToken: string;
          readonly refreshToken: string;
        };
      }
    | {
        readonly __typename: "KakaoRequiresPhonePayload";
        readonly requiresPhone: true;
        readonly kakaoPhoneVerificationToken: string;
        readonly userName: string | null;
      };
};

export type LoginWithKakaoVariables = {
  readonly accessToken: string;
};

export type CompleteKakaoSignupMutation = {
  readonly completeKakaoPhoneSignup: {
    readonly accessToken: string;
    readonly refreshToken: string;
  };
};

export type CompleteKakaoSignupVariables = {
  readonly input: SignupProfileInput & {
    readonly kakaoPhoneVerificationToken: string;
  };
};
