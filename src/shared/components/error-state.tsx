import EmptyState from "./empty-state";

const ErrorState = () => {
  return <EmptyState title="내용을 불러오지 못했어요" body="잠시 후 다시 시도해 주세요." />;
};

export default ErrorState;
