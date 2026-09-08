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

export type PhoneVerificationPurpose = "Signup" | "Login" | "PasswordReset";

export type RequestPhoneCodeMutation = {
  readonly requestPhoneCode: {
    readonly ok: boolean;
  };
};

export type RequestPhoneCodeVariables = {
  readonly input: {
    readonly phone: string;
    readonly purpose: PhoneVerificationPurpose;
  };
};

export type VerifyPhoneCodeMutation = {
  readonly verifyPhoneCode: {
    readonly existingUser: boolean;
    readonly phoneVerificationToken?: string | null;
    readonly tokenPayload?: {
      readonly accessToken: string;
      readonly refreshToken: string;
    } | null;
  };
};

export type VerifyPhoneCodeVariables = {
  readonly input: {
    readonly phone: string;
    readonly code: string;
  };
};

export type CompletePhoneSignupMutation = {
  readonly completePhoneSignup: {
    readonly accessToken: string;
    readonly refreshToken: string;
  };
};

export type CompletePhoneSignupVariables = {
  readonly input: {
    readonly phoneVerificationToken: string;
    readonly userName: string;
    readonly gender: Gender;
    readonly email: string;
    readonly password: string;
    readonly termsAccepted: boolean;
  };
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

export type CompleteKakaoPhoneSignupMutation = {
  readonly completeKakaoPhoneSignup: {
    readonly accessToken: string;
    readonly refreshToken: string;
  };
};

export type CompleteKakaoPhoneSignupVariables = {
  readonly input: {
    readonly kakaoPhoneVerificationToken: string;
    readonly phoneVerificationToken: string;
    readonly userName: string;
    readonly gender: Gender;
    readonly termsAccepted: boolean;
  };
};

export type AuthActionButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "filled" | "outlined" | "text";
};

export type CodeVerificationFormProps = {
  attachPending: boolean;
  code: string;
  requestPending: boolean;
  resendSeconds: number;
  verifyPending: boolean;
  onChangeCode: (value: string) => void;
  onResend: () => void;
  onSubmit: () => void;
};

export type GenderSelectorProps = {
  onChange: (value: Gender) => void;
  value?: Gender;
};

export type TermsAcceptanceProps = {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
};

export type AuthContinuation = {
  readonly kakaoToken?: string;
  readonly phone?: string;
  readonly signupToken?: string;
};

export type StoredAuthContinuation = AuthContinuation & {
  readonly expiresAt: number;
};
