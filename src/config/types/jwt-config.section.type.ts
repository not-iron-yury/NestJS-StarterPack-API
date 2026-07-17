export type JwtSection = {
  readonly access: JwtTokenSection;
  readonly refresh: JwtTokenSection;
};

export type JwtTokenSection = {
  readonly secret: string;
  readonly expiresIn: number;
};
