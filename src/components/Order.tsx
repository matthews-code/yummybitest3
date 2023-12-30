import { useRef, useState } from "react";
import { api } from "~/utils/api";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import dayjs, { Dayjs } from "dayjs";
import { Role } from "@prisma/client";
import { FaPlus } from "react-icons/fa6";
import { useSession } from "next-auth/react";
import { MdDelete, MdEdit } from "react-icons/md";

const Order = () => {
  const role = useSession().data?.user.role;

  const invalidDateText = useRef<HTMLParagraphElement>(null);

  const [currDate, setCurrDate] = useState(dayjs().toISOString());
  const [addDate, setAddDate] = useState<string>();
  const [addOrderStep, setAddOrderStep] = useState(1);

  const { data: users, refetch: refetchUsers } =
    api.user.getAllUsers.useQuery();

  const errorRouter = () => {
    if (addOrderStep === 1) {
      checkErrorDate();
    }

    if (addOrderStep === 2) {
    }

    if (addOrderStep === 3) {
    }

    if (addOrderStep === 4) {
    }
  };

  const checkErrorDate = () => {
    if (addDate !== undefined) {
      setAddOrderStep(addOrderStep + 1);
    } else {
      invalidDateText.current?.classList.remove("hidden");
    }
  };

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
          value={dayjs(currDate)}
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
                      fontFamily: "Segoe ui",
                      fontSize: 15,
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
                  placeholder="Search using name or contact number"
                  className="input input-bordered input-md w-full rounded-b-none"
                />
                <div className="max-h-36 overflow-y-auto rounded-b-lg border border-t-0 border-gray-300">
                  {users?.map((user) => (
                    <div
                      key={user.user_uid}
                      className="flex justify-between p-2 hover:bg-slate-50"
                    >
                      <p className="text-sm">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm">{user.contact_num}</p>
                    </div>
                  ))}
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
                    <select className="select select-bordered w-full ">
                      <option disabled selected>
                        Item
                      </option>
                      <option>Chocolate Cheesecake</option>
                      <option>Kutsinta</option>
                    </select>
                  </div>
                  <div className="w-full">
                    <div className="label">
                      <span className="label-text">Quantity</span>
                    </div>
                    <input
                      type="text"
                      placeholder="50"
                      className="input input-bordered input-md w-full"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <button className="btn btn-sm w-full border-none bg-yellow-200 ">
                    add item
                  </button>
                </div>
                <div className="divider my-3"></div>
              </>
            )}
            {addOrderStep === 4 && (
              <>
                <div className="flex gap-4">
                  <div className="w-full">
                    <div className="label">
                      <span className="label-text">Order</span>
                    </div>
                    <select className="select select-bordered w-full ">
                      <option disabled selected>
                        Payment mode
                      </option>
                      <option>Cash</option>
                      <option>Gcash</option>
                      <option>BPI</option>
                    </select>
                  </div>
                  <div className="w-full">
                    <div className="label">
                      <span className="label-text">Quantity</span>
                    </div>
                    <select className="select select-bordered w-full ">
                      <option disabled selected>
                        Delivery mode
                      </option>
                      <option>Pickup</option>
                      <option>Delivery</option>
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
