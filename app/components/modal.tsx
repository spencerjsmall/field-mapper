import { useNavigate } from "@remix-run/react";
import { AiOutlineClose } from "react-icons/ai";

export function Modal({ title = null, children }) {
  const navigate = useNavigate();
  return (
    <>
      <input
        type="checkbox"
        id="active-modal"
        checked
        className="modal-toggle"
      />
      <div className="modal bg-opacity-70 bg-black">
        <div className="modal-box relative p-8 bg-slate-700 border border-slate-500">
          <div className="flex flex-col space-y-4 w-full items-center">
            <div
              onClick={() => navigate(-1)}
              className="absolute cursor-pointer top-5 text-xl right-5"
            >
              <AiOutlineClose />
            </div>
            {title && (
              <h1 className="text-white font-semibold py-4">{title}</h1>
            )}
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
