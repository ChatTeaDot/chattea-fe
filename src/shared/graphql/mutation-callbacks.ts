export type MutationCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
};

export const settleMutation = async <T>(
  operation: Promise<T>,
  callbacks?: MutationCallbacks<T>,
) => {
  try {
    const data = await operation;
    callbacks?.onSuccess?.(data);
  } catch (error) {
    callbacks?.onError?.(error);
  }
};
