export type SecuritySection = {
  readonly login: LoginProtectionSection;
  readonly throttle: ThrottleSection;
  readonly emailVerification: TokenLifetimeSection;
  readonly passwordReset: TokenLifetimeSection;
};

export type LoginProtectionSection = {
  readonly maxAttempts: number;
  readonly attemptWindow: number;
  readonly lockTime: number;
};

export type ThrottleSection = {
  readonly limit: number;
  readonly ttl: number;
};

export type TokenLifetimeSection = {
  readonly ttl: number;
};
