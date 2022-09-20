import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, Form } from "@remix-run/react";
import { requireUserId, getUserSession, commitSession } from "~/utils/auth.server";
import { getUserLayers } from "~/utils/geo.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const userLayers = getUserLayers(userId);
  return userLayers;
};

export async function action({ request }) {
  const session = await getUserSession(request);  
  const form = await request.formData();  
  const layerId = form.get("layerId");  
  session.set("layerId", layerId);
  return redirect('/map', {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function HomePage() {
  const data = useLoaderData();
  const submit = useSubmit();

  const handleSubmit = (e) => {
    submit({ layerId: e.target.value }, { method: "post" });
  };

  return (
    <Form method="post">
      <ul>
        {data.map((layerId: string, i) => (
          <li key={i}>
            <p>
              <label>
                <input
                  type="text"
                  name="layerId"
                  value={layerId}
                  readOnly
                  onClick={handleSubmit}
                />
              </label>
            </p>
          </li>
        ))}
      </ul>
    </Form>
  );
}
