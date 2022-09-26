import { Outlet, useOutletContext } from "@remix-run/react";

export default function MapWrapper() {
  const userId = useOutletContext();
  return <Outlet context={userId} />;
}
