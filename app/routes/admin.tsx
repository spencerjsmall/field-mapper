import {
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { IoIosMenu } from "react-icons/io";
import { requireUserSession } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await requireUserSession(request); //requireAdminSession
  const userId = session.get("userId");
  return { userId };
};

export default function AdminLayout() {
  const { userId } = useLoaderData();

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex flex-row basis-1/12 bg-blue items-center sticky top-0 z-50 justify-between bg-black text-white text-2xl py-4 px-6">
        <IoIosMenu />

        <span className="uppercase text-xl pl-10">admin</span>

        <div className="btn btn-sm btn-ghost">
          <form action="/logout" method="post">
            <button type="submit">Sign Out</button>
          </form>
        </div>
      </div>

      <div className="w-full max-h-full basis-11/12 z-0">
        <Outlet context={userId} />
      </div>
    </div>
  );
}
