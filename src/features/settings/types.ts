export type LogoutCardProps = { logoutPending: boolean; logOut: () => Promise<void> };

export type AccountDeletionCardProps = {
  state: { loading: boolean };
  logoutPending: boolean;
  deleteAccount: () => void;
};
