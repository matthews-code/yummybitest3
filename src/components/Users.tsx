import { useRef, useState } from "react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { FaPlus } from "react-icons/fa6";
import { MdDelete, MdEdit } from "react-icons/md";

const Users = () => {
  const role = useSession().data?.user.role;

  const duplicateNumberText = useRef<HTMLParagraphElement>(null);
  const editDuplicateNumberText = useRef<HTMLParagraphElement>(null);

  const userFirstNameInput = useRef<HTMLInputElement>(null);
  const userLastNameInput = useRef<HTMLInputElement>(null);
  const userContactNumInput = useRef<HTMLInputElement>(null);
  const userAddressInput = useRef<HTMLInputElement>(null);

  const editUserFirstNameInput = useRef<HTMLInputElement>(null);
  const editUserLastNameInput = useRef<HTMLInputElement>(null);
  const editUserContactNumInput = useRef<HTMLInputElement>(null);
  const editUserAddressInput = useRef<HTMLInputElement>(null);

  const [searchInput, setSearchInput] = useState<string>("");

  const [userUid, setUserUid] = useState<string>("");
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

  const editUserEndpoint = api.user.editUser.useMutation({
    onSuccess: () => {
      void refetchUsers();
    },
  });

  const deleteUserEndpoint = api.user.deleteUser.useMutation({
    onSuccess: () => {
      void refetchUsers();
    },
  });

  const clearStates = () => {
    setUserFirstName("");
    setUserLastName("");
    setUserContactNum("");
    setUserAddress("");
    setUserUid("");
  };

  const formatContact = (number: string) => {
    let newNumber = number
      .replace(" ", "")
      .replace("+", "")
      .replace("(", "")
      .replace(")", "");

    return newNumber;
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

    if (
      users?.some(
        (user) =>
          user.contact_num === contactNum &&
          user.user_uid !== userUid &&
          user.deleted === false,
      )
    ) {
      addUser
        ? duplicateNumberText.current?.classList.remove("hidden")
        : editDuplicateNumberText.current?.classList.remove("hidden");
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

  const editUser = (
    firstName: string,
    lastName: string,
    contactNum: string,
    address: string,
    addUser: boolean,
  ) => {
    if (checkErrors(firstName, lastName, contactNum, address, addUser)) {
      editUserEndpoint.mutate({
        uid: userUid,
        firstName: firstName,
        lastName: lastName,
        contactNum: contactNum,
        address: address,
      });
      clearStates();
      modalBehaviour(addUser);
      editDuplicateNumberText.current?.classList.add("hidden");
    }
  };

  const deleteUser = () => {
    deleteUserEndpoint.mutate({ uid: userUid });
    clearStates();
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

        {users ? (
          <div className="mt-4 grid gap-3 pb-28 md:grid-cols-2 xl:grid-cols-3">
            {users
              ?.filter((user) => {
                if (
                  user.first_name
                    .toLowerCase()
                    .startsWith(searchInput.toLowerCase())
                ) {
                  return true;
                }
                if (
                  user.last_name
                    ?.toLowerCase()
                    .startsWith(searchInput.toLowerCase())
                ) {
                  return true;
                }
                if (
                  `${user.first_name.toLowerCase()} ${user.last_name?.toLowerCase()}`.startsWith(
                    searchInput.toLowerCase(),
                  )
                ) {
                  return true;
                }
                if (user.contact_num.startsWith(searchInput)) {
                  return true;
                }

                return false;
              })
              .map((user) => (
                <div key={user.user_uid} className="card bg-base-100 shadow-md">
                  <div className="card-body p-4 text-sm">
                    <h1 className="card-title m-0 p-0 text-lg">
                      {user.first_name} {user.last_name}
                    </h1>
                    <p className="mt-[-0.5rem] text-[#4c4c4c]">
                      {user.contact_num}
                    </p>
                    <p>{user.address}</p>
                    <div className="card-actions mt-1 flex w-full justify-between">
                      <button className="btn btn-primary btn-sm">
                        Order History
                      </button>
                      <div className="flex gap-2 self-center">
                        <button
                          onClick={() => {
                            const modalElement = (document.getElementById(
                              "edit_user_modal",
                            ) as HTMLDialogElement)!;
                            modalElement.showModal();

                            if (
                              editUserFirstNameInput.current !== null &&
                              editUserLastNameInput.current !== null &&
                              editUserContactNumInput.current !== null &&
                              editUserAddressInput.current !== null
                            ) {
                              setUserUid(user.user_uid);

                              setUserFirstName(user.first_name);
                              setUserLastName(user.last_name ?? "");
                              setUserContactNum(user.contact_num);
                              setUserAddress(user.address ?? "");

                              editUserFirstNameInput.current.value =
                                user.first_name;
                              editUserLastNameInput.current.value =
                                user.last_name ?? "";
                              editUserContactNumInput.current.value =
                                user.contact_num;
                              editUserAddressInput.current.value =
                                user.address ?? "";
                            }
                          }}
                        >
                          <MdEdit color={"#6f7687"} size={"1.1rem"} />
                        </button>
                        <button
                          onClick={() => {
                            setUserFirstName(user.first_name);
                            setUserUid(user.user_uid);
                            const modalElement = (document.getElementById(
                              "delete_user_modal",
                            ) as HTMLDialogElement)!;
                            modalElement.showModal();
                          }}
                        >
                          <MdDelete color={"#6f7687"} size={"1.1rem"} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="mt-8 text-center">
            <span className="loading loading-ring loading-lg"></span>
          </div>
        )}

        {/* ADD USER MODAL */}

        <dialog id="add_user_modal" className="modal modal-top sm:modal-middle">
          <div className="modal-box p-5">
            <h1 className="text-lg font-bold">Add Customer</h1>
            <div className="divider m-0 p-0"></div>
            <div className="flex gap-4">
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
                  if (!/^[+()0-9- ]*$/.test(e.currentTarget.value)) {
                    userContactNumInput.current?.classList.add("input-error");
                    return;
                  }

                  const formattedContact = formatContact(e.currentTarget.value);

                  setUserContactNum(formattedContact);
                  userContactNumInput.current?.classList.remove("input-error");
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
                <button className="btn border-none" onClick={clearStates}>
                  cancel
                </button>
                <div
                  tabIndex={0}
                  className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                  onClick={() => {
                    let formattedContact = "";
                    if (
                      userContactNum.length === 11 &&
                      userContactNum.charAt(0) === "0"
                    ) {
                      // console.log("63" + userContactNum.slice(1));
                      formattedContact = "63" + userContactNum.slice(1);
                    } else {
                      formattedContact = userContactNum;
                    }

                    addUser(
                      userFirstName,
                      userLastName,
                      formattedContact,
                      userAddress,
                      true,
                    );
                  }}
                >
                  add
                </div>
              </form>
            </div>
          </div>
        </dialog>

        {/* EDIT USER MODAL */}

        <dialog
          id="edit_user_modal"
          className="modal modal-top sm:modal-middle"
        >
          <div className="modal-box p-5">
            <h1 className="text-lg font-bold">Edit Customer</h1>
            <div className="divider m-0 p-0"></div>
            <div className="mt-2 flex gap-4">
              <div className="w-full">
                <div className="label">
                  <span className="label-text">First name</span>
                </div>
                <input
                  id="edit-user-first-name-input"
                  ref={editUserFirstNameInput}
                  type="text"
                  className="input input-bordered input-md w-full"
                  onChange={(e) => {
                    setUserFirstName(e.currentTarget.value);
                    editUserFirstNameInput.current?.classList.remove(
                      "input-error",
                    );
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
                  id="edit-user-last-name-input"
                  ref={editUserLastNameInput}
                  type="text"
                  className="input input-bordered input-md w-full"
                  onChange={(e) => setUserLastName(e.currentTarget.value)}
                />
              </div>
            </div>
            <div className="mt-2">
              <div className="label">
                <span className="label-text">
                  Contact Number{" "}
                  <i
                    ref={editDuplicateNumberText}
                    className="hidden text-red-600"
                  >
                    (number is already taken)
                  </i>
                </span>
              </div>
              <input
                id="edit-user-contact-number-input"
                ref={editUserContactNumInput}
                type="text"
                className="input input-bordered input-md w-full"
                onChange={(e) => {
                  if (!/^[+()0-9- ]*/.test(e.currentTarget.value)) {
                    editUserContactNumInput.current?.classList.add(
                      "input-error",
                    );
                    return;
                  }

                  const editFormattedContact = formatContact(
                    e.currentTarget.value,
                  );

                  setUserContactNum(editFormattedContact);
                  editUserContactNumInput.current?.classList.remove(
                    "input-error",
                  );
                  editDuplicateNumberText.current?.classList.add("hidden");
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
                id="edit-user-address-input"
                ref={editUserAddressInput}
                type="text"
                className="input input-bordered input-md w-full"
                onChange={(e) => setUserAddress(e.currentTarget.value)}
              />
            </div>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button
                  className="btn border-none"
                  onClick={() => {
                    editUserFirstNameInput.current?.classList.remove(
                      "input-error",
                    );
                    editUserLastNameInput.current?.classList.remove(
                      "input-error",
                    );
                    editUserContactNumInput.current?.classList.remove(
                      "input-error",
                    );
                    editUserAddressInput.current?.classList.remove(
                      "input-error",
                    );
                    editDuplicateNumberText.current?.classList.add("hidden");

                    clearStates();
                  }}
                >
                  cancel
                </button>
                <div
                  tabIndex={0}
                  className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                  onClick={() => {
                    let formattedContact = "";
                    if (
                      userContactNum.length === 11 &&
                      userContactNum.charAt(0) === "0"
                    ) {
                      // console.log("63" + userContactNum.slice(1));
                      formattedContact = "63" + userContactNum.slice(1);
                    } else {
                      formattedContact = userContactNum;
                    }

                    editUser(
                      userFirstName,
                      userLastName,
                      formattedContact,
                      userAddress,
                      false,
                    );
                  }}
                >
                  save
                </div>
              </form>
            </div>
          </div>
        </dialog>

        {/* DELETE USER MODAL */}

        <dialog
          id="delete_user_modal"
          className="modal modal-top sm:modal-middle"
        >
          <div className="modal-box p-5">
            <h1 className="text-lg font-bold">Delete Customer</h1>
            <div className="divider m-0 p-0"></div>
            <p>
              Are you sure you want to delete <b>{userFirstName}</b>?
            </p>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button className="btn border-none" onClick={clearStates}>
                  cancel
                </button>
                <button
                  className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                  onClick={deleteUser}
                >
                  delete
                </button>
              </form>
            </div>
          </div>
        </dialog>

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
