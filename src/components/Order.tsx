import { useState } from "react";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import dayjs, { Dayjs } from "dayjs";
import { Role } from "@prisma/client";
import { FaPlus } from "react-icons/fa6";
import { useSession } from "next-auth/react";
import { MdDelete, MdEdit } from "react-icons/md";

// const enum sample {
//   DATE = 1,
//   COSTUMER = "costumer",
//   ORDER = "order",
// }

const Order = () => {
  const role = useSession().data?.user.role;

  const [date, setDate] = useState(Date());
  const [addOrderStep, setAddOrderStep] = useState(1);

  return (
    <div className="flex justify-center">
      <div className="h-[calc(100vh-66px)] w-full max-w-5xl p-3 sm:w-4/5 sm:p-8 xl:w-3/4">
        <MobileDatePicker
          className="self-center"
          closeOnSelect={true}
          sx={{
            width: "100%",
            ".MuiInputBase-input": {
              letterSpacing: 0.5,
              textAlign: "center",
              fontFamily: "Segoe ui",
            },
            ".MuiInputBase-root": {
              borderRadius: 2,
              height: 48,
              background: "white",
            },
          }}
          value={dayjs(date)}
          onChange={(value: Dayjs | null) => {
            console.log(value?.toDate());
          }}
        />

        <div className="mt-4 flex flex-col gap-3">
          <div className="collapse z-0 bg-white shadow-md">
            <input type="checkbox" />
            <div className="collapse-title p-4">
              <div className="flex justify-between">
                <div>
                  <h1 className="text-lg font-medium">Jose Dela Cruz</h1>
                  <p className="text-sm text-[#707070]">09177951792</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium">₱1200 Unpaid</p>
                  <p className="text-sm text-[#707070]">Gcash - Delivery</p>
                </div>
              </div>
            </div>
            <div className="collapse-content bg-white">
              <div className="divider my-[-0.5rem]"></div>
              <div className="mt-4 flex flex-col gap-1">
                <div className="flex justify-between">
                  <p className="text-sm">Chocolate Cheesecake</p>
                  <p className="text-sm text-[#707070]">1 pc.</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm">Pork Empanada</p>
                  <p className="text-sm text-[#707070]">12 pcs.</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm">Tuna Empanada</p>
                  <p className="text-sm text-[#707070]">12 pcs.</p>
                </div>
              </div>
              <div className="divider  my-2"></div>
              <p className="text-sm text-[#707070]">
                Please give it to the next door neighbor's helper, Anna. Address
                is 514 Camachile street.
              </p>
            </div>
          </div>
        </div>

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
                  <span className="label-text">Date</span>
                </div>
                <DateTimeField
                  className="w-full"
                  clearable={true}
                  disablePast={true}
                  sx={{
                    width: "100%",
                    ".MuiInputBase-input": {
                      letterSpacing: 0.5,
                      fontFamily: "Segoe ui",
                      fontSize: 15,
                    },
                    ".MuiInputBase-root": {
                      borderRadius: 2,
                      height: 48,
                      background: "white",
                    },
                  }}
                />
              </>
            )}
            {addOrderStep === 2 && (
              <>
                <div className="label">
                  <span className="label-text">Costumer</span>
                </div>
                <input
                  type="text"
                  placeholder="Search using name or contact number"
                  className="input input-bordered input-md w-full"
                />
              </>
            )}
            {addOrderStep === 3 && (
              <>
                <div className="label">
                  <span className="label-text">Order</span>
                </div>
                <select className="select select-bordered w-full ">
                  <option disabled selected>
                    Item
                  </option>
                  <option>Empanada</option>
                  <option>Kutsinta</option>
                </select>
              </>
            )}
            <div className="modal-action">
              <form
                method="dialog"
                className="flex w-full justify-between gap-2"
              >
                <button
                  className="btn border-none"
                  onClick={() => setAddOrderStep(1)}
                >
                  cancel
                </button>
                <div className="flex gap-2">
                  {addOrderStep > 1 && (
                    <div
                      tabIndex={0}
                      className="btn border-none"
                      onClick={() => setAddOrderStep(addOrderStep - 1)}
                    >
                      back
                    </div>
                  )}
                  <div
                    tabIndex={0}
                    className="btn border-none bg-yellow-200 hover:bg-yellow-300"
                    onClick={() => setAddOrderStep(addOrderStep + 1)}
                  >
                    next
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
