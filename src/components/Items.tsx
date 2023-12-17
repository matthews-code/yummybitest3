import React from "react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

const Items = () => {
  const role = useSession().data?.user.role;
  const { data: items, refetch: refetchItems } =
    api.item.getAllItems.useQuery();

  const createItem = api.item.createItem.useMutation({
    onSuccess: () => {
      void refetchItems();
    },
  });

  // const sampleEndpoint = api.item.sample.useQuery({ text: "hello" });

  // console.log(sampleEndpoint.error);
  // console.log(sampleEndpoint.failureReason);

  // if (sampleEndpoint.failureReason) {
  //   return <h1>unauthorized</h1>;
  // }

  return (
    <div className="dark-border flex justify-center">
      <div className="flex h-[calc(100vh-66px)] w-4/5 flex-col gap-4 p-12">
        {/* {role === Role.ADMIN && (
          <button
            className="btn"
            onClick={() =>
              (document.getElementById(
                "add_item_modal",
              ) as HTMLFormElement)!.showModal()
            }
          >
            Add Item
          </button>
        )} */}

        {/* {items?.map((item) => (
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
          <div className="modal-box">
            <input
              type="text"
              placeholder="New Item"
              className="input input-bordered input-sm w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createItem.mutate({
                    name: e.currentTarget.value,
                    price: 100,
                    inventory: 1,
                  });
                  e.currentTarget.value = "";
                }
              }}
            />

            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button
                  className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                  onClick={() => null}
                >
                  add
                </button>
                <button className="btn border-none">cancel</button>
              </form>
            </div>
          </div>
        </dialog> */}
      </div>
    </div>
  );
};

export default Items;
