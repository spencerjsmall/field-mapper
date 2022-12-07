import bcrypt from "bcryptjs";
import type {
  AdminRegisterForm,
  RegisterForm,
  UpdateForm,
} from "./types.server";
import { prisma } from "./db.server";

export const createUser = async (user: RegisterForm) => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      password: passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: {
        create: user.role == "ADMIN" ? {} : undefined,
      },
      surveyor: {
        create: user.role == "SURVEYOR" ? {} : undefined,
      },
    },
    include: { admin: true },
  });
  return newUser;
};

export const updateUser = async (user: UpdateForm) => {
  const passwordHash =
    user.password == undefined || user.password == ""
      ? undefined
      : await bcrypt.hash(user.password, 10);
  const updatedUser = await prisma.user.update({
    where: { id: parseInt(user.id) },
    data: {
      email: user.email,
      password: passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
  return updatedUser;
};

export const createSurveyor = async (user: AdminRegisterForm) => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      password: passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      surveyor: {
        create: { admins: { connect: { id: user.adminId } } },
      },
    },
  });
  return newUser;
};

export const deleteUser = async (id: number) => {
  await prisma.user.delete({ where: { id } });
};

export const getUserAdmin = async (id: number) => {
  return await prisma.admin.findUniqueOrThrow({
    where: { id: id },
    include: { user: true },
  });
};

export const getUserSurveys = async (id: number) => {
  return await prisma.survey.findMany({
    where: {
      admins: {
        some: {
          id: id,
        },
      },
    },
    include: {
      layers: true,
      admins: {
        include: {
          user: true,
        },
      },
      assignments: true,
      _count: {
        select: {
          assignments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getUserSurveyors = async (id: number) => {
  return await prisma.surveyor.findMany({
    where: {
      admins: {
        some: {
          id: id,
        },
      },
    },
    include: {
      user: true,
      admins: {
        include: {
          user: true,
        },
      },
      assignments: true,
    },
    orderBy: {
      user: { createdAt: "desc" },
    },
  });
};

//FOR LAYERS
export const getUserLayers = async (id: number) => {
  return await prisma.layer.findMany({
    where: {
      admins: {
        some: {
          id: id,
        },
      },
    },
    include: {
      admins: {
        include: {
          user: true,
        },
      },
      defaultSurvey: true,
      features: {
        include: {
          assignment: true,
        },
      },
      _count: {
        select: { features: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getSurveyorLayers = async (id: number) => {
  return await prisma.layer.findMany({
    where: {
      features: {
        some: {
          assignment: {
            is: {
              assigneeId: id,
            },
          },
        },
      },
    },
    include: {
      _count: {
        select: {
          features: {
            where: {
              AND: [
                {
                  assignment: {
                    assigneeId: id,
                  },
                },
                {
                  assignment: {
                    completed: false,
                  },
                },
              ],
            },
          },
        },
      },
    },
  });
};
