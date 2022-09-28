import { prisma } from "~/utils/db.server";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { json } from "@remix-run/node";

export const loader = async ({ params }: LoaderArgs) => {
  const taskId = params.taskId;
  const pathname = params["*"];
  const ids = pathname.split("/").map((i) => parseInt(i));
  const assignments = await Promise.all(
    ids.map(async (id) => {
      let assignment = await prisma.assignment.findFirst({
        where: { recordId: id, layer: taskId },
        select: {
          surveyId: true,
          recordId: true,
          assignee: {
            select: {
              email: true,
            },
          },
        },
      });
      return {
        recordId: id,
        surveyId: assignment?.surveyId,
        assignee: assignment?.assignee,
      };
    })
  );
  return assignments;
};

export async function action({ request, params }) {
  const taskId = params.taskId;
  const pathname = params["*"];
  const ids = pathname.split("/").map((i) => parseInt(i));

  const { recordId, assigneeEmail, surveyId, actionId } = Object.fromEntries(
    await request.formData()
  );
  const recId = parseInt(recordId);
  const assignee = await prisma.user.findUnique({
    where: { email: assigneeEmail },
  });

  if (assignee == null) {
    return json(
      { error: `User with that email does not yet exist` },
      { status: 400 }
    );
  }

  switch (actionId) {
    case "create": {
      return await prisma.assignment.create({
        data: {
          layer: taskId,
          recordId: recId,
          surveyId: surveyId,
          assignee: { connect: { id: assignee.id } },
        },
      });
    }
    case "update": {
      let assignment = await prisma.assignment.findFirstOrThrow({
        where: { layer: taskId, recordId: recId },
      });
      return await prisma.assignment.update({
        where: {
          id: assignment.id,
        },
        data: {
          surveyId: surveyId,
          assignee: { connect: { id: assignee.id } },
        },
      });
    }
    case "upsert": {
      const resultArr = [];
      for (const id of ids) {
        let assignment = await prisma.assignment.findFirst({
          where: { layer: taskId, recordId: id },
        });
        const result = await prisma.assignment.upsert({
          where: { id: assignment?.id ? assignment.id : -1 },
          update: {
            surveyId: surveyId,
            assignee: { connect: { id: assignee.id } },
          },
          create: {
            layer: taskId,
            recordId: id,
            surveyId: surveyId,
            assignee: { connect: { id: assignee.id } },
          },
        });
        resultArr.push(result);
      }
      return resultArr;
    }
    default:
      return json({ error: `Invalid Form Data` }, { status: 400 });
  }
}

export default function TaskSidebar() {
  const assignments = useLoaderData();
  
  return (
    <div className="bg-black h-full p-4">
      <ul className="justify-center items-center flex flex-col space-y-2">
        {assignments.length > 1 && (
          <li key={0}>
            <div
              tabIndex={0}
              className="collapse collapse-arrow border w-full border-base-300 bg-blue-200 rounded-box"
            >
              <input type="checkbox" />
              <div className="collapse-title text-black text-xl font-medium">
                Update {assignments.length} records
              </div>
              <div className="collapse-content text-black">
                <form method="post" className="flex flex-col">
                  <h2>Assignee:</h2>
                  <label>
                    <input type="text" name="assigneeEmail" />
                  </label>
                  <h2>Survey ID:</h2>
                  <label>
                    <input type="text" name="surveyId" />
                  </label>
                  <button
                    type="submit"
                    name="actionId"
                    value="upsert"
                    className="rounded-xl mt-2 bg-blue-400 px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-blue-500 hover:-translate-y-1"
                  >
                    Assign
                  </button>
                </form>
              </div>
            </div>
          </li>
        )}
        {assignments.map((assn) => (
          <li key={assn.recordId}>
            <div
              tabIndex={assn.recordId}
              className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
            >
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                Record #{assn.recordId}
              </div>
              <div className="collapse-content">
                <form method="post" className="flex flex-col">
                  <input type="hidden" name="recordId" value={assn.recordId} />
                  <h2>Assignee:</h2>
                  <label>
                    <input
                      type="text"
                      defaultValue={assn.assignee?.email}
                      name="assigneeEmail"
                    />
                  </label>
                  <h2>Survey ID:</h2>
                  <label>
                    <input
                      type="text"
                      defaultValue={assn.surveyId}
                      name="surveyId"
                    />
                  </label>
                  <button
                    type="submit"
                    name="actionId"
                    value={assn.surveyId ? "update" : "create"}
                    className="rounded-xl mt-2 bg-blue-400 px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-blue-500 hover:-translate-y-1"
                  >
                    {assn.surveyId ? "Update" : "Assign"}
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}