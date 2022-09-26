import { prisma } from "~/utils/db.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderArgs) => {
  const taskId = params.taskId;
  const pathname = params["*"];
  const ids = pathname.split("/").map((i) => parseInt(i));
  const assignments = await Promise.all(
    ids.map(async (id) => {
      let assignment = await prisma.assignment.findFirst({
        where: { recordId: id, layer: taskId },
      });
      return {
        recordId: id,
        surveyId: assignment?.surveyId,
        assignee: assignment?.assigneeId
          ? await prisma.user.findUnique({
              where: { id: assignment?.assigneeId },
            })
          : undefined,
      };
    })
  );  
  return assignments;
};

export async function action({ request }) {  
  let { recordId, assigneeEmail, surveyId, actionId } = Object.fromEntries(
    await request.formData()
  );
  console.log("recordId", recordId);
  console.log("email", assigneeEmail);
  console.log("surveyId", surveyId);
  console.log("actionId", actionId);
  if (typeof assigneeEmail !== "string" || typeof surveyId !== "string") {
    return { formError: `Form not submitted correctly.` };
  }
  return null
};

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
                <form method="post">                  
                  <p>Assignee:</p>
                  <label>
                    <input type="text" name="assigneeEmail" />
                  </label>
                  <p>Survey ID:</p>
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
                <form method="post">
                  <input type="hidden" name="recordId" value={assn.recordId} />
                  <p>Assignee:</p>
                  <label>
                    <input
                      type="text"
                      defaultValue={assn.assignee?.email}
                      name="assigneeEmail"
                    />
                  </label>
                  <p>Survey ID:</p>
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
