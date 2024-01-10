import React, { useRef, useState } from "react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { FaPlus } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { GiCardboardBox } from "react-icons/gi";

const Items = () => {
  const role = useSession().data?.user.role;

  const itemNameInput = useRef<HTMLInputElement>(null);
  const itemPriceInput = useRef<HTMLInputElement>(null);
  const itemInventoryInput = useRef<HTMLInputElement>(null);

  const duplicateNameText = useRef<HTMLParagraphElement>(null);
  const editDuplicateNameText = useRef<HTMLParagraphElement>(null);

  const editItemNameInput = useRef<HTMLInputElement>(null);
  const editItemPriceInput = useRef<HTMLInputElement>(null);
  const editItemInventoryInput = useRef<HTMLInputElement>(null);

  const [itemUid, setItemUid] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [itemPrice, setItemPrice] = useState<string>("");
  const [itemInventory, setItemInventory] = useState<string>("");

  const { data: items, refetch: refetchItems } =
    api.item.getAllItems.useQuery();

  const addItemEndpoint = api.item.createItem.useMutation({
    onSuccess: () => {
      void refetchItems();
    },
  });

  const editItemEndpoint = api.item.editItem.useMutation({
    onSuccess: () => {
      void refetchItems();
    },
  });

  const deleteItemEndpoint = api.item.deleteItem.useMutation({
    onSuccess: () => {
      void refetchItems();
    },
  });

  const clearStates = () => {
    setItemName("");
    setItemPrice("");
    setItemInventory("");
    setItemUid("");
  };

  const checkErrors = (
    name: string,
    price: string,
    inventory: string,
    addItem: boolean,
  ) => {
    if (name === "") {
      addItem
        ? itemNameInput.current?.classList.add("input-error")
        : editItemNameInput.current?.classList.add("input-error");
      return false;
    }

    if (price === "") {
      addItem
        ? itemPriceInput.current?.classList.add("input-error")
        : editItemPriceInput.current?.classList.add("input-error");
      return false;
    }

    if (
      items?.some((item) => item.name === name && item.item_uid !== itemUid)
    ) {
      addItem
        ? duplicateNameText.current?.classList.remove("hidden")
        : editDuplicateNameText.current?.classList.remove("hidden");
      return false;
    }

    if (!/^\d*\.?\d*$/.test(price)) {
      return false;
    }

    if (!/^\d*$/.test(inventory)) {
      return false;
    }

    return true;
  };

  const modalBehaviour = (addItem: boolean) => {
    const elementId = addItem ? "add_item_modal" : "edit_item_modal";
    const modalElement = (document.getElementById(
      elementId,
    ) as HTMLDialogElement)!;

    modalElement.close();
  };

  const addItem = (
    name: string,
    price: string,
    inventory: string,
    addItem: boolean,
  ) => {
    if (checkErrors(name, price, inventory, addItem)) {
      addItemEndpoint.mutate({
        name: name,
        price: Number(price),
        inventory: inventory === "" ? null : Number(inventory),
      });
      clearStates();
      modalBehaviour(addItem);
    }
  };

  const editItem = (
    name: string,
    price: string,
    inventory: string,
    addItem: boolean,
  ) => {
    if (checkErrors(name, price, inventory, addItem)) {
      editItemEndpoint.mutate({
        uid: itemUid,
        name: itemName,
        price: Number(itemPrice),
        inventory: itemInventory === "" ? null : Number(itemInventory),
      });
      clearStates();
      modalBehaviour(addItem);
    }
  };

  const deleteItem = () => {
    deleteItemEndpoint.mutate({ uid: itemUid });
    clearStates();
  };

  return (
    <div className="flex justify-center">
      <div className="h-[calc(100vh-66px)] w-full max-w-5xl p-3 sm:w-4/5 sm:p-8 xl:w-3/4">
        {items ? (
          <>
            {items.length < 1 ? (
              <div className="mt-28">
                <div className="mx-auto my-4 w-fit rounded-full bg-[#fcf6b1] p-6">
                  <GiCardboardBox color={"#f4e976"} size={"8rem"} />
                </div>
                <p className="text-center text-base font-light text-[#a3a3a3]">
                  No items found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table sm:table-lg">
                  <thead>
                    <tr className="text-sm">
                      <th>Name</th>
                      <th>Price</th>
                      <th>Inventory</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      ?.filter((item) => {
                        if (!item.deleted) {
                          return true;
                        }
                        return false;
                      })
                      .map((item) => (
                        <tr key={item.item_uid}>
                          <td>{item.name}</td>
                          <td>{item.price.toString()}</td>
                          <td>{item.inventory?.toString()}</td>
                          <td className="">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const modalElement = (document.getElementById(
                                    "edit_item_modal",
                                  ) as HTMLDialogElement)!;
                                  modalElement.showModal();
                                  if (
                                    editItemNameInput.current !== null &&
                                    editItemPriceInput.current !== null &&
                                    editItemInventoryInput.current !== null
                                  ) {
                                    setItemUid(item.item_uid);

                                    setItemName(item.name);
                                    setItemPrice(item.price.toString());
                                    setItemInventory(
                                      item.inventory?.toString() ?? "",
                                    );

                                    editItemNameInput.current.value = item.name;
                                    editItemPriceInput.current.value =
                                      item.price.toString();
                                    editItemInventoryInput.current.value =
                                      item.inventory?.toString() ?? "";
                                  }
                                }}
                              >
                                <MdEdit color={"#6f7687"} size={"1.2rem"} />
                              </button>
                              <button
                                onClick={() => {
                                  setItemName(item.name);
                                  setItemUid(item.item_uid);
                                  const modalElement = (document.getElementById(
                                    "delete_item_modal",
                                  ) as HTMLDialogElement)!;
                                  modalElement.showModal();
                                }}
                              >
                                <MdDelete color={"#6f7687"} size={"1.2rem"} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="mt-8 text-center">
            <span className="loading loading-ring loading-lg"></span>
          </div>
        )}

        {/* ADD ITEM MODAL */}

        <dialog id="add_item_modal" className="modal modal-top sm:modal-middle">
          <div className="modal-box p-5">
            <h1 className="text-lg font-bold">Add Item</h1>
            <div className="divider m-0 p-0"></div>
            <div className="label">
              <span className="label-text">
                Name{" "}
                <i ref={duplicateNameText} className="hidden text-red-600">
                  (name is already taken)
                </i>
              </span>
            </div>
            <input
              id="item-name-input"
              ref={itemNameInput}
              type="text"
              placeholder="Empanada"
              value={itemName}
              className="input input-bordered input-md w-full"
              onChange={(e) => {
                setItemName(e.currentTarget.value);
                itemNameInput.current?.classList.remove("input-error");

                duplicateNameText.current?.classList.add("hidden");
              }}
            />
            <div className="mt-2 flex gap-4">
              <div className="w-full">
                <div className="label">
                  <span className="label-text">Price Per Piece</span>
                </div>
                <input
                  id="item-price-input"
                  ref={itemPriceInput}
                  type="text"
                  placeholder="50"
                  value={itemPrice}
                  className="input input-bordered input-md w-full"
                  onChange={(e) => {
                    setItemPrice(e.currentTarget.value);
                    if (!/^\d*\.?\d*$/.test(e.currentTarget.value)) {
                      itemPriceInput.current?.classList.add("input-error");
                    } else {
                      itemPriceInput.current?.classList.remove("input-error");
                    }
                  }}
                />
              </div>
              <div className="w-full">
                <div className="label">
                  <span className="label-text">
                    Inventory - <i className="text-sm">Optional</i>
                  </span>
                </div>
                <input
                  id="item-inventory-input"
                  ref={itemInventoryInput}
                  type="text"
                  placeholder="120"
                  value={itemInventory}
                  className="input input-bordered input-md w-full"
                  onChange={(e) => {
                    setItemInventory(e.currentTarget.value);
                    if (!/^\d*$/.test(e.currentTarget.value)) {
                      itemInventoryInput.current?.classList.add("input-error");
                    } else {
                      itemInventoryInput.current?.classList.remove(
                        "input-error",
                      );
                    }
                  }}
                />
              </div>
            </div>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button className="btn border-none" onClick={clearStates}>
                  cancel
                </button>
                <div
                  tabIndex={0}
                  className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                  onClick={() =>
                    addItem(itemName, itemPrice, itemInventory, true)
                  }
                >
                  add
                </div>
              </form>
            </div>
          </div>
        </dialog>

        {/* EDIT ITEM MODAL */}

        <dialog
          id="edit_item_modal"
          className="modal modal-top sm:modal-middle"
        >
          <div className="modal-box p-5">
            <h1 className="text-lg font-bold">Edit Item</h1>
            <div className="divider m-0 p-0"></div>
            <div className="label">
              <span className="label-text">
                Name{" "}
                <i ref={editDuplicateNameText} className="hidden text-red-600">
                  (name is already taken)
                </i>
              </span>
            </div>
            <input
              id="edit-name-input"
              ref={editItemNameInput}
              type="text"
              className="input input-bordered input-md w-full"
              onChange={(e) => {
                setItemName(e.currentTarget.value);
                editItemNameInput.current?.classList.remove("input-error");

                editDuplicateNameText.current?.classList.add("hidden");
              }}
            />
            <div className="mt-2 flex gap-4">
              <div className="w-full">
                <div className="label">
                  <span className="label-text">Price Per Piece</span>
                </div>
                <input
                  id="item-price-input"
                  ref={editItemPriceInput}
                  type="text"
                  className="input input-bordered input-md w-full"
                  onChange={(e) => {
                    setItemPrice(e.currentTarget.value);
                    if (!/^\d*\.?\d*$/.test(e.currentTarget.value)) {
                      editItemPriceInput.current?.classList.add("input-error");
                    } else {
                      editItemPriceInput.current?.classList.remove(
                        "input-error",
                      );
                    }
                  }}
                />
              </div>
              <div className="w-full">
                <div className="label">
                  <span className="label-text">
                    Inventory - <i className="text-sm">Optional</i>
                  </span>
                </div>
                <input
                  id="item-inventory-input"
                  ref={editItemInventoryInput}
                  type="text"
                  className="input input-bordered input-md w-full"
                  onChange={(e) => {
                    setItemInventory(e.currentTarget.value);
                    if (!/^\d*$/.test(e.currentTarget.value)) {
                      editItemInventoryInput.current?.classList.add(
                        "input-error",
                      );
                    } else {
                      editItemInventoryInput.current?.classList.remove(
                        "input-error",
                      );
                    }
                  }}
                />
              </div>
            </div>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button
                  className="btn border-none"
                  onClick={() => {
                    editItemNameInput.current?.classList.remove("input-error");
                    editItemPriceInput.current?.classList.remove("input-error");
                    editItemInventoryInput.current?.classList.remove(
                      "input-error",
                    );

                    editDuplicateNameText.current?.classList.add("hidden");

                    clearStates();
                  }}
                >
                  cancel
                </button>
                <div
                  tabIndex={0}
                  className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                  onClick={() =>
                    editItem(itemName, itemPrice, itemInventory, false)
                  }
                >
                  save
                </div>
              </form>
            </div>
          </div>
        </dialog>

        {/* DELETE ITEM MODAL */}

        <dialog
          id="delete_item_modal"
          className="modal modal-top sm:modal-middle"
        >
          <div className="modal-box p-5">
            <h1 className="text-lg font-bold">Delete Item</h1>
            <div className="divider m-0 p-0"></div>
            <p>
              Are you sure you want to delete <b>{itemName}?</b>
            </p>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button className="btn border-none" onClick={clearStates}>
                  cancel
                </button>
                <button
                  className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                  onClick={deleteItem}
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
                "add_item_modal",
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

export default Items;
