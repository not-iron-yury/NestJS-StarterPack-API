export type CreateRefreshTokenRepositoryInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};
