export type EmeterWeeklyPointDto = {
  date: string;
  energyKWh: number;
  powerAvgW: number;
};

export type EmeterWeeklyResponseDto = {
  meterId: string;
  from: string;
  to: string;
  points: EmeterWeeklyPointDto[];
};
