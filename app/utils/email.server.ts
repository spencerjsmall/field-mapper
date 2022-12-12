import { SMTPClient } from "emailjs";
import { User } from "@prisma/client";
import { prisma } from "./db.server";

export const emailClient = new SMTPClient({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  host: process.env.SMTP_HOST,
  ssl: process.env.SMTP_REQUIRES_SSL == "true",
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
});

export const emailPasswordReset = (user: User, password) => {
  emailClient.send(
    {
      text: `Your temporary password is: ${password}`,
      from: "Field Mapper <sfgis.fieldmapper@gmail.com>",
      to: `${user.firstName} ${user.lastName} <${user.email}>`,
      subject: "Reset Password",
    },
    (err, message) => {
      console.log(err || message);
    }
  );
};

export const emailNewAssignment = (assn) => {
  emailClient.send(
    {
      text: `You've been assigned ${
        assn.feature.label ? assn.feature.label : "a feature"
      } to visit.`,
      from: "Field Mapper <sfgis.fieldmapper@gmail.com>",
      to: `${assn.assignee.user.firstName} ${assn.assignee.user.lastName} <${assn.assignee.user.email}>`,
      subject: "New Assignment",
    },
    (err, message) => {
      console.log(err || message);
    }
  );
};

export const emailCompleteAssignment = async (assn) => {  
  const adminUsers = await Promise.all(
    assn.feature.layer.admins.map(
      async (a) =>
        await prisma.admin.findUniqueOrThrow({
          where: { id: a.id },
          include: { user: true },
        })
    )
  );  
  const adminAddresses = adminUsers
    .map((a) => `${a.user.firstName} ${a.user.lastName} <${a.user.email}>`)
    .join(", ");  
  emailClient.send(
    {
      text: `An assignment has been completed by ${assn.assignee.user.firstName} ${assn.assignee.user.lastName}.`,
      from: "Field Mapper <sfgis.fieldmapper@gmail.com>",
      to: `${adminAddresses}, ${assn.assignee.user.firstName} ${assn.assignee.user.lastName} <${assn.assignee.user.email}>`,
      subject: "Assignment Completed",
    },
    (err, message) => {
      console.log(err || message);
    }
  );
};
