import React, { useRef, useState } from "react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { FaPlus } from "react-icons/fa6";

const Items = () => {
  const role = useSession().data?.user.role;

  const itemNameInput = useRef<HTMLInputElement>(null);
  const itemPriceInput = useRef<HTMLInputElement>(null);
  const itemInventoryInput = useRef<HTMLInputElement>(null);

  const [itemName, setItemName] = useState<string>("");
  const [itemPrice, setItemPrice] = useState<string>("");
  const [itemInventory, setItemInventory] = useState<string>("");

  const { data: items, refetch: refetchItems } =
    api.item.getAllItems.useQuery();

  const createItem = api.item.createItem.useMutation({
    onSuccess: () => {
      void refetchItems();
    },
  });

  const checkErrors = () => {
    if (itemName === "") {
      console.log("here");
      itemNameInput.current?.classList.add("input-error");
      return false;
    }

    if (itemPrice === "") {
      itemPriceInput.current?.classList.add("input-error");
      return false;
    }

    if (!/^\d*\.?\d*$/.test(itemPrice)) {
      return false;
    }

    if (!/^\d*$/.test(itemInventory)) {
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
      createItem.mutate({
        name: itemName,
        price: Number(itemPrice),
        inventory: itemInventory === "" ? null : Number(itemInventory),
      });
      setItemName("");
      setItemPrice("");
      setItemInventory("");
      modalBehaviour();
    } else {
      console.log("nope");
    }
  };

  return (
    <div className="flex justify-center">
      <div className="h-[calc(100vh-66px)] w-full p-6 sm:w-3/4 sm:p-10">
        {role === Role.ADMIN && (
          <button
            className="btn btn-circle btn-primary fixed bottom-7 right-7 h-16 w-16 shadow-md"
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

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-sm">
                <th>Name</th>
                <th>Price</th>
                <th>Inventory</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item) => (
                //   onDelete={() => void deleteNote.mutate({ id: note.id })}
                <tr>
                  <td>{item.name}</td>
                  <td>{item.price.toString()}</td>
                  <td>{item.inventory?.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}

        <dialog id="add_item_modal" className="modal modal-top sm:modal-middle">
          <div className="modal-box p-5">
            <div className="label">
              <span className="label-text text-base">Name</span>
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
              }}
            />
            <div className="mt-2 flex gap-4">
              <div className="w-full">
                <div className="label">
                  <span className="label-text text-base">Price Per Piece</span>
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
                  <span className="label-text text-base">
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
                <div
                  tabIndex={0}
                  className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                  onClick={addItem}
                >
                  add
                </div>
                <button className="btn border-none">cancel</button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default Items;
