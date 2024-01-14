import React from "react";
import dayjs from "dayjs";
import { api } from "~/utils/api";
import { GiCardboardBox } from "react-icons/gi";
import { IoArrowBack } from "react-icons/io5";

interface User {
  user_uid: string;
  first_name: string;
  last_name: string | null;
  contact_num: string;
  address: string | null;
  deleted: boolean;
}

interface HeaderProps {
  userUid: string;
  users: User[] | undefined;
  setIsViewingHistory: React.Dispatch<React.SetStateAction<boolean>>;
}

const OrderHistory: React.FC<HeaderProps> = (props) => {
  const { data: orders, refetch: refetchOrders } =
    api.order.getAlluserOrders.useQuery({
      uid: props.userUid === "" ? null : props.userUid,
    });

  const { data: items, refetch: refetchItems } =
    api.item.getAllItems.useQuery();

  return (
    <>
      <button className="btn" onClick={() => props.setIsViewingHistory(false)}>
        <IoArrowBack size={20} />
      </button>
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
          <div className="mt-4 flex flex-col gap-3 pb-28">
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
                          props.users?.find((user) => {
                            return order.user_uid === user.user_uid;
                          })?.first_name
                        }{" "}
                        {
                          props.users?.find((user) => {
                            return order.user_uid === user.user_uid;
                          })?.last_name
                        }
                      </h1>
                      <p className="text-sm text-[#707070]">
                        {order.delivery_mode} at{" "}
                        {dayjs
                          .utc(order.date)
                          .tz("Asia/Manila")
                          .format("MMM DD, YYYY h:mm A")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium">
                        {`₱${Number(order.amount_due).toFixed(2)}`}
                      </p>
                      <p className="text-sm text-[#707070]">
                        {order.payment_mode} • {order.paid ? "Paid" : "Unpaid"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="collapse-content bg-white">
                  <div className="divider mb-[-0.5rem] mt-[-0.8rem]"></div>
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
                          {`${Number(itemOrder.quantity)}`} x{" "}
                          {`${Number(itemOrder.multiplier)}`}
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
    </>
  );
};

export default OrderHistory;
