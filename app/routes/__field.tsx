import {
  Outlet,
  useLoaderData,
  useLocation,
  useMatches,
  useNavigate,
  Link,
} from "@remix-run/react";
import { AiOutlineMenu } from "react-icons/ai";
import { HiOutlineUserCircle } from "react-icons/hi";
import { AdminAvatars } from "~/components/admin-avatars";
import { requireFieldSession } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { IoArrowBackCircle } from "react-icons/io5";
import sf_seal from "../../public/images/sf_seal.png";

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await requireFieldSession(request);
  const userId = session.get("userId");
  const userSurveyor = await prisma.surveyor.findUniqueOrThrow({
    where: { id: parseInt(userId) },
    include: { user: true },
  });
  return { userSurveyor };
};

export default function FieldLayout() {
  const { userSurveyor } = useLoaderData();
  const matches = useMatches();
  console.log("matches", matches);

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex flex-row bg-black items-center border-b border-gray-300 sticky top-0 z-50 justify-between text-white text-2xl py-4 px-6">
        {matches[2].id == "routes/__field/layers/$layerId" ? (
          <Link to="/home" className="text-4xl">
            <IoArrowBackCircle />
          </Link>
        ) : (
          <img
            src={sf_seal}
            className="w-10"
            alt="City and County of San Francico"
          />
        )}
        <h1 className="uppercase">
          {matches[2].id == "routes/__field/layers/$layerId"
            ? matches[2].data.layer.name
            : matches[2].id == "routes/__field/layers/$layerId.$assignmentId"
            ? matches[2].data.name
            : "Layers"}
        </h1>
        <form action="/auth/logout" method="post">
          <button type="submit">
            <AdminAvatars admins={[userSurveyor]} />
          </button>
        </form>

        {/* <div className="btn btn-sm font-sans btn-ghost">
          <form action="/auth/logout" method="post">
            <button type="submit">Sign Out</button>
          </form>
        </div> */}
      </div>

      <div className="w-full max-h-full h-full overflow-y-hidden z-0">
        <Outlet context={userSurveyor} />
      </div>
    </div>
  );
}
