import { useState } from "react";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker";
import dayjs, { Dayjs } from "dayjs";

const Order = () => {
  const [date, setDate] = useState(Date());

  return (
    <div className="flex justify-center">
      <div className="dark-border h-[calc(100vh-66px)] w-4/5 p-12">
        <div className="medium-border flex justify-between">
          <div>search</div>
          <div className="light-border">{typeof date}</div>
          <div>
            <MobileDatePicker
              closeOnSelect={true}
              value={dayjs(date)}
              onChange={(value: Dayjs | null) => {
                console.log(value?.toDate());
              }}
            />
          </div>
        </div>
        <div className="light-border overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Job</th>
                <th>Favorite Color</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>1</th>
                <td>Cy Ganderton</td>
                <td>Quality Control Specialist</td>
                <td>Blue</td>
              </tr>
              <tr>
                <th>2</th>
                <td>Hart Hagerty</td>
                <td>
                  <a href="">Desktop Support Technician</a>
                </td>
                <td>Purple</td>
              </tr>
              <tr>
                <th>3</th>
                <td>Brice Swyre</td>
                <td>Tax Accountant</td>
                <td>Red</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Order;
