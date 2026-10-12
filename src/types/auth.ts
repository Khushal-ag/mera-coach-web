export type CoachLoginInput = {
  userName: string;
  password: string;
};

/** Matches meracoachapi LoginResponseObj (camelCase JSON). */
export type CoachLoginResult = {
  token?: string;
  coachId?: number;
  coachCode?: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  profileUrl?: string;
  countryCd?: string;
  userName?: string;
  userType?: string;
};
