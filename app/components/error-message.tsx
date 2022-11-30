import { useNavigate } from "@remix-run/react";
import { TbCompassOff } from "react-icons/tb";

export function ErrorMessage({ message = "An unknown error occurred" }) {
  const navigate = useNavigate();
  return (
    <div className="grow h-full w-full flex flex-col items-center justify-center">
      <div className="w-screen md:w-fit md:px-24 p-0 md:py-16 bg-orange-700 border border-slate-500 rounded-md flex flex-col justify-center items-center space-y-6 h-screen md:h-fit">
        <h1 className="text-white text-6xl font-bold">Error 400</h1>
        <h2 className="text-white">{message}</h2>
        <span className="text-8xl py-2 text-white">
          <TbCompassOff />
        </span>
        <button
          onClick={() => navigate(-1)}
          className="btn bg-black text-white"
        >
          Take me back
        </button>
      </div>
    </div>
  );
}
