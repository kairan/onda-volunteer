export const CLOCK = Symbol('CLOCK');

export type Clock = {
  now(): Date;
};

export const systemClock: Clock = {
  now: () => new Date(),
};
