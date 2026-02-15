export type AddonHandoffRequestDto = {
  appKey: string;
  context?: Record<string, unknown>;
};

export type AddonHandoffResponseDto = {
  appKey: string;
  status: 'allowed';
  launchUrl: string;
  integrationMode: string;
  token: string;
  expiresAt: string;
  expiresIn: number;
};
