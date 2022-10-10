import bcrypt from "bcryptjs";
import type { RegisterForm } from "./types.server";
import { prisma } from "./db.server";
import { Role } from "@prisma/client";

export const createUser = async (user: RegisterForm) => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      password: passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role == 'ADMIN' ? Role.ADMIN : Role.USER,
    },
  });
  return newUser;
};

export const getUserById = async (userId: number) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
};

export const deleteUser = async (id: number) => {
  await prisma.user.delete({ where: { id } });
};
