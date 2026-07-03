import { useMutation } from "@tanstack/react-query";

import {
  attachPhoneToMe,
  completeKakaoPhoneSignup,
  completePhoneSignup,
  loginWithKakao,
  requestPhoneCode,
  verifyPhoneCode,
} from "./api";

export const useRequestPhoneCode = () => {
  return useMutation({ mutationFn: requestPhoneCode });
};

export const useVerifyPhoneCode = () => {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) => verifyPhoneCode(phone, code),
  });
};

export const useCompletePhoneSignup = () => {
  return useMutation({
    mutationFn: ({
      signupToken,
      userName,
      email,
      password,
      intro,
    }: {
      signupToken: string;
      userName: string;
      email: string;
      password: string;
      intro?: string;
    }) => completePhoneSignup(signupToken, userName, email, password),
  });
};

export const useLoginWithKakao = () => {
  return useMutation({ mutationFn: loginWithKakao });
};

export const useCompleteKakaoPhoneSignup = () => {
  return useMutation({
    mutationFn: ({
      kakaoPhoneVerificationToken,
      signupToken,
      userName,
    }: {
      kakaoPhoneVerificationToken: string;
      signupToken: string;
      userName: string;
      intro?: string;
    }) => completeKakaoPhoneSignup(kakaoPhoneVerificationToken, signupToken, userName),
  });
};

export const useAttachPhoneToMe = () => {
  return useMutation({
    mutationFn: ({
      kakaoToken,
      phone,
      code,
    }: {
      kakaoToken: string;
      phone: string;
      code: string;
    }) => attachPhoneToMe(kakaoToken, phone, code),
  });
};
