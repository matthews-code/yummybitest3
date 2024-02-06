import { useRef, useState, useEffect } from "react";
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
import { FaChevronLeft } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import { Decimal } from "@prisma/client/runtime/library";

dayjs.extend(utc);
dayjs.extend(tz);

interface itemOrder {
  itemUid: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
  multiplier: number;
}

interface order {
  item_order: {
    order_uid: string;
    item_uid: string;
    quantity: Decimal;
    multiplier: Decimal;
  }[];
  order_uid: string;
  date: Date;
  amount_due: Decimal;
  note: string | null;
  user_uid: string;
  payment_mode: Payment_mode;
  delivery_mode: Delivery_mode;
  paid: boolean;
  deleted: boolean;
}

const Order = () => {
  const role = useSession().data?.user.role;

  const utils = api.useUtils();

  const invalidDateText = useRef<HTMLParagraphElement>(null);
  const userSearchInput = useRef<HTMLInputElement>(null);
  const customerSearchDiv = useRef<HTMLDivElement>(null);
  const itemQuantityInput = useRef<HTMLInputElement>(null);
  const itemMultiplierInput = useRef<HTMLInputElement>(null);

  const duplicateNumberText = useRef<HTMLParagraphElement>(null);

  const userFirstNameInput = useRef<HTMLInputElement>(null);
  const userLastNameInput = useRef<HTMLInputElement>(null);
  const userContactNumInput = useRef<HTMLInputElement>(null);
  const userAddressInput = useRef<HTMLInputElement>(null);

  const [orderUid, setOrderUid] = useState("");
  const [isAddingOrder, setIsAddingOrder] = useState(true);

  const [addOrderStep, setAddOrderStep] = useState(1);

  const [customerUid, setCustomerUid] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>();

  const [currDate, setCurrDate] = useState(dayjs().startOf("d").toISOString());
  const [addDate, setAddDate] = useState<string>(dayjs().toISOString());

  const [itemUid, setItemUid] = useState<string>("");
  const [itemPrice, setItemPrice] = useState<string>("");
  const [itemQuantity, setItemQuantity] = useState<string>("");
  const [itemMultiplier, setItemMultiplier] = useState<string>("1");
  const [selectedItem, setSelectedItem] = useState<string>("");

  const [paymentMode, setPaymentMode] = useState<string>(Payment_mode.Cash);
  const [deliveryMode, setDeliveryMode] = useState<string>(
    Delivery_mode.Pickup,
  );

  const [userUid, setUserUid] = useState<string>("");
  const [userFirstName, setUserFirstName] = useState<string>("");
  const [userLastName, setUserLastName] = useState<string>("");
  const [userContactNum, setUserContactNum] = useState<string>("");
  const [userAddress, setUserAddress] = useState<string>("");

  const [addNotes, setAddNotes] = useState<string>("");

  const [itemOrders, setItemOrders] = useState<itemOrder[]>([]);

  const { data: orders, refetch: refetchOrders } =
    api.order.getAllOrders.useQuery({ date: currDate });

  const { data: users, refetch: refetchUsers } =
    api.user.getAllUsers.useQuery();

  const { data: items, refetch: refetchItems } =
    api.item.getAllItems.useQuery();

  const addOrderEndpoint = api.order.createOrder.useMutation({
    onSuccess: () => {
      void refetchOrders();
    },
  });

  const editOrderEndpoint = api.order.editOrder.useMutation({
    onSuccess: () => {
      void refetchOrders();
    },
  });

  const deleteOrderEndpoint = api.order.deleteOrder.useMutation({
    onSuccess: () => {
      void refetchOrders();
    },
  });

  const togglePaid = api.order.togglePaid.useMutation({
    async onMutate(updatedOrder) {
      await utils.order.getAllOrders.cancel();

      const previousOrders = utils.order.getAllOrders.getData();

      utils.order.getAllOrders.setData(
        { date: dayjs(currDate).toISOString() },
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
        { date: dayjs(currDate).toISOString() },
        context?.previousOrders,
      );
    },

    onSettled: async () => {
      await utils.order.getAllOrders.invalidate();
    },
  });

  const toggleCollected = api.order.toggleCollected.useMutation({
    async onMutate(updatedOrder) {
      await utils.order.getAllOrders.cancel();

      const previousOrders = utils.order.getAllOrders.getData();

      utils.order.getAllOrders.setData(
        { date: dayjs(currDate).toISOString() },
        (old) =>
          old?.map((order) =>
            order.order_uid === updatedOrder.order_uid
              ? { ...order, collected: updatedOrder.collected }
              : order,
          ),
      );

      return { previousOrders };
    },

    onError: (err, updatedOrder, context) => {
      utils.order.getAllOrders.setData(
        { date: dayjs(currDate).toISOString() },
        context?.previousOrders,
      );
    },

    onSettled: async () => {
      await utils.order.getAllOrders.invalidate();
    },
  });

  const addUserEndpoint = api.user.createUser.useMutation({
    onSuccess: () => {
      void refetchUsers();
    },
  });

  const clearStates = () => {
    setAddDate(dayjs().toISOString());
    setSelectedCustomer(undefined);
    setItemOrders([]);
    setPaymentMode("Cash");
    setDeliveryMode("Pickup");
    setAddNotes("");
    setCustomerSearch("");
    setCustomerUid("");
    setItemUid("");
    setSelectedItem("");
    setOrderUid("");
    setItemQuantity("");
    setItemMultiplier("1");
  };

  const clearAddUserStates = () => {
    setUserFirstName("");
    setUserLastName("");
    setUserContactNum("");
    setUserAddress("");
    setUserUid("");
  };

  const setStates = (order: order) => {
    const user = users?.find((user) => {
      return user.user_uid === order.user_uid;
    });

    setOrderUid(order.order_uid);
    setAddDate(dayjs(order.date).toISOString());

    if (user) {
      setCustomerUid(user.user_uid);
      setSelectedCustomer(user.contact_num);
      // setCustomerSearch(`${user.first_name} ${user.last_name}`);
    }

    const itemOrders = order.item_order.map((itemorder) => {
      const item = items?.find((item) => {
        return itemorder.item_uid === item.item_uid;
      });

      return {
        itemUid: item?.item_uid,
        itemName: item?.name,
        itemPrice: Number(item?.price),
        quantity: Number(itemorder.quantity),
        multiplier: Number(itemorder.multiplier),
      } as itemOrder;
    });

    setItemOrders(itemOrders);
    setPaymentMode(order.payment_mode);
    setDeliveryMode(order.delivery_mode);

    if (order.note) {
      setAddNotes(order.note);
    }
  };

  const errorRouter = () => {
    if (addOrderStep === 1) {
      checkErrorDate();
    }

    if (addOrderStep === 2) {
      checkErrorCustomer();
    }

    if (addOrderStep === 3) {
      checkItemOrders();
    }

    if (addOrderStep === 4 && isAddingOrder) {
      setCurrDate(dayjs(addDate).startOf("d").toISOString());
      addOrder();
    }

    if (addOrderStep === 4 && !isAddingOrder) {
      setCurrDate(dayjs(addDate).startOf("d").toISOString());
      editOrder();
    }

    if (addOrderStep === 10) {
      addUser(userContactNum);
    }
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
      clearAddUserStates();
      setAddOrderStep(2);
    }
  };

  const checkErrorDate = () => {
    if (addDate !== "") {
      setAddOrderStep(addOrderStep + 1);
    } else {
      invalidDateText.current?.classList.remove("hidden");
    }
  };

  const checkErrorCustomer = () => {
    if (selectedCustomer !== undefined) {
      setAddOrderStep(addOrderStep + 1);
    } else {
      userSearchInput.current?.classList.add("input-error");
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

    if (itemQuantity === "") {
      itemQuantityInput.current?.classList.add("input-error");
      return;
    }

    if (itemMultiplier === "") {
      itemMultiplierInput.current?.classList.add("input-error");
      return;
    }

    setItemQuantity("");
    setItemMultiplier("1");

    setItemOrders([
      ...itemOrders,
      {
        itemUid: itemUid,
        itemName: selectedItem,
        itemPrice: Number(itemPrice),
        quantity: Number(itemQuantity),
        multiplier: Number(itemMultiplier),
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
          sum + itemOrder.itemPrice * itemOrder.quantity * itemOrder.multiplier,
        0,
      ),
      payment_mode: paymentMode as "Gcash" | "BPI" | "Cash",
      delivery_mode: deliveryMode as "Delivery" | "Pickup",
      note: addNotes,
      user_uid: customerUid,
      item_order: itemOrders.map((itemOrder) => {
        return {
          item_uid: itemOrder.itemUid,
          quantity: itemOrder.quantity,
          multiplier: itemOrder.multiplier,
        };
      }),
    });
    setAddOrderStep(1);
    clearStates();
    modalBehaviour();
  };

  const editOrder = () => {
    editOrderEndpoint.mutate({
      orderUid: orderUid,
      date: addDate ? addDate : "",
      amount_due: itemOrders.reduce(
        (sum, itemOrder) =>
          sum + itemOrder.itemPrice * itemOrder.quantity * itemOrder.multiplier,
        0,
      ),
      payment_mode: paymentMode as "Gcash" | "BPI" | "Cash",
      delivery_mode: deliveryMode as "Delivery" | "Pickup",
      note: addNotes,
      user_uid: customerUid,
      item_order: itemOrders.map((itemOrder) => {
        return {
          item_uid: itemOrder.itemUid,
          quantity: itemOrder.quantity,
          multiplier: itemOrder.multiplier,
        };
      }),
    });
    setAddOrderStep(1);
    clearStates();
    modalBehaviour();
  };

  const deleteOrder = () => {
    deleteOrderEndpoint.mutate({ uid: orderUid });
    clearStates();
  };

  const manipulateContactNumber = (orderUid: string) => {
    const user = users?.find((user) => orderUid === user.user_uid);

    return (
      "(+" +
      user?.contact_num.slice(0, 2) +
      ")" +
      " " +
      user?.contact_num.slice(2, 5) +
      " " +
      user?.contact_num.slice(5, 8) +
      " " +
      user?.contact_num.slice(8)
    );
  };

  const handlePaidClick = (orderId: string, paid: boolean) => {
    togglePaid.mutate({
      order_uid: orderId,
      paid: paid,
    });
  };

  const handleCollectedClick = (orderId: string, collected: boolean) => {
    toggleCollected.mutate({
      order_uid: orderId,
      collected: collected,
    });
  };

  const cleanContact = (number: string) => {
    const newNumber = number
      .replaceAll(" ", "")
      .replaceAll("+", "")
      .replaceAll("(", "")
      .replaceAll(")", "");

    return newNumber;
  };

  return (
    <div className="flex justify-center">
      <div className="h-[calc(100vh-66px)] w-full max-w-3xl p-3 sm:w-4/5 sm:p-8 xl:w-3/4">
        <div className="flex items-center gap-4 px-1 sm:px-0">
          <button
            className="btn btn-circle h-8 min-h-0 w-8 bg-[#eaecef] sm:h-12 sm:min-h-0 sm:w-12"
            onClick={() => {
              setCurrDate(dayjs(currDate).add(-1, "d").toISOString());
            }}
          >
            <FaChevronLeft className="h-3 sm:h-5" color={"#4c4528"} />
          </button>

          <MobileDatePicker
            className="self-center"
            closeOnSelect={true}
            slotProps={{
              actionBar: {
                sx: {
                  display: "none",
                },
              },
            }}
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
              const date = value!.startOf("d").toISOString();
              setCurrDate(date);
            }}
          />
          <button
            className="btn btn-circle h-8 min-h-0 w-8 bg-[#eaecef] sm:h-12 sm:min-h-0 sm:w-12"
            onClick={() => {
              setCurrDate(dayjs(currDate).add(1, "d").toISOString());
            }}
          >
            <FaChevronRight className="h-3 sm:h-5" color={"#4c4528"} />
          </button>
        </div>
        {orders ? (
          <>
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
                          {role === Role.USER
                            ? "*****"
                            : users?.find((user) => {
                                return order.user_uid === user.user_uid;
                              })?.last_name}
                        </h1>
                        <p className="text-sm text-[#707070]">
                          {order.delivery_mode} at{" "}
                          {dayjs
                            .utc(order.date)
                            .tz("Asia/Manila")
                            .format("h:mm A")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium">
                          {role === Role.USER
                            ? "₱***.**"
                            : `₱${Number(order.amount_due).toFixed(2)}`}{" "}
                          <span className="text-sm">{order.payment_mode}</span>
                        </p>
                        <p className="text-sm text-[#707070]">
                          {/* {order.payment_mode} •{" "} */}
                          {/* {order.collected ? "Collected" : "Uncollected"} •{" "} */}
                          {order.collected ? "Collected •" : ""}{" "}
                          {order.paid ? "Paid" : "Unpaid"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="collapse-content bg-white">
                    <div className="mb-[-0.5rem] mt-0">
                      <p className="inline text-sm italic text-blue-600 underline">
                        {role === Role.USER ? (
                          "(+63) *** *** ****"
                        ) : (
                          <a
                            href={`tel:${users?.find((user) => {
                              return order.user_uid === user.user_uid;
                            })?.contact_num}`}
                          >
                            {manipulateContactNumber(order.user_uid)}
                          </a>
                        )}
                      </p>
                      <p className="inline text-sm text-[#707070]">
                        {" "}
                        •{" "}
                        {role === Role.USER
                          ? "*****"
                          : users?.find((user) => {
                                return order.user_uid === user.user_uid;
                              })?.address
                            ? users?.find((user) => {
                                return order.user_uid === user.user_uid;
                              })?.address
                            : "No address"}
                      </p>
                    </div>
                    <div className="divider mb-[-0.5rem] mt-[0.8rem]"></div>
                    <div className="mt-3 flex flex-col gap-1">
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
                            {`${Number(itemOrder.multiplier)}`} x{" "}
                            {`${Number(itemOrder.quantity)}`}
                          </p>
                        </div>
                      ))}
                    </div>
                    {order.note && (
                      <>
                        <div className="divider my-1"></div>
                        <p className="text-sm text-[#707070]">{order.note}</p>
                      </>
                    )}
                    {role !== Role.USER && (
                      <div className="mt-5 flex justify-between">
                        <div className="flex gap-2">
                          <p className="self-center text-xs italic">
                            Mark as{" "}
                            {order.collected ? "uncollected" : "collected"}
                          </p>
                          <input
                            type="checkbox"
                            className="checkbox-success checkbox checkbox-sm self-center border-black [--chkfg:white]"
                            onClick={() =>
                              handleCollectedClick(
                                order.order_uid,
                                order.collected,
                              )
                            }
                            defaultChecked={order.collected}
                          />
                          {role === Role.SUPERADMIN && (
                            <>
                              <p className="self-center text-xs italic">
                                Mark as {order.paid ? "unpaid" : "paid"}
                              </p>
                              <input
                                type="checkbox"
                                className="checkbox-success checkbox checkbox-sm self-center border-black [--chkfg:white]"
                                onClick={() =>
                                  handlePaidClick(order.order_uid, order.paid)
                                }
                                defaultChecked={order.paid}
                              />
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setStates(order);
                              setIsAddingOrder(false);

                              const modalElement = (document.getElementById(
                                "add_order_modal",
                              ) as HTMLDialogElement)!;
                              modalElement.showModal();
                            }}
                          >
                            <MdEdit color={"#6f7687"} size={"1.2rem"} />
                          </button>
                          {role === Role.SUPERADMIN && (
                            <button
                              onClick={() => {
                                setOrderUid(order.order_uid);
                                const modalElement = (document.getElementById(
                                  "delete_order_modal",
                                ) as HTMLDialogElement)!;
                                modalElement.showModal();
                              }}
                            >
                              <MdDelete color={"#6f7687"} size={"1.2rem"} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-8 text-center">
            <span className="loading loading-ring loading-lg"></span>
          </div>
        )}

        <dialog
          id="add_order_modal"
          className="modal modal-top sm:modal-middle"
        >
          <div className="modal-box p-5">
            <h1 className="text-lg font-bold">
              {isAddingOrder ? "Add Order" : "Edit Order"}{" "}
              {addOrderStep === 10 ? "| Add User" : ""}
            </h1>
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
                  value={dayjs(addDate)}
                  clearable={false}
                  slotProps={{
                    textField: {
                      error: false,
                    },
                  }}
                  sx={{
                    width: "100%",
                    ".MuiInputBase-input": {
                      letterSpacing: 0.5,
                      fontSize: 16,
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
                        : setAddDate("");
                    } else {
                      setAddDate("");
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
                  <span className="label-text-alt text-xs">
                    Selected:{" "}
                    <span className="italic">
                      {users?.find((user) => {
                        return user.contact_num === selectedCustomer;
                      })
                        ? users?.find((user) => {
                            return user.contact_num === selectedCustomer;
                          })?.first_name +
                          " " +
                          users?.find((user) => {
                            return user.contact_num === selectedCustomer;
                          })?.last_name
                        : "None"}
                    </span>
                  </span>
                </div>
                <input
                  type="text"
                  ref={userSearchInput}
                  placeholder="Search using name or contact number"
                  value={customerSearch}
                  className="z-1 input input-bordered input-md w-full"
                  onChange={(e) => {
                    userSearchInput.current?.classList.remove("input-error");
                    setCustomerSearch(e.currentTarget.value);
                    customerSearchDiv.current?.classList.remove("hidden");
                  }}
                />
                <div
                  ref={customerSearchDiv}
                  className="hidden max-h-36 overflow-y-auto rounded-b-lg border border-t-0 border-gray-300"
                >
                  {customerSearch !== "" &&
                    users
                      ?.filter((user) => {
                        if (
                          user.first_name
                            .toLowerCase()
                            .startsWith(customerSearch.toLowerCase())
                        ) {
                          return true;
                        }
                        if (
                          user.last_name
                            ?.toLowerCase()
                            .startsWith(customerSearch.toLowerCase())
                        ) {
                          return true;
                        }
                        if (
                          `${user.first_name.toLowerCase()} ${user.last_name?.toLowerCase()}`.startsWith(
                            customerSearch.toLowerCase(),
                          )
                        ) {
                          return true;
                        }
                        if (user.contact_num.includes(customerSearch)) {
                          return true;
                        }

                        const numWithZero = "0" + user.contact_num.slice(2);

                        if (numWithZero.includes(customerSearch)) {
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
                      .map((user) => {
                        return (
                          <div
                            key={user.user_uid}
                            className="flex justify-between px-4 py-3 hover:bg-slate-100"
                            onClick={() => {
                              setCustomerUid(user.user_uid);
                              setSelectedCustomer(user.contact_num);
                              setCustomerSearch(
                                `${user.first_name} ${user.last_name}`,
                              );
                              customerSearchDiv.current?.classList.add(
                                "hidden",
                              );
                            }}
                          >
                            <p className="text-sm">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm">
                              {"(+" +
                                user.contact_num.slice(0, 2) +
                                ")" +
                                " " +
                                user.contact_num.slice(2, 5) +
                                " " +
                                user.contact_num.slice(5, 8) +
                                " " +
                                user.contact_num.slice(8)}
                            </p>
                          </div>
                        );
                      })}
                </div>
              </>
            )}
            {addOrderStep === 3 && (
              <>
                <div>
                  <div className="label">
                    <span className="label-text">Order</span>
                  </div>
                  <select
                    defaultValue={"item"}
                    className="select select-bordered w-full"
                    onChange={(e) => {
                      // itemQuantityInput.current?.focus();
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
                    {items
                      ?.filter((item) => {
                        if (!item.deleted) {
                          return true;
                        }
                        return false;
                      })
                      .map((item) => (
                        <option key={item.item_uid} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="mt-2 flex gap-4">
                  <div className="w-full">
                    <div className="label">
                      <span className="label-text">Multiplier</span>
                    </div>
                    <input
                      ref={itemMultiplierInput}
                      type="text"
                      value={itemMultiplier}
                      className="input input-bordered input-md w-full"
                      onChange={(e) => {
                        if (!/^\d*$/.test(e.currentTarget.value)) {
                          itemMultiplierInput.current?.classList.add(
                            "input-error",
                          );
                        } else {
                          setItemMultiplier(e.currentTarget.value);
                          itemMultiplierInput.current?.classList.remove(
                            "input-error",
                          );
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center pt-8">x</div>
                  <div className="w-full">
                    <div className="label">
                      <span className="label-text">Quantity</span>
                    </div>
                    <input
                      ref={itemQuantityInput}
                      type="text"
                      placeholder="12"
                      value={itemQuantity}
                      className="input input-bordered input-md w-full"
                      onChange={(e) => {
                        if (!/^\d*$/.test(e.currentTarget.value)) {
                          itemQuantityInput.current?.classList.add(
                            "input-error",
                          );
                        } else {
                          setItemQuantity(e.currentTarget.value);
                          itemQuantityInput.current?.classList.remove(
                            "input-error",
                          );
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      className="btn btn-sm h-12 w-full rounded-3xl border-none bg-yellow-200"
                      onClick={checkAddItem}
                    >
                      <FaPlus size={25} color={"#4c4528"} />
                    </button>
                  </div>
                </div>
                {itemOrders.length > 0 && (
                  <>
                    {/* <div className="divider my-3"></div> */}
                    <div className="mt-6 flex flex-col gap-2">
                      {itemOrders.map((itemOrder) => (
                        <div
                          key={itemOrder.itemName}
                          className="flex justify-between"
                        >
                          <p className="text-sm">
                            {itemOrder.itemName} • {itemOrder.multiplier} x{" "}
                            {itemOrder.quantity}
                          </p>
                          <div className="flex gap-4">
                            <p className="text-sm text-[#707070]">
                              {(
                                itemOrder.itemPrice *
                                itemOrder.quantity *
                                itemOrder.multiplier
                              ).toFixed(2)}
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
                              <MdDelete color={"#6f7687"} size={"1.2rem"} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="divider my-[-0.3rem]"></div>
                      <div className="mt-[-0.3rem] flex justify-between">
                        <p className="text-base font-semibold">Total</p>
                        <p className="mr-9 text-base font-semibold">
                          ₱
                          {itemOrders
                            .reduce(
                              (sum, itemOrder) =>
                                sum +
                                itemOrder.itemPrice *
                                  itemOrder.quantity *
                                  itemOrder.multiplier,
                              0,
                            )
                            .toFixed(2)}
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
            {addOrderStep === 10 && (
              <>
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
                        userFirstNameInput.current?.classList.remove(
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
                      <i
                        ref={duplicateNumberText}
                        className="hidden text-red-600"
                      >
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
                        userContactNumInput.current?.classList.add(
                          "input-error",
                        );
                        return;
                      }

                      // const formattedContact = cleanContact(
                      //   e.currentTarget.value,
                      // );

                      setUserContactNum(e.currentTarget.value);
                      userContactNumInput.current?.classList.remove(
                        "input-error",
                      );
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
                    invalidDateText.current?.classList.add("hidden");
                    setAddOrderStep(1);
                    clearStates();
                  }}
                >
                  cancel
                </button>
                <div className="flex gap-2">
                  {addOrderStep === 2 && (
                    <div
                      tabIndex={0}
                      className="btn border-none"
                      onClick={() => {
                        setAddOrderStep(10);
                      }}
                    >
                      add new
                    </div>
                  )}
                  {addOrderStep > 1 && (
                    <div
                      tabIndex={0}
                      className="btn border-none"
                      onClick={() => {
                        if (addOrderStep === 10) {
                          clearAddUserStates();
                          setAddOrderStep(2);
                        } else {
                          setAddOrderStep(addOrderStep - 1);
                        }
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
                    {addOrderStep === 4
                      ? isAddingOrder
                        ? "add"
                        : "save"
                      : "next"}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </dialog>

        <dialog
          id="delete_order_modal"
          className="modal modal-top sm:modal-middle"
        >
          <div className="modal-box p-5">
            <h1 className="text-lg font-bold">Delete Order</h1>
            <div className="divider m-0 p-0"></div>
            <p>Are you sure you want to delete this order?</p>
            <div className="modal-action">
              <form method="dialog" className="flex gap-2">
                <button className="btn border-none" onClick={clearStates}>
                  cancel
                </button>
                <button
                  className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                  onClick={deleteOrder}
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
              setIsAddingOrder(true);
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
