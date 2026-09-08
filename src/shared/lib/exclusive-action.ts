export const runExclusiveAction = async (
  guard: { current: boolean },
  action: () => Promise<void>,
) => {
  if (guard.current) return;
  guard.current = true;
  try {
    await action();
  } finally {
    guard.current = false;
  }
};
