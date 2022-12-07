export type RegisterForm = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
};

export type UpdateForm = {
  id: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
};

export type AdminRegisterForm = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  adminId: number;
};

export type LoginForm = {
  email: string;
  password: string;
};
