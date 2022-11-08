import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { prisma } from "~/utils/db.server";

export async function action({ request, params }) {
  const assnId = parseInt(params.assignmentId);
  const layerId = parseInt(params.layerId);
  const { note } = Object.fromEntries(await request.formData());
  await prisma.assignment.update({
    where: {
      id: assnId,
    },
    data: {
      notes: String(note),
    },
  });
  return redirect(`/layers/${layerId}`);
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const assnId = parseInt(params.assignmentId);
  const assn = await prisma.assignment.findUniqueOrThrow({
    where: { id: assnId },
    include: { feature: true },
  });
  return assn;
};

export default function AssignmentNotes() {
  const assn = useLoaderData();
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote(assn.notes);
  }, [assn]);

  return (
    <form
      method="POST"
      className="h-full w-full flex flex-col items-center p-6"
    >
      <textarea
        name="note"
        className="textarea text-xl w-full grow textarea-bordered"
        placeholder="Add a note..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      >
        {note}
      </textarea>
      <button type="submit" className="btn mt-4 w-full">
        {assn.notes ? "Update Note" : "Create Note"}
      </button>
    </form>
  );
}
