import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { AiOutlineMenu } from "react-icons/ai";
import { HiOutlineUserCircle } from "react-icons/hi";
import { requireUserSession } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await requireUserSession(request);
  const userId = session.get("userId");
  const taskId = session.get("task");
  const assignmentId = params.assignmentId;
  return { userId, taskId, assignmentId };
};

export default function FieldLayout() {
  const { userId, taskId, assignmentId } = useLoaderData();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex flex-row bg-black items-center sticky top-0 z-50 justify-between text-white text-2xl py-4 px-6">
        <AiOutlineMenu />
        <h1 className="uppercase">
          {pathname.match(/\//g).length == 2
            ? "Map"
            : pathname.match(/\//g).length == 3
            ? "Survey"
            : "Layers"}
        </h1>

        <HiOutlineUserCircle />

        {/* <div className="btn btn-sm font-sans btn-ghost">
          <form action="/auth/logout" method="post">
            <button type="submit">Sign Out</button>
          </form>
        </div> */}
      </div>

      <div className="w-full max-h-full h-full overflow-y-hidden z-0">
        <Outlet context={userId} />
      </div>
    </div>
  );
}
