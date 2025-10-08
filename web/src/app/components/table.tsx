import Status from "./ui/status";

export default function Table() {
  return (
    <div className="relative overflow-x-auto mt-2 w-110 rounded-2xl">
      <table className="w-full text-sm text-left rtl:text-right text-white">
        <thead className="text-xs text-white uppercase bg-gray-50 dark:bg-red-900">
          <tr>
            <th scope="col" className="px-6 py-3 text-center">
              Ingredientes
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white border-b border-gray-200">
            <th scope="row" className="px-6 py-4 font-medium text-black whitespace-nowrap">
              Pão
            </th>
            <td className="px-6 py-4 flex items-center justify-center">
              <Status text="Suficiente"/>
            </td>
          </tr>
          <tr className="bg-white border-b border-gray-200">
            <th scope="row" className="px-6 py-4 font-medium text-black whitespace-nowrap">
              Hamburguer
            </th>
            <td className="px-6 py-4 flex items-center justify-center">
              <Status text="Alerta"/>
            </td>
          </tr>
          <tr className="bg-white border-b border-gray-200">
            <th scope="row" className="px-6 py-4 font-medium text-black whitespace-nowrap">
              Tomate
            </th>
            <td className="px-6 py-4 flex items-center justify-center">
              <Status text="Em falta"/>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
