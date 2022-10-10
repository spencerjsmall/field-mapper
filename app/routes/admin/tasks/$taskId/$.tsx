import { prisma } from "~/utils/db.server";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { json } from "@remix-run/node";

export const loader = async ({ params }: LoaderArgs) => {
  const pathname = params["*"];
  const taskId = params.taskId;
  const layer = await prisma.layer.findUnique({ where: { name: taskId } });

  const ids = pathname.split("/").map((i) => parseInt(i));
  return { ids, layer };
};

export async function action({ request, params }) {
  const taskId = params.taskId;
  const layer = await prisma.layer.findUniqueOrThrow({
    where: { name: taskId },
  });
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
          layer: { connect: { id: layer.id } },
          recordId: recId,
          surveyId: surveyId,
          assignee: { connect: { id: assignee.id } },
        },
      });
    }
    case "update": {
      let assignment = await prisma.assignment.findFirstOrThrow({
        where: { layerId: layer.id, recordId: recId },
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
          where: { layerId: layer.id, recordId: id },
        });
        const result = await prisma.assignment.upsert({
          where: { id: assignment?.id ? assignment.id : -1 },
          update: {
            surveyId: surveyId,
            assignee: { connect: { id: assignee.id } },
          },
          create: {
            layer: { connect: { id: layer.id } },
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
  const { ids, layer } = useLoaderData();
  const { assignments, points } = useOutletContext();
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
    <div className="h-full p-4">
      {selected && selected.length > 0 ? (
        <ul className="justify-center items-center w-full flex flex-col space-y-2">
          {selected.length > 1 && (
            <li key={0} className="w-full">
              <div
                tabIndex={0}
                className="collapse collapse-arrow w-full border w-full border-base-300 bg-white rounded-box"
              >
                <input type="checkbox" />
                <div className="collapse-title text-center font-mono text-black text-xl font-medium">
                  Update {selected.length} records
                </div>
                <div className="collapse-content text-black w-full">
                  <form method="post" className="flex flex-col items-center">
                    <h3>Assignee:</h3>
                    <label>
                      <input
                        className="bg-black text-white"
                        type="text"
                        name="assigneeEmail"
                      />
                    </label>
                    <h3>Survey ID:</h3>
                    <label>
                      <input
                        className="bg-black text-white"
                        type="text"
                        name="surveyId"
                      />
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
            <li key={obj.recordId} className="w-full">
              <div
                tabIndex={obj.recordId}
                className="collapse collapse-arrow border border-base-300 bg-black rounded-box w-full"
              >
                <input type="checkbox" />
                <div className="collapse-title font-mono text-center text-xl text-white font-medium w-full">
                  {layer.labelField
                    ? `${
                        points.features[obj.recordId].properties[
                          layer.labelField
                        ]
                      }`
                    : `Record #${obj.recordId}`}
                </div>
                <div className="collapse-content w-full">
                  <form
                    method="post"
                    className="flex flex-col w-full items-center"
                  >
                    <input type="hidden" name="recordId" value={obj.recordId} />
                    <h3>Assignee:</h3>
                    <label>
                      <input
                        type="text"
                        defaultValue={obj.assignee?.email}
                        name="assigneeEmail"
                      />
                    </label>
                    <h3>Survey ID:</h3>
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
                      className="rounded-xl mt-6 bg-blue-400 px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-blue-500 hover:-translate-y-1"
                    >
                      {obj.surveyId ? "Update" : "Assign"}
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col w-full">
          <h2 className="text-white text-2xl">No selected records</h2>
        </div>
      )}
    </div>
  );
}
