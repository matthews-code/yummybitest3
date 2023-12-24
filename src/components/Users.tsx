import React, { useRef, useState } from "react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { FaPlus } from "react-icons/fa6";

const Users = () => {
  const role = useSession().data?.user.role;

  const duplicateNumberText = useRef<HTMLParagraphElement>(null);
  const userFirstNameInput = useRef<HTMLInputElement>(null);
  const userLastNameInput = useRef<HTMLInputElement>(null);
  const userContactNumInput = useRef<HTMLInputElement>(null);
  const userAddressInput = useRef<HTMLInputElement>(null);

  const editUserFirstNameInput = useRef<HTMLInputElement>(null);
  const editUserLastNameInput = useRef<HTMLInputElement>(null);
  const editUserContactNumInput = useRef<HTMLInputElement>(null);
  const editUserAddressInput = useRef<HTMLInputElement>(null);

  const [searchInput, setSearchInput] = useState<string>("");

  const [userFirstName, setUserFirstName] = useState<string>("");
  const [userLastName, setUserLastName] = useState<string>("");
  const [userContactNum, setUserContactNum] = useState<string>("");
  const [userAddress, setUserAddress] = useState<string>("");

  const { data: users, refetch: refetchUsers } =
    api.user.getAllUsers.useQuery();

  const addUserEndpoint = api.user.createUser.useMutation({
    onSuccess: () => {
      void refetchUsers();
    },
  });

  const clearStates = () => {
    setUserFirstName("");
    setUserLastName("");
    setUserContactNum("");
    setUserAddress("");
  };

  const checkErrors = (
    firstName: string,
    lastName: string,
    contactNum: string,
    address: string,
    addUser: boolean,
  ) => {
    if (firstName === "") {
      addUser
        ? userFirstNameInput.current?.classList.add("input-error")
        : editUserFirstNameInput.current?.classList.add("input-error");
      return false;
    }

    if (contactNum === "") {
      addUser
        ? userContactNumInput.current?.classList.add("input-error")
        : editUserContactNumInput.current?.classList.add("input-error");
      return false;
    }

    if (!/^\d{11}$/.test(contactNum)) {
      addUser
        ? userContactNumInput.current?.classList.add("input-error")
        : editUserContactNumInput.current?.classList.add("input-error");
      return false;
    }

    if (users?.some((user) => user.contact_num === contactNum)) {
      duplicateNumberText.current?.classList.remove("hidden");
      console.log("duplicate contact number");
      return false;
    }

    return true;
  };

  const modalBehaviour = (addItem: boolean) => {
    const elementId = addItem ? "add_user_modal" : "edit_user_modal";
    const modalElement = (document.getElementById(
      elementId,
    ) as HTMLDialogElement)!;

    modalElement.close();
  };

  const addUser = (
    firstName: string,
    lastName: string,
    contactNum: string,
    address: string,
    addUser: boolean,
  ) => {
    if (checkErrors(firstName, lastName, contactNum, address, addUser)) {
      addUserEndpoint.mutate({
        firstName: firstName,
        lastName: lastName,
        contactNum: contactNum,
        address: address,
      });
      clearStates();
      modalBehaviour(addUser);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="h-[calc(100vh-66px)] w-full max-w-5xl p-3 sm:w-4/5 sm:p-8 xl:w-3/4">
        <input
          type="text"
          className="input input-bordered input-md w-full"
          placeholder="Search using name or contact number"
          onChange={(e) => setSearchInput(e.currentTarget.value)}
        />

        <div className="grid gap-4 py-4 md:grid-cols-2 xl:grid-cols-3">
          {users
            ?.filter((user) => {
              return (
                user.first_name
                  .toLowerCase()
                  .startsWith(searchInput.toLowerCase()) ||
                user.last_name
                  ?.toLowerCase()
                  .startsWith(searchInput.toLowerCase()) ||
                user.contact_num.startsWith(searchInput) ||
                `${user.first_name.toLowerCase()} ${user.last_name?.toLowerCase()}`.startsWith(
                  searchInput.toLowerCase(),
                )
              );
            })
            .map((user) => (
              <div key={user.user_uid} className="card bg-base-100 shadow-md">
                <div className="card-body p-4 text-sm">
                  <h1 className="card-title m-0 p-0 text-lg">
                    {user.first_name} {user.last_name}
                  </h1>
                  <p className="mt-[-0.5rem]">{user.contact_num}</p>
                  <p>{user.address}</p>
                  <div className="card-actions mt-1 justify-start">
                    <button className="btn btn-primary btn-sm">
                      Order History
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
        {/* ADD USER MODAL */}

        <dialog id="add_user_modal" className="modal modal-top sm:modal-middle">
          <div className="modal-box p-5">
            <h1 className="text-lg font-bold">Add User</h1>
            <div className="divider m-0 p-0"></div>
            <div className="mt-2 flex gap-4">
              <div className="w-full">
                <div className="label">
                  <span className="label-text">First name</span>
                </div>
                <input
                  id="user-first-name-input"
                  ref={userFirstNameInput}
                  type="text"
                  placeholder="Jose"
                  value={userFirstName}
                  className="input input-bordered input-md w-full"
                  onChange={(e) => {
                    setUserFirstName(e.currentTarget.value);
                    userFirstNameInput.current?.classList.remove("input-error");
                  }}
                />
              </div>
              <div className="w-full">
                <div className="label">
                  <span className="label-text">
                    Last name - <i className="text-sm">Optional</i>
                  </span>
                </div>
                <input
                  id="user-last-name-input"
                  ref={userLastNameInput}
                  type="text"
                  placeholder="Dela Cruz"
                  value={userLastName}
                  className="input input-bordered input-md w-full"
                  onChange={(e) => setUserLastName(e.currentTarget.value)}
                />
              </div>
            </div>
            <div className="mt-2">
              <div className="label">
                <span className="label-text">
                  Contact Number{" "}
                  <i ref={duplicateNumberText} className="hidden text-red-600">
                    (number is already taken)
                  </i>
                </span>
              </div>
              <input
                id="user-contact-number-input"
                ref={userContactNumInput}
                type="text"
                placeholder="09123456789"
                value={userContactNum}
                className="input input-bordered input-md w-full"
                onChange={(e) => {
                  setUserContactNum(e.currentTarget.value);

                  if (!/^\d{0,11}$/.test(e.currentTarget.value)) {
                    userContactNumInput.current?.classList.add("input-error");
                  } else {
                    userContactNumInput.current?.classList.remove(
                      "input-error",
                    );
                  }

                  duplicateNumberText.current?.classList.add("hidden");
                }}
              />
            </div>
            <div className="mt-2">
              <div className="label">
                <span className="label-text">
                  Address - <i className="text-sm">Optional</i>
                </span>
              </div>
              <input
                id="user-address-input"
                ref={userAddressInput}
                type="text"
                placeholder="864 Acacia St., Ayala Alabang Village, Muntinlupa City"
                value={userAddress}
                className="input input-bordered input-md w-full"
                onChange={(e) => setUserAddress(e.currentTarget.value)}
              />
            </div>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <div
                  tabIndex={0}
                  className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                  onClick={() =>
                    addUser(
                      userFirstName,
                      userLastName,
                      userContactNum,
                      userAddress,
                      true,
                    )
                  }
                >
                  add
                </div>
                <button className="btn border-none">cancel</button>
              </form>
            </div>
          </div>
        </dialog>

        {/* EDIT USER MODAL */}

        {/* DELETE USER MODAL */}

        {role === Role.ADMIN && (
          <button
            className="btn btn-circle btn-primary fixed bottom-6 right-6 h-16 w-16 shadow-lg"
            onClick={() => {
              const modalElement = (document.getElementById(
                "add_user_modal",
              ) as HTMLDialogElement)!;
              modalElement.showModal();
            }}
          >
            <FaPlus size={32} color={"#4c4528"} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Users;
