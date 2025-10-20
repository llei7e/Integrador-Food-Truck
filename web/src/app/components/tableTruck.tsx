import Status from "./ui/status";

export default function tableTruck() {
  return (
    <div className="relative overflow-x-auto mt-2 w-158 rounded-2xl">
      <table className="w-full text-sm text-left rtl:text-right text-white">
        <thead className="text-xs text-white uppercase bg-gray-50 dark:bg-red-900">
          <tr>
            <th scope="col" className="px-6 py-3 text-center">
              TRUCK
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              ENDEREÇO
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white border-b border-gray-200">
            <th scope="row" className="px-6 py-4 font-medium text-black whitespace-nowrap">
              Truck A
            </th>
            <td className="px-6 py-4 flex justify-start text-black">
              Cidade X - Rua Y, Bairro Z
            </td>
          </tr>
          <tr className="bg-white border-b border-gray-200">
            <th scope="row" className="px-6 py-4 font-medium text-black whitespace-nowrap">
              Truck B
            </th>
            <td className="px-6 py-4 flex justify-start text-black">
              Cidade X - Rua Y, Bairro Z
            </td>
          </tr>
          <tr className="bg-white border-b border-gray-200">
            <th scope="row" className="px-6 py-4 font-medium text-black whitespace-nowrap">
              Truck C
            </th>
            <td className="px-6 py-4 flex justify-start text-black">
              Cidade X - Rua Y, Bairro Z
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
