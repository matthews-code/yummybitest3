import React, { useRef, useState } from "react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { FaPlus } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { GiCardboardBox } from "react-icons/gi";
import { Decimal } from "@prisma/client/runtime/library";

interface item {
  item_uid: string;
  name: string;
  price: Decimal;
  bulk_price: Decimal;
  serving: Decimal;
  inventory: Decimal | null;
  created_at: Date;
  deleted: boolean;
}

const Items = () => {
  const role = useSession().data?.user.role;

  const duplicateNameText = useRef<HTMLParagraphElement>(null);

  const itemNameInput = useRef<HTMLInputElement>(null);
  const itemPriceInput = useRef<HTMLInputElement>(null);
  const itemServingInput = useRef<HTMLInputElement>(null);
  const itemInventoryInput = useRef<HTMLInputElement>(null);

  const [isAddingItem, setIsAddingItem] = useState(true);

  const [itemUid, setItemUid] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [itemPrice, setItemPrice] = useState<string>("");
  const [itemServing, setItemServing] = useState<string>("");
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
    setItemServing("");
    setItemUid("");
  };

  const setStates = (item: item) => {
    setItemUid(item.item_uid);

    setItemName(item.name);
    setItemPrice(item.bulk_price.toString());
    setItemInventory(item.inventory?.toString() ?? "");
    setItemServing(item.serving.toString());
  };

  const checkErrors = () => {
    if (itemName === "") {
      itemNameInput.current?.classList.add("input-error");
      return false;
    }

    if (itemServing === "") {
      itemServingInput.current?.classList.add("input-error");
      return false;
    }

    if (itemPrice === "") {
      itemPriceInput.current?.classList.add("input-error");
      return false;
    }

    if (
      items?.some(
        (item) =>
          item.name === itemName && item.item_uid !== itemUid && !item.deleted,
      )
    ) {
      duplicateNameText.current?.classList.remove("hidden");
      return false;
    }

    return true;
  };

  const modalBehaviour = () => {
    const modalElement = (document.getElementById(
      "add_item_modal",
    ) as HTMLDialogElement)!;

    modalElement.close();
  };

  const addItem = () => {
    if (checkErrors()) {
      addItemEndpoint.mutate({
        name: itemName,
        price: Number(itemPrice) / Number(itemServing),
        bulkPrice: Number(itemPrice),
        inventory: itemInventory === "" ? null : Number(itemInventory),
        serving: Number(itemServing),
      });
      clearStates();
      modalBehaviour();
    }
  };

  const editItem = () => {
    if (checkErrors()) {
      editItemEndpoint.mutate({
        uid: itemUid,
        name: itemName,
        price: Number(itemPrice) / Number(itemServing),
        bulkPrice: Number(itemPrice),
        inventory: itemInventory === "" ? null : Number(itemInventory),
        serving: Number(itemServing),
      });
      clearStates();
      modalBehaviour();
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
                      <th>Inv.</th>
                      {role === Role.SUPERADMIN && <th></th>}
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
                          <td>
                            {item.bulk_price.toString()} /{" "}
                            {item.serving.toString() +
                              (Number(item.serving) > 1 ? "pcs." : "pc.")}
                          </td>
                          <td>{item.inventory?.toString()}</td>
                          {role === Role.SUPERADMIN && (
                            <td className="">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setStates(item);
                                    setIsAddingItem(false);

                                    const modalElement =
                                      (document.getElementById(
                                        "add_item_modal",
                                      ) as HTMLDialogElement)!;
                                    modalElement.showModal();
                                  }}
                                >
                                  <MdEdit color={"#6f7687"} size={"1.2rem"} />
                                </button>
                                <button
                                  onClick={() => {
                                    setItemName(item.name);
                                    setItemUid(item.item_uid);
                                    const modalElement =
                                      (document.getElementById(
                                        "delete_item_modal",
                                      ) as HTMLDialogElement)!;
                                    modalElement.showModal();
                                  }}
                                >
                                  <MdDelete color={"#6f7687"} size={"1.2rem"} />
                                </button>
                              </div>
                            </td>
                          )}
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
            <h1 className="text-lg font-bold">
              {isAddingItem ? "Add Item" : "Edit Item"}
            </h1>
            <div className="divider m-0 p-0"></div>
            <div className="flex gap-4">
              <div className="w-full">
                <div className="label">
                  <span className="label-text">
                    Name{" "}
                    <i ref={duplicateNameText} className="hidden text-red-600">
                      (already taken)
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
                  value={itemInventory}
                  className="input input-bordered input-md w-full"
                  onChange={(e) => {
                    if (!/^\d*$/.test(e.currentTarget.value)) {
                      itemInventoryInput.current?.classList.add("input-error");
                    } else {
                      setItemInventory(e.currentTarget.value);
                      itemInventoryInput.current?.classList.remove(
                        "input-error",
                      );
                    }
                  }}
                />
              </div>
            </div>
            <div className="mt-2 flex gap-4">
              <div className="w-full">
                <div className="label">
                  <span className="label-text">
                    Serving <span className="italic">(pcs.)</span>
                  </span>
                </div>
                <input
                  id="item-multiplier-input"
                  ref={itemServingInput}
                  type="text"
                  placeholder="12"
                  value={itemServing}
                  className="input input-bordered input-md w-full"
                  onChange={(e) => {
                    if (!/^\d*$/.test(e.currentTarget.value)) {
                      itemServingInput.current?.classList.add("input-error");
                    } else {
                      setItemServing(e.currentTarget.value);
                      itemServingInput.current?.classList.remove("input-error");
                    }
                  }}
                />
              </div>
              <div className="w-full">
                <div className="label">
                  <span className="label-text">Price Per Serving</span>
                </div>
                <input
                  id="item-price-input"
                  ref={itemPriceInput}
                  type="text"
                  placeholder="400"
                  value={itemPrice}
                  className="input input-bordered input-md w-full"
                  onChange={(e) => {
                    if (!/^\d*\.?\d*$/.test(e.currentTarget.value)) {
                      itemPriceInput.current?.classList.add("input-error");
                    } else {
                      setItemPrice(e.currentTarget.value);
                      itemPriceInput.current?.classList.remove("input-error");
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
                    duplicateNameText.current?.classList.add("hidden");
                    itemNameInput.current?.classList.remove("input-error");
                    itemInventoryInput.current?.classList.remove("input-error");
                    itemPriceInput.current?.classList.remove("input-error");
                    itemServingInput.current?.classList.remove("input-error");
                    clearStates();
                  }}
                >
                  cancel
                </button>
                <div
                  tabIndex={0}
                  className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                  onClick={() => {
                    isAddingItem ? addItem() : editItem();
                  }}
                >
                  {isAddingItem ? "add" : "save"}
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

        {role === Role.SUPERADMIN && (
          <button
            className="btn btn-circle btn-primary fixed bottom-6 right-6 h-16 w-16 shadow-lg"
            onClick={() => {
              setIsAddingItem(true);
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
