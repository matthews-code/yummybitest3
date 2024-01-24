import { useRef, useState, useEffect } from "react";
import OrderHistory from "./sub/OrderHistory";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { FaPlus } from "react-icons/fa6";
import { MdDelete, MdEdit } from "react-icons/md";

interface user {
  user_uid: string;
  first_name: string;
  last_name: string | null;
  contact_num: string;
  address: string | null;
  deleted: boolean;
}

const Users = () => {
  const role = useSession().data?.user.role;

  const duplicateNumberText = useRef<HTMLParagraphElement>(null);

  const userFirstNameInput = useRef<HTMLInputElement>(null);
  const userLastNameInput = useRef<HTMLInputElement>(null);
  const userContactNumInput = useRef<HTMLInputElement>(null);
  const userAddressInput = useRef<HTMLInputElement>(null);

  const [isAddingUser, setIsAddingUser] = useState(true);
  const [isViewingHistory, setIsViewingHistory] = useState(false);

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

  const setStates = (user: user) => {
    setUserUid(user.user_uid);
    setUserFirstName(user.first_name);
    setUserLastName(user.last_name ?? "");
    setUserContactNum(user.contact_num);
    setUserAddress(user.address ?? "");
  };

  const cleanContact = (number: string) => {
    const newNumber = number
      .replace(" ", "")
      .replace("+", "")
      .replace("(", "")
      .replace(")", "");

    return newNumber;
  };

  const formatContact = (contactNum: string) => {
    if (contactNum.length === 11 && contactNum.startsWith("0")) {
      return "63" + contactNum.slice(1);
    }
    return contactNum;
  };

  const checkErrors = (contactNum: string) => {
    if (userFirstName === "") {
      userFirstNameInput.current?.classList.add("input-error");
      return false;
    }

    if (contactNum === "") {
      userContactNumInput.current?.classList.add("input-error");
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
      duplicateNumberText.current?.classList.remove("hidden");
      return false;
    }

    if (contactNum.length !== 12) {
      userContactNumInput.current?.classList.add("input-error");
      return false;
    }

    return true;
  };

  const modalBehaviour = () => {
    const modalElement = (document.getElementById(
      "add_user_modal",
    ) as HTMLDialogElement)!;

    modalElement.close();
  };

  const addUser = (contactNumber: string) => {
    const cleanedContactNumber = cleanContact(contactNumber);
    const formattedContactNumber = formatContact(cleanedContactNumber);

    if (checkErrors(formattedContactNumber)) {
      addUserEndpoint.mutate({
        firstName: userFirstName,
        lastName: userLastName,
        contactNum: formattedContactNumber,
        address: userAddress,
      });
      clearStates();
      modalBehaviour();
    }
  };

  const editUser = (contactNumber: string) => {
    const cleanedContactNumber = cleanContact(contactNumber);
    const formattedContactNumber = formatContact(cleanedContactNumber);

    if (checkErrors(formattedContactNumber)) {
      editUserEndpoint.mutate({
        uid: userUid,
        firstName: userFirstName,
        lastName: userLastName,
        contactNum: formattedContactNumber,
        address: userAddress,
      });
      clearStates();
      modalBehaviour();
    }
  };

  const deleteUser = () => {
    deleteUserEndpoint.mutate({ uid: userUid });
    clearStates();
  };

  const manipulateContactNumber = (contactNum: string) => {
    return (
      "(+" +
      contactNum.slice(0, 2) +
      ")" +
      " " +
      contactNum.slice(2, 5) +
      " " +
      contactNum.slice(5, 8) +
      " " +
      contactNum.slice(8)
    );
  };

  return (
    <div className="flex justify-center">
      <div className="h-[calc(100vh-66px)] w-full max-w-5xl p-3 sm:w-4/5 sm:p-8 xl:w-3/4">
        {isViewingHistory && (
          <OrderHistory
            role={role}
            userUid={userUid}
            users={users}
            setIsViewingHistory={setIsViewingHistory}
          />
        )}
        {!isViewingHistory && (
          <>
            {role !== Role.USER && (
              <input
                type="text"
                className="input input-bordered input-md w-full"
                placeholder="Search using name or contact number"
                onChange={(e) => setSearchInput(e.currentTarget.value)}
              />
            )}

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
                    if (user.contact_num.includes(searchInput)) {
                      return true;
                    }

                    const numWithZero = "0" + user.contact_num.slice(2);

                    if (numWithZero.includes(searchInput)) {
                      return true;
                    }

                    return false;
                  })
                  .filter((user) => {
                    if (!user.deleted) {
                      return true;
                    }
                    return false;
                  })
                  .map((user) => (
                    <div
                      key={user.user_uid}
                      className="card bg-base-100 shadow-md"
                    >
                      <div className="card-body p-4 text-sm">
                        <h1 className="card-title m-0 p-0 text-lg">
                          {user.first_name}{" "}
                          {role === Role.USER ? "*****" : user.last_name}
                        </h1>
                        <p className="mt-[-0.5rem] text-sm italic text-blue-600 underline">
                          {role === Role.USER ? (
                            "(+63) *** *** ****"
                          ) : (
                            <a href={`tel:${user.contact_num}`}>
                              {manipulateContactNumber(user.contact_num)}
                            </a>
                          )}
                        </p>
                        {role !== Role.USER && <p>{user.address}</p>}
                        <div className="card-actions mt-1 flex w-full justify-between">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setUserUid(user.user_uid);
                              setIsViewingHistory(true);
                            }}
                          >
                            Order History
                          </button>
                          {role === Role.SUPERADMIN && (
                            <div className="flex gap-2 self-center">
                              <button
                                onClick={() => {
                                  setStates(user);
                                  setIsAddingUser(false);

                                  const modalElement = (document.getElementById(
                                    "add_user_modal",
                                  ) as HTMLDialogElement)!;
                                  modalElement.showModal();
                                }}
                              >
                                <MdEdit color={"#6f7687"} size={"1.2rem"} />
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
                                <MdDelete color={"#6f7687"} size={"1.2rem"} />
                              </button>
                            </div>
                          )}
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
          </>
        )}

        {/* ADD USER MODAL */}

        <dialog id="add_user_modal" className="modal modal-top sm:modal-middle">
          <div className="modal-box p-5">
            <h1 className="text-lg font-bold">
              {isAddingUser ? "Add Customer" : "Edit Customer"}
            </h1>
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

                  // const formattedContact = cleanContact(e.currentTarget.value);

                  setUserContactNum(e.currentTarget.value);
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
                <button
                  className="btn border-none"
                  onClick={() => {
                    duplicateNumberText.current?.classList.add("hidden");
                    userContactNumInput.current?.classList.remove(
                      "input-error",
                    );
                    clearStates();
                  }}
                >
                  cancel
                </button>
                <div
                  tabIndex={0}
                  className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                  onClick={() => {
                    isAddingUser
                      ? addUser(userContactNum)
                      : editUser(userContactNum);
                  }}
                >
                  {isAddingUser ? "add" : "save"}
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

        {role !== Role.USER && (
          <button
            className="btn btn-circle btn-primary fixed bottom-6 right-6 h-16 w-16 shadow-lg"
            onClick={() => {
              setIsAddingUser(true);
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
