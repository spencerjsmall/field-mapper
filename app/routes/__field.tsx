import {
  Outlet,
  useLoaderData,
  useMatches,
  Link,
  useNavigate,
} from "@remix-run/react";
import { requireFieldSession } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import sf_seal from "../../public/images/sf_seal.png";
import { BsArrowLeftShort } from "react-icons/bs";
import { ProfileIcon } from "~/components/profile-icon";

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
  const navigate = useNavigate();

  return (
    <div className="min-safe-h-screen w-screen flex flex-col">
      <div className="flex flex-row bg-black items-center border-b border-slate-600 sticky top-0 z-50 justify-between text-white text-2xl py-3 px-4">
        {matches[2].id != "routes/__field/home" ? (
          <div onClick={() => navigate(-1)} className="text-3xl">
            <BsArrowLeftShort />
          </div>
        ) : (
          <img
            src={sf_seal}
            className="w-12"
            alt="City and County of San Francico"
          />
        )}
        <h2 className="uppercase font-semibold truncate mx-2">
          {matches[2].pathname == "/settings"
            ? "settings"
            : !matches[2].data
            ? "error"
            : matches[2].id == "routes/__field/layers/$layerId" &&
              matches[2].data.layer
            ? matches[2].data.layer.name
            : matches[2].id == "routes/__field/home"
            ? "assignments"
            : matches[2].data.feature && matches[2].data.feature.label
            ? matches[2].data.feature.label
            : `Record #${matches[2].data.feature.id}`}
        </h2>
        <ProfileIcon profile={userSurveyor} />
      </div>

      <Outlet context={{ userSurveyor }} />
    </div>
  );
}
