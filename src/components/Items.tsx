import React, { useState } from "react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { FaPlus } from "react-icons/fa6";
import { nan, number, z } from "zod";

const Items = () => {
  const role = useSession().data?.user.role;

  const [itemName, setItemName] = useState<string>("");
  const [itemPrice, setItemPrice] = useState<number>(NaN);
  const [itemInventory, setItemInventory] = useState<number>(NaN);

  const { data: items, refetch: refetchItems } =
    api.item.getAllItems.useQuery();

  const createItem = api.item.createItem.useMutation({
    onSuccess: () => {
      void refetchItems();
    },
  });

  const addItem = () => {
    if (itemName && !Number.isNaN(itemPrice)) {
      createItem.mutate({
        name: itemName,
        price: itemPrice,
        inventory:
          Number.isNaN(itemInventory) || itemInventory === 0
            ? null
            : itemInventory,
      });
    } else {
      console.log("nope");
    }

    setItemName("");
    setItemPrice(NaN);
    setItemInventory(NaN);
  };

  return (
    <div className="flex justify-center">
      <div className="flex h-[calc(100vh-66px)] w-full flex-col gap-4 p-8 sm:w-3/4 sm:p-10">
        <div className="flex flex-col">
          <p className="text-lg font-semibold sm:text-xl">Items</p>
          <div className="divider my-2"></div>
        </div>
        {role === Role.ADMIN && (
          <button
            className="btn btn-circle btn-primary fixed bottom-7 right-7 h-16 w-16 shadow-md"
            onClick={() => {
              const modalElement = (document.getElementById(
                "add_item_modal",
              ) as HTMLDialogElement)!;

              const itemNameElement = (document.getElementById(
                "item-name-input",
              ) as HTMLInputElement)!;

              modalElement.showModal();
              itemNameElement.focus({ preventScroll: false });
            }}
          >
            <FaPlus size={32} color={"#4c4528"} />
          </button>
        )}

        {items?.map((item) => (
          <div key={item.item_uid} className="mt-5">
            <p
            // note={note}
            // onDelete={() => void deleteNote.mutate({ id: note.id })}
            >
              {`${item.name} ${item.price.toString()} ${
                item.inventory?.toString() ?? ""
              }`}
            </p>
          </div>
        ))}

        <dialog
          id="add_item_modal"
          className="modal modal-bottom sm:modal-middle"
        >
          <div className="modal-box p-5">
            <div className="label">
              <span className="label-text">Name</span>
            </div>
            <input
              id="item-name-input"
              type="text"
              value={itemName}
              className="input input-bordered input-md w-full"
              onChange={(e) => setItemName(e.currentTarget.value)}
            />
            <div className="mt-2 flex gap-4">
              <div className="w-full">
                <div className="label">
                  <span className="label-text">Price Per Piece</span>
                </div>
                <input
                  id="item-price-input"
                  type="number"
                  value={itemPrice}
                  className="input input-bordered input-md w-full"
                  onChange={(e) => setItemPrice(Number(e.currentTarget.value))}
                />
              </div>
              <div className="w-full">
                <div className="label">
                  <span className="label-text">Inventory</span>
                </div>
                <input
                  id="item-inventory-input"
                  type="number"
                  value={itemInventory}
                  className="input input-bordered input-md w-full"
                  onChange={(e) =>
                    setItemInventory(Number(e.currentTarget.value))
                  }
                />
              </div>
            </div>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button
                  className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                  onClick={addItem}
                >
                  add
                </button>
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
