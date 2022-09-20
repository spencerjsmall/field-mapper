import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Ch@ng3_me", 10);

  const sjs = await prisma.user.upsert({
    where: { email: "spencer.small@sfgov.org" },
    update: {},
    create: {
      email: "spencer.small@sfgov.org",
      firstName: "Spencer",
      lastName: "Small",
      password: passwordHash,
    },
  });

  const bbq = await prisma.user.upsert({
    where: { email: "brian.quinn@sfgov.org" },
    update: {},
    create: {
      email: "brian.quinn@sfgov.org",
      firstName: "Brian",
      lastName: "Quinn",
      password: passwordHash,
    },
  });

  await Promise.all(
    getAssignments().map((assn, i) => {
      let data = {
        assigneeId: i % 3 == 0 ? sjs.id : i % 3 == 1 ? bbq.id : null,
        ...assn,
      };
      return prisma.assignment.create({ data });
    })
  );

  console.log({ sjs, bbq });
}

function getAssignments() {
  const artArr = [...Array(65).keys()].map((i) => ({
    layer: "PublicArtPoints",
    recordId: i + 1,
    surveyId: "36dbb092-5ad3-420f-80de-50dfd0015448",
  }));
  const vaccArr = [...Array(108).keys()].map((i) => ({
    layer: "VaccineAccessPoints",
    recordId: i + 1,
    surveyId: "b2c4c00d-2640-46ae-bd02-58cf2cbe79c1",
  }));
  const assnArr = artArr.concat(vaccArr);
  return assnArr;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
