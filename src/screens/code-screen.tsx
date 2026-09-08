import { Redirect } from "expo-router";

import { CodeVerificationForm, usePhoneVerification } from "@/features/auth";
import { ContentState, Screen } from "@/shared/components";

const CodeScreen = () => {
  const { continuation, phone, code, setCode, resend, submit, requestCode, resendSeconds, verify } =
    usePhoneVerification();
  if (continuation === undefined) {
    return (
      <Screen includeTopInset={false}>
        <ContentState kind="loading" title="인증 정보를 확인하고 있어요" />
      </Screen>
    );
  }

  if (!phone) {
    return <Redirect href="/phone" />;
  }

  return (
    <Screen avoidKeyboard includeTopInset={false}>
      <CodeVerificationForm
        attachPending={false}
        code={code}
        onChangeCode={setCode}
        onResend={resend}
        onSubmit={submit}
        requestPending={requestCode.isPending}
        resendSeconds={resendSeconds}
        verifyPending={verify.isPending}
      />
    </Screen>
  );
};

export default CodeScreen;
