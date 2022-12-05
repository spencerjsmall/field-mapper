import { LoaderFunction, redirect } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { AiFillGithub } from "react-icons/ai";
import { getUserSession } from "~/utils/auth.server";
import sf_seal from "../../public/images/sf_seal.png";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const role = session.get("role");
  if (role === "admin") {
    return redirect("/admin/home");
  } else if (role === "field") {
    return redirect("/home");
  }
  return null;
};

export default function LandingPage() {
  return (
    <div className="min-safe-h-screen h-screen w-screen items-center justify-center flex flex-col bg-ggp bg-blend-multiply bg-slate-900 bg-center">
      <div className="w-full h-full flex flex-col relative justify-center">
        <Link
          to="/auth/login"
          className="btn absolute text-lg top-5 right-5 btn-ghost"
        >
          login
        </Link>
        <Link
          to="/auth/login?action=register"
          className="btn absolute top-5 text-lg left-5 md:hidden"
        >
          Sign Up
        </Link>
        <img
          src={sf_seal}
          className="absolute top-5 left-10 hidden md:block w-14"
          alt="City and County of San Francico"
        />
        <div className="flex flex-col items-center relative space-y-0 sm:space-y-10 xl:space-y-0 xl:flex-row w-full h-3/4 justify-evenly">
          <div className="flex flex-col space-y-6 mx-5 xl:space-y-6 max-w-2xl justify-center h-fit md:h-full w-fit">
            <div className="flex flex-row items-end">
              <h1 className="text-white text-5xl sm:text-7xl text-center mx-auto md:mx-0 md:text-left font-bold">
                Field Mapper
              </h1>
              <a
                href="https://github.com/spencerjsmall/field-mapper"
                className="text-2xl pb-2 hidden ml-3 sm:block text-slate-500 hover:text-slate-200"
              >
                <AiFillGithub />
              </a>
              <p className="text-xl hidden sm:block ml-1 text-slate-500 pb-1">
                by SFGIS{" "}
              </p>
            </div>
            <p className="xl:text-2xl text-center md:text-left text-lg sm:text-xl text-slate-400 tracking-wide">
              Upload features, design surveys, create assignments, and collect
              data... all in one place.
            </p>
            <div className="px-2 pt-4 w-full">
              <Link
                to="/auth/login?action=register"
                className="btn text-xl hidden md:block w-full py-2 hover:bg-slate-500 hover:text-black"
              >
                Get Started
              </Link>
            </div>
          </div>
          <div className="flex flex-col mx-5 relative items-center justify-center">
            <iframe
              src="https://www.loom.com/embed/02d1c86fb5064a2485b258a7eeafb9f3?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true"
              frameBorder="0"
              title="demo"
              allowFullScreen
              className="w-[423px] z-30 h-[246px] sm:w-[457px] drop-shadow-md sm:h-[274px] md:w-[686px] md:h-[411px]"
            ></iframe>
            <div className="absolute z-20 w-[423px] h-[246px] sm:w-[457px] sm:h-[274px] md:w-[686px] md:h-[411px] bg-slate-900 bg-opacity-80 -top-4 right-5" />
            <div className="absolute z-10 w-[423px] h-[246px] sm:w-[457px] sm:h-[274px] md:w-[686px] md:h-[411px] bg-slate-700 bg-opacity-50 top-6 -right-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
