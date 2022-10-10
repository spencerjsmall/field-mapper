import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { requireAdminSession } from "~/utils/auth.server";
import { IoIosArrowDropleftCircle } from "react-icons/io";

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
      <div className="flex flex-row bg-[#41437E] items-center sticky top-0 z-50 justify-between drop-shadow-xl border-b border-white text-white text-2xl py-4 px-6">
        <Link
          className={pathname == "/admin/home" ? "text-gray-700" : "text-white"}
          to="/admin/home"
        >
          <IoIosArrowDropleftCircle />
        </Link>

        {pathname && (
          <span className="uppercase font-mono text-xl pl-10">
            {pathname == "/admin/home"
              ? "home"
              : taskId.split(/(?=[A-Z])/).join(" ")}
          </span>
        )}

        <div className="btn btn-sm font-mono btn-ghost">
          <form action="/auth/logout" method="post">
            <button type="submit">Sign Out</button>
          </form>
        </div>
      </div>

      <div className="w-full max-h-full h-full overflow-y-hidden z-0">
        <Outlet context={userId} />
      </div>
    </div>
  );
}
