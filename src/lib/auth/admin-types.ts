/** Platform admin session (separate storage from coach practice). */
export type AdminSession = {
  token: string;
  fullName: string;
  email: string;
  role: "ADMIN";
};
