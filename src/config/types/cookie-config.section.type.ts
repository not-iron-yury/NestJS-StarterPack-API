export type CookieSection = {
  refresh: RefreshCookieSection;
};

export type RefreshCookieSection = {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
};
