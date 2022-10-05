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

  const vaccineLayer = await prisma.layer.upsert({
    where: {
      url: "https://field-mapping-layer-bucket.s3.us-west-1.amazonaws.com/cl8p6l7rt00023o0z8h8mevx6.shp",
    },
    update: {},
    create: {
      name: "Vaccine Access Points",
      url: "https://field-mapping-layer-bucket.s3.us-west-1.amazonaws.com/cl8p6l7rt00023o0z8h8mevx6.shp",
      dispatcher: {
        connect: { id: sjs.id },
      },
    },
  });

  const artLayer = await prisma.layer.upsert({
    where: {
      url: "https://field-mapping-layer-bucket.s3.us-west-1.amazonaws.com/cl8nb0wr00001is0zhs333duj.geojson",
    },
    update: {},
    create: {
      name: "Pubic Art Points",
      labelField: "title",
      url: "https://field-mapping-layer-bucket.s3.us-west-1.amazonaws.com/cl8nb0wr00001is0zhs333duj.geojson",
      dispatcher: {
        connect: { id: sjs.id },
      },
    },
  });

  const assnArr = await getAssignments();
  for (const [i, assn] of assnArr.entries()) {
    let data = {
      assignee: { connect: { id: i % 2 == 0 ? sjs.id : bbq.id } },
      ...assn,
    };
    await prisma.assignment.create({ data });
  }

  console.log({ sjs, bbq, vaccineLayer, artLayer });
}

async function getAssignments() {
  const artArr = [...Array(30).keys()].map((i) => ({
    layer: { connect: { id: 2 } },
    recordId: i + 1,
    surveyId: "36dbb092-5ad3-420f-80de-50dfd0015448",
  }));
  const vaccineArr = [...Array(50).keys()].map((i) => ({
    layer: { connect: { id: 5 } },
    recordId: i + 1,
    surveyId: "b2c4c00d-2640-46ae-bd02-58cf2cbe79c1",
  }));
  const assnArr = artArr.concat(vaccineArr);
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
