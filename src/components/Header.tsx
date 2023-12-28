import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

interface HeaderProps {
  setPage: React.Dispatch<React.SetStateAction<string>>;
}

const Header: React.FC<HeaderProps> = ({ setPage }) => {
  const { data: sessionData } = useSession();

  const handleClick = () => {
    const elem = document.activeElement as HTMLElement;
    if (elem) {
      elem?.blur();
    }
  };

  // console.log(sessionData?.user);

  return (
    <div className="navbar bg-primary text-primary-content">
      <div className="flex-1 pl-5 text-3xl font-bold">
        {sessionData ? (
          <p
            onClick={() => setPage("orders")}
            className="cursor-pointer text-xl text-[#3d3d3d] sm:text-3xl"
          >
            Yummy Bites Dashboard
          </p>
        ) : (
          ""
        )}
      </div>
      <div className="flex-none gap-2">
        {sessionData?.user ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-circle btn-ghost"
            >
              <img
                className="w-10 rounded-full"
                src={sessionData?.user?.image ?? ""}
                alt={sessionData?.user?.name ?? ""}
              />
            </div>
            <ul
              tabIndex={0}
              onClick={handleClick}
              className="menu dropdown-content z-[1] w-52 rounded-box bg-base-100 p-2 shadow-md"
            >
              <li tabIndex={0}>
                <p onClick={() => setPage("orders")}>Orders</p>
              </li>
              <li tabIndex={0}>
                <p onClick={() => setPage("users")}>Costumers</p>
              </li>
              <li tabIndex={0}>
                <p onClick={() => setPage("items")}>Items</p>
              </li>
              <li tabIndex={0}>
                <p onClick={() => void signOut()}>Log Out</p>
              </li>
            </ul>
          </div>
        ) : (
          <button
            className="btn btn-ghost rounded-btn"
            onClick={() => void signIn()}
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
