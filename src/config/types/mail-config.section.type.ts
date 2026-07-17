export type MailSection = {
  readonly from: MailFromSection;
};

export type MailFromSection = {
  readonly address: string;
  readonly name: string;
};
