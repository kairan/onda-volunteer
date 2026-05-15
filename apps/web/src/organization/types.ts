export type Campus = {
  id: string;
  name: string;
  timezone: string;
};

export type Church = {
  id: string;
  name: string;
  defaultTimezone: string;
  campuses: Campus[];
};
