import { useState } from "react";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import { MobileDateTimePicker } from "@mui/x-date-pickers/MobileDateTimePicker";
import dayjs, { Dayjs } from "dayjs";
import { Role } from "@prisma/client";
import { FaPlus } from "react-icons/fa6";
import { useSession } from "next-auth/react";
import { MdDelete, MdEdit } from "react-icons/md";

const Order = () => {
  const role = useSession().data?.user.role;

  const [date, setDate] = useState(Date());

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
              alignSelf: "center",
              textAlign: "center",
              // fontFamily: "monospace",
              // fontSize: "0.95rem",
            },
            ".MuiInputBase-root": {
              borderRadius: 2,
              height: 48,
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
                  <p className="text-sm">09177951792</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium">₱1200</p>
                  <p className="text-sm">Gcash - Paid</p>
                </div>
              </div>
            </div>
            <div className="collapse-content bg-white">
              <div className="divider my-[-0.5rem]"></div>
              <div className="mt-4">
                <p className="text-sm">Chocolate Cheesecake</p>
                <p className="text-xs text-[#707070]">1 pc.</p>
              </div>
            </div>
          </div>

          <div className="collapse z-0 bg-white shadow-md">
            <input type="checkbox" />
            <div className="collapse-title p-4">
              <div className="flex justify-between">
                <div>
                  <h1 className="text-lg font-medium">Matthew Buensalida</h1>
                  <p className="text-sm">09065929661</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium">₱450</p>
                  <p className="text-sm">BPI - Unpaid</p>
                </div>
              </div>
            </div>
            <div className="collapse-content bg-white">
              <div className="divider my-[-0.5rem]"></div>
              <div className="mt-4">
                <p className="text-sm">Pork Empanada</p>
                <p className="text-xs text-[#707070]">12 pcs.</p>
              </div>
            </div>
          </div>
        </div>

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
