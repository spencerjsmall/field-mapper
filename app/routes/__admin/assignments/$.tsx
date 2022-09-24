import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderArgs) => {
  const pathname = params["*"];
  console.log('pathname', pathname)
  const ids = pathname.split("/").map((i) => parseInt(i));
  return ids
};

export default function SideBar() {
  const ids = useLoaderData();  
  console.log('ids', ids)  
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
