import { useMutation } from "@tanstack/react-query";

import {
  attachPhoneToMe,
  completeKakaoPhoneSignup,
  completePhoneSignup,
  loginWithKakao,
  requestPhoneCode,
  verifyPhoneCode,
} from "./api";
import { Gender } from "./types";

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
      gender,
      email,
      password,
    }: {
      signupToken: string;
      userName: string;
      gender: Gender;
      email: string;
      password: string;
    }) => completePhoneSignup(signupToken, userName, gender, email, password),
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
      gender,
    }: {
      kakaoPhoneVerificationToken: string;
      signupToken: string;
      userName: string;
      gender: Gender;
    }) => completeKakaoPhoneSignup(kakaoPhoneVerificationToken, signupToken, userName, gender),
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
