import { prisma } from "~/utils/db.server";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { json } from "@remix-run/node";

export const loader = async ({ params }: LoaderArgs) => {
  const pathname = params["*"];
  const ids = pathname.split("/").map((i) => parseInt(i));
  return ids;
};

export async function action({ request, params }) {
  const taskId = parseInt(params.taskId);
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
          layer: { connect: { id: taskId } },
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
          where: { layerId: taskId, recordId: id },
        });
        const result = await prisma.assignment.upsert({
          where: { id: assignment?.id ? assignment.id : -1 },
          update: {
            surveyId: surveyId,
            assignee: { connect: { id: assignee.id } },
          },
          create: {
            layer: { connect: { id: taskId } },
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
  const ids = useLoaderData();
  const assignments = useOutletContext();
  const selected = ids.map((id) => {
    let assn = assignments.find((a) => a.recordId === id);
    if (!assn) {
      return {
        recordId: id,
        surveyId: null,
        assignee: null,
      };
    }
    return assn;
  });

  return (
    <div className="bg-black h-full p-4">
      <ul className="justify-center items-center flex flex-col space-y-2">
        {selected.length > 1 && (
          <li key={0}>
            <div
              tabIndex={0}
              className="collapse collapse-arrow border w-full border-base-300 bg-blue-200 rounded-box"
            >
              <input type="checkbox" />
              <div className="collapse-title text-black text-xl font-medium">
                Update {selected.length} records
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
        {selected.map((obj) => (
          <li key={obj.recordId}>
            <div
              tabIndex={obj.recordId}
              className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
            >
              <input type="checkbox" />
              <div className="collapse-title text-xl font-medium">
                Record #{obj.recordId}
              </div>
              <div className="collapse-content">
                <form method="post" className="flex flex-col">
                  <input type="hidden" name="recordId" value={obj.recordId} />
                  <h2>Assignee:</h2>
                  <label>
                    <input
                      type="text"
                      defaultValue={obj.assignee?.email}
                      name="assigneeEmail"
                    />
                  </label>
                  <h2>Survey ID:</h2>
                  <label>
                    <input
                      type="text"
                      defaultValue={obj.surveyId}
                      name="surveyId"
                    />
                  </label>
                  <button
                    type="submit"
                    name="actionId"
                    value={obj.surveyId ? "update" : "create"}
                    className="rounded-xl mt-2 bg-blue-400 px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-blue-500 hover:-translate-y-1"
                  >
                    {obj.surveyId ? "Update" : "Assign"}
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
