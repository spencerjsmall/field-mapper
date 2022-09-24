import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderArgs) => {
  const pathname = params["*"];
  const ids = pathname.split("/").map((i) => parseInt(i));
  return ids
};

export default function SideBar() {
  const ids = useLoaderData();  
  return (
    <div>
      <ul className="justify-center items-center flex flex-col space-y-2">
        {ids.map((i) => (
          <li key={i}>
            <h1>{i}</h1>
          </li>
        ))}
      </ul>
    </div>
  );
}
