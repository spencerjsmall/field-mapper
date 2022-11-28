import { Link } from "@remix-run/react";
import { useState } from "react";
import { Avatars } from "./avatars";

export function ProfileIcon({ profile, admin = false }) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className="dropdown dropdown-end justify-self-end">
      <label onClick={() => setShowMenu(true)} tabIndex={0}>
        <Avatars profiles={[profile]} />
      </label>
      {showMenu && (
        <ul
          tabIndex={0}
          className="dropdown-content menu p-2 mt-4 shadow bg-base-100 rounded-box w-52"
        >
          <li>
            <a>
              <Link
                onClick={() => setShowMenu(false)}
                className="text-lg"
                to={admin ? "/admin/settings" : "/settings"}
              >
                Settings
              </Link>
            </a>
          </li>
          <li>
            <form action="/auth/logout" method="post">
              <button type="submit" className="text-lg">
                Logout
              </button>
            </form>
          </li>
        </ul>
      )}
    </div>
  );
}
