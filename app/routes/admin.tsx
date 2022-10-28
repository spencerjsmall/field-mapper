import { Link, Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { requireAdminSession } from "~/utils/auth.server";
import { AiOutlineMenu } from "react-icons/ai";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await requireAdminSession(request);
  const userId = session.get("userId");
  const taskId = session.get("task");
  return { userId, taskId };
};

export default function AdminLayout() {
  const { userId, taskId } = useLoaderData();
  const { pathname } = useLocation();

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex flex-row bg-black items-center sticky top-0 z-50 justify-between drop-shadow-xl border-b border-white text-white text-2xl py-4 px-6">
        <div className="flex flex-row text-2xl items-center space-x-2">
          <div className="dropdown">
            <label tabIndex={0} className="">
              <AiOutlineMenu />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 mt-6 shadow bg-base-100 rounded-box w-52"
            >
              <li>Home</li>
              <li>Settings</li>
            </ul>
          </div>
          <h1 className="uppercase">Field Mapper</h1>
        </div>

        <div className="btn btn-sm font-sans btn-ghost">
          <form action="/auth/logout" method="post">
            <button type="submit" className="font-space uppercase">
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="w-full max-h-full h-full bg-base-500 overflow-y-hidden z-0">
        <Outlet context={userId} />
      </div>
    </div>
  );
}
