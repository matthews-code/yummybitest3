import { useState } from "react";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import dayjs, { Dayjs } from "dayjs";
import { Role } from "@prisma/client";
import { FaPlus } from "react-icons/fa6";
import { useSession } from "next-auth/react";

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
              fontFamily: "sans-serif",
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
