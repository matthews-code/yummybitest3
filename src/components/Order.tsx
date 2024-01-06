import { useRef, useState } from "react";
import { api } from "~/utils/api";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { Delivery_mode, Payment_mode, Role } from "@prisma/client";
import { FaPlus } from "react-icons/fa6";
import { useSession } from "next-auth/react";
import { MdDelete, MdEdit } from "react-icons/md";
import { GiCardboardBox } from "react-icons/gi";

dayjs.extend(utc);
dayjs.extend(tz);

interface itemOrder {
  itemUid: string;
  itemName: string;
  itemPrice: string;
  quantity: number;
}

const Order = () => {
  const role = useSession().data?.user.role;

  const utils = api.useUtils();

  const invalidDateText = useRef<HTMLParagraphElement>(null);
  const userSearchInput = useRef<HTMLInputElement>(null);
  const costumerSearchDiv = useRef<HTMLDivElement>(null);
  const itemQuantityInput = useRef<HTMLInputElement>(null);

  const [addOrderStep, setAddOrderStep] = useState(1);

  const [costumerUid, setCostumerUid] = useState<string>("");
  const [costumerSearch, setCostumerSearch] = useState<string>("");
  const [selectedCostumer, setSelectedCostumer] = useState<string>();

  const [currDate, setCurrDate] = useState(dayjs().toDate());
  const [addDate, setAddDate] = useState<string>();

  const [itemUid, setItemUid] = useState<string>("");
  const [itemPrice, setItemPrice] = useState<string>("");
  const [itemQuantity, setItemQuantity] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");

  const [paymentMode, setPaymentMode] = useState<string>(Payment_mode.Cash);
  const [deliveryMode, setDeliveryMode] = useState<string>(
    Delivery_mode.Pickup,
  );

  const [addNotes, setAddNotes] = useState<string>("");

  const [itemOrders, setItemOrders] = useState<itemOrder[]>([]);

  const { data: orders, refetch: refetchOrders } =
    api.order.getAllOrders.useQuery({ date: currDate });

  // const orders = utils.order.getAllOrders.getData();

  const { data: users, refetch: refetchUsers } =
    api.user.getAllUsers.useQuery();

  const { data: items, refetch: refetchItems } =
    api.item.getAllItems.useQuery();

  const addOrderEndpoint = api.order.createOrder.useMutation({
    onSuccess: () => {
      void refetchOrders();
    },
  });

  const togglePaid = api.order.togglePaid.useMutation({
    async onMutate(updatedOrder) {
      await utils.order.getAllOrders.cancel();

      const previousOrders = utils.order.getAllOrders.getData();

      utils.order.getAllOrders.setData(
        { date: dayjs(currDate).toDate() },
        (old) =>
          old?.map((order) =>
            order.order_uid === updatedOrder.order_uid
              ? { ...order, paid: updatedOrder.paid }
              : order,
          ),
      );

      return { previousOrders };
    },

    onError: (err, updatedOrder, context) => {
      utils.order.getAllOrders.setData(
        { date: dayjs(currDate).toDate() },
        context?.previousOrders,
      );
    },

    onSettled: async () => {
      await utils.order.getAllOrders.invalidate();
    },
  });

  const clearStates = () => {
    setAddDate(undefined);
    setSelectedCostumer(undefined);
    setItemOrders([]);
    setPaymentMode("Cash");
    setDeliveryMode("Pickup");
    setAddNotes("");
    setCostumerSearch("");
    setCostumerUid("");
    setItemUid("");
  };

  const errorRouter = () => {
    if (addOrderStep === 1) {
      checkErrorDate();
    }

    if (addOrderStep === 2) {
      checkErrorCostumer();
    }

    if (addOrderStep === 3) {
      checkItemOrders();
    }

    if (addOrderStep === 4) {
      addOrder();
    }
  };

  const checkErrorDate = () => {
    if (addDate !== undefined) {
      setAddOrderStep(addOrderStep + 1);
    } else {
      invalidDateText.current?.classList.remove("hidden");
    }
  };

  const checkErrorCostumer = () => {
    if (selectedCostumer !== undefined) {
      setAddOrderStep(addOrderStep + 1);
    }
  };

  const checkItemOrders = () => {
    if (itemOrders.length > 0) {
      setAddOrderStep(addOrderStep + 1);
    }
  };

  const checkAddItem = () => {
    if (selectedItem === "") {
      return;
    }

    if (itemOrders.some((itemOrder) => itemOrder.itemName === selectedItem)) {
      return;
    }

    if (itemQuantity === "" || !/^\d*$/.test(itemQuantity)) {
      itemQuantityInput.current?.classList.add("input-error");
      return;
    }

    setItemOrders([
      ...itemOrders,
      {
        itemUid: itemUid,
        itemName: selectedItem,
        itemPrice: itemPrice,
        quantity: Number(itemQuantity),
      },
    ]);
  };

  const modalBehaviour = () => {
    const modalElement = document.getElementById(
      "add_order_modal",
    ) as HTMLDialogElement;

    modalElement.close();
  };

  const addOrder = () => {
    addOrderEndpoint.mutate({
      date: addDate ? addDate : "",
      amount_due: itemOrders.reduce(
        (sum, itemOrder) =>
          sum + Number(itemOrder.itemPrice) * itemOrder.quantity,
        0,
      ),
      payment_mode: paymentMode as "Gcash" | "BPI" | "Cash",
      delivery_mode: deliveryMode as "Delivery" | "Pickup",
      note: addNotes,
      user_uid: costumerUid,
      item_order: itemOrders.map((itemOrder) => {
        return { item_uid: itemOrder.itemUid, quantity: itemOrder.quantity };
      }),
    });
    modalBehaviour();
  };

  const handleCheckboxClick = (orderId: string, paid: boolean) => {
    togglePaid.mutate({
      order_uid: orderId,
      paid: paid,
    });
  };

  return (
    <div className="flex justify-center">
      <div className="h-[calc(100vh-66px)] w-full max-w-5xl p-3 sm:w-4/5 sm:p-8 xl:w-3/4">
        {orders ? (
          <>
            <MobileDatePicker
              className="self-center"
              // closeOnSelect={true}
              sx={{
                width: "100%",
                ".MuiInputBase-input": {
                  letterSpacing: 0.5,
                  textAlign: "center",
                  // fontFamily: "Segoe ui",
                },
                ".MuiInputBase-root": {
                  borderRadius: 2,
                  height: 48,
                  background: "white",
                },
              }}
              // disableOpenPicker={true}
              value={dayjs(currDate)}
              onAccept={(value: Dayjs | null) => {
                setCurrDate(value!.toDate());
              }}
            />
            {orders.length < 1 && (
              <div className="mt-28">
                <div className="mx-auto my-4 w-fit rounded-full bg-[#fcf6b1] p-6">
                  <GiCardboardBox color={"#f4e976"} size={"8rem"} />
                </div>
                <p className="text-center text-base font-light text-[#a3a3a3]">
                  No orders found
                </p>
              </div>
            )}
            <div className="mt-3 flex flex-col gap-3 pb-28">
              {orders?.map((order) => (
                <div
                  key={order.order_uid}
                  className="collapse z-0 bg-white shadow-md"
                >
                  <input type="checkbox" />
                  <div className="collapse-title p-4">
                    <div className="flex justify-between">
                      <div>
                        <h1 className="text-lg font-medium">
                          {
                            users?.find((user) => {
                              return order.user_uid === user.user_uid;
                            })?.first_name
                          }{" "}
                          {
                            users?.find((user) => {
                              return order.user_uid === user.user_uid;
                            })?.last_name
                          }
                        </h1>
                        <p className="text-sm text-[#707070]">
                          {/* {
                        users?.find((user) => {
                          return order.user_uid === user.user_uid;
                        })?.contact_num
                      }{" "}
                      •  */}
                          {order.delivery_mode} at{" "}
                          {dayjs
                            .utc(order.date)
                            .tz("Asia/Manila")
                            .format("h:mm A")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium">
                          {`₱${order.amount_due.toString()}`}
                        </p>
                        <p className="text-sm text-[#707070]">
                          {order.payment_mode} •{" "}
                          {order.paid ? "Paid" : "Unpaid"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="collapse-content bg-white">
                    <div className="divider my-[-0.5rem]"></div>
                    <div className="mt-4 flex flex-col gap-1">
                      {order.item_order.map((itemOrder) => (
                        <div
                          key={itemOrder.item_uid}
                          className="flex justify-between"
                        >
                          <p className="text-sm">
                            {
                              items?.find((item) => {
                                return itemOrder.item_uid === item.item_uid;
                              })?.name
                            }
                          </p>
                          <p className="text-sm text-[#707070]">
                            {`${itemOrder.quantity}`}{" "}
                            {itemOrder.quantity > 1 ? "pcs." : "pc."}
                          </p>
                        </div>
                      ))}
                    </div>
                    {order.note && (
                      <>
                        <div className="divider my-2"></div>
                        <p className="text-sm text-[#707070]">{order.note}</p>
                      </>
                    )}
                    <div className="mt-6 flex justify-between">
                      <div className="flex gap-2">
                        <p className="self-center text-xs italic">
                          Mark as {order.paid ? "unpaid" : "paid"}
                        </p>
                        <input
                          type="checkbox"
                          className="checkbox-success checkbox checkbox-sm self-center border-black [--chkfg:white]"
                          onClick={() =>
                            handleCheckboxClick(order.order_uid, order.paid)
                          }
                          defaultChecked={order.paid}
                          // checked={order.paid}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <MdEdit color={"#6f7687"} size={"1.1rem"} />
                        <MdDelete color={"#6f7687"} size={"1.1rem"} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-6 text-center">
            <span className="loading loading-ring loading-lg"></span>
          </div>
        )}

        <dialog
          id="add_order_modal"
          className="modal modal-top sm:modal-middle"
        >
          <div className="modal-box p-5">
            <h1 className="text-lg font-bold">Add Order</h1>
            <div className="divider m-0 p-0"></div>
            {addOrderStep === 1 && (
              <>
                <div className="label">
                  <span className="label-text">
                    Date{" "}
                    <i ref={invalidDateText} className="hidden text-red-600">
                      (invalid date)
                    </i>
                  </span>
                </div>
                <DateTimeField
                  className="w-full"
                  value={addDate === undefined ? null : dayjs(addDate)}
                  clearable={true}
                  disablePast={true}
                  slotProps={{
                    textField: {
                      error: false,
                    },
                  }}
                  sx={{
                    width: "100%",
                    ".MuiInputBase-input": {
                      letterSpacing: 0.5,
                      fontSize: 15,
                      // fontFamily: "Segoe ui",
                    },
                    ".MuiInputBase-root": {
                      borderRadius: 2,
                      height: 48,
                      background: "white",
                    },
                  }}
                  onChange={(value: Dayjs | null) => {
                    if (value) {
                      value?.isValid()
                        ? setAddDate(value.toDate().toISOString())
                        : null;
                    } else {
                      setAddDate(undefined);
                    }
                    invalidDateText.current?.classList.add("hidden");
                  }}
                />
              </>
            )}
            {addOrderStep === 2 && (
              <>
                <div className="label">
                  <span className="label-text">Customer</span>
                </div>
                <input
                  type="text"
                  ref={userSearchInput}
                  placeholder="Search using name or contact number"
                  value={costumerSearch}
                  className="z-1 input input-bordered input-md w-full"
                  onChange={(e) => {
                    setCostumerSearch(e.currentTarget.value);
                    costumerSearchDiv.current?.classList.remove("hidden");
                  }}
                />
                <div
                  ref={costumerSearchDiv}
                  className="hidden max-h-36 overflow-y-auto rounded-b-lg border border-t-0 border-gray-300"
                >
                  {costumerSearch !== "" &&
                    users
                      ?.filter((user) => {
                        if (
                          user.first_name
                            .toLowerCase()
                            .startsWith(costumerSearch.toLowerCase())
                        ) {
                          return true;
                        }
                        if (
                          user.last_name
                            ?.toLowerCase()
                            .startsWith(costumerSearch.toLowerCase())
                        ) {
                          return true;
                        }
                        if (
                          `${user.first_name.toLowerCase()} ${user.last_name?.toLowerCase()}`.startsWith(
                            costumerSearch.toLowerCase(),
                          )
                        ) {
                          return true;
                        }
                        if (user.contact_num.startsWith(costumerSearch)) {
                          return true;
                        }

                        return false;
                      })
                      .map((user) => {
                        return (
                          <div
                            key={user.user_uid}
                            className="flex justify-between px-4 py-2 focus:bg-slate-50"
                            onClick={() => {
                              setCostumerUid(user.user_uid);
                              setSelectedCostumer(user.contact_num);
                              setCostumerSearch(
                                `${user.first_name} ${user.last_name}`,
                              );
                              costumerSearchDiv.current?.classList.add(
                                "hidden",
                              );
                            }}
                          >
                            <p className="text-sm">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm">{user.contact_num}</p>
                          </div>
                        );
                      })}
                </div>
              </>
            )}
            {addOrderStep === 3 && (
              <>
                <div className="flex gap-4">
                  <div className="w-full">
                    <div className="label">
                      <span className="label-text">Order</span>
                    </div>
                    <select
                      defaultValue={"item"}
                      className="select select-bordered w-full"
                      onChange={(e) => {
                        setSelectedItem(e.currentTarget.value);
                        const item = items?.find((item) => {
                          return item.name === e.currentTarget.value;
                        });

                        setItemPrice(item ? item.price.toString() : "");
                        setItemUid(item ? item.item_uid : "");
                      }}
                    >
                      <option disabled value={"item"}>
                        Item
                      </option>
                      {items?.map((item) => (
                        <option key={item.item_uid} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full">
                    <div className="label">
                      <span className="label-text">Quantity</span>
                    </div>
                    <input
                      ref={itemQuantityInput}
                      type="text"
                      placeholder="50"
                      className="input input-bordered input-md w-full"
                      onChange={(e) => {
                        setItemQuantity(e.currentTarget.value);
                        if (!/^\d*$/.test(e.currentTarget.value)) {
                          itemQuantityInput.current?.classList.add(
                            "input-error",
                          );
                        } else {
                          itemQuantityInput.current?.classList.remove(
                            "input-error",
                          );
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <button
                    className="btn btn-sm w-full border-none bg-yellow-200"
                    onClick={checkAddItem}
                  >
                    add item
                  </button>
                </div>
                {itemOrders.length > 0 && (
                  <>
                    <div className="divider my-3"></div>
                    <div className="mt-3 flex flex-col gap-2">
                      {itemOrders.map((itemOrder) => (
                        <div
                          key={itemOrder.itemName}
                          className="flex justify-between"
                        >
                          <p className="text-sm">
                            {itemOrder.itemName} • {itemOrder.quantity}{" "}
                            {itemOrder.quantity > 1 ? "pcs." : "pc."}
                          </p>
                          <div className="flex gap-4">
                            <p className="text-sm text-[#707070]">
                              {Number(itemOrder.itemPrice) * itemOrder.quantity}
                            </p>
                            <button
                              onClick={() => {
                                setItemOrders(
                                  itemOrders.filter((newItemOrder) => {
                                    return (
                                      newItemOrder.itemName !==
                                      itemOrder.itemName
                                    );
                                  }),
                                );
                              }}
                            >
                              <MdDelete color={"#6f7687"} size={"1.1rem"} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="divider my-[-0.4rem]"></div>
                      <div className="mt-[-0.1rem] flex justify-between">
                        <p className="text-base font-semibold">Total</p>
                        <p className="mr-8 text-base font-semibold">
                          ₱
                          {itemOrders.reduce(
                            (sum, itemOrder) =>
                              sum +
                              Number(itemOrder.itemPrice) * itemOrder.quantity,
                            0,
                          )}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
            {addOrderStep === 4 && (
              <>
                <div className="flex gap-4">
                  <div className="w-full">
                    <div className="label">
                      <span className="label-text">Payment mode</span>
                    </div>
                    <select
                      value={paymentMode}
                      className="select select-bordered w-full"
                      onChange={(e) => setPaymentMode(e.target.value)}
                    >
                      <option value={Payment_mode.Cash}>Cash</option>
                      <option value={Payment_mode.Gcash}>Gcash</option>
                      <option value={Payment_mode.BPI}>BPI</option>
                    </select>
                  </div>
                  <div className="w-full">
                    <div className="label">
                      <span className="label-text">Delivery mode</span>
                    </div>
                    <select
                      value={deliveryMode}
                      className="select select-bordered w-full"
                      onChange={(e) => setDeliveryMode(e.target.value)}
                    >
                      <option value={Delivery_mode.Pickup}>Pickup</option>
                      <option value={Delivery_mode.Delivery}>Delivery</option>
                    </select>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="label">
                    <span className="label-text">
                      Notes - <i className="text-sm">Optional</i>
                    </span>
                  </div>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    placeholder="Additional notes"
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                  ></textarea>
                </div>
              </>
            )}
            <div className="modal-action">
              <form
                method="dialog"
                className="flex w-full justify-between gap-2"
              >
                <button
                  className="btn border-none"
                  onClick={() => {
                    setAddOrderStep(1);
                    clearStates();
                  }}
                >
                  cancel
                </button>
                <div className="flex gap-2">
                  {addOrderStep > 1 && (
                    <div
                      tabIndex={0}
                      className="btn border-none"
                      onClick={() => {
                        setAddOrderStep(addOrderStep - 1);
                      }}
                    >
                      back
                    </div>
                  )}
                  <div
                    tabIndex={0}
                    className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                    onClick={errorRouter}
                  >
                    {addOrderStep === 4 ? "add" : "next"}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </dialog>

        {role === Role.ADMIN && (
          <button
            className="btn btn-circle btn-primary fixed bottom-6 right-6 h-16 w-16 shadow-lg"
            onClick={() => {
              const modalElement = (document.getElementById(
                "add_order_modal",
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

export default Order;
