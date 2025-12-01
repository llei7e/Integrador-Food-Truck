// components/tableTruck.tsx (Atualizado com props para filtrar dados)
import Status from "./ui/status";

interface TableProps {
  selectedTruckId?: string;
  trucksList: { id: number; localizacao: string; ativo: boolean }[];
}

export default function Table({ selectedTruckId, trucksList }: TableProps) {
  // Filtra lista baseada na seleção
  const filteredTrucks = selectedTruckId 
    ? trucksList.filter((truck) => truck.id.toString() === selectedTruckId)
    : trucksList;

  if (filteredTrucks.length === 0) {
    return (
      <div className="relative overflow-x-auto mt-2 w-158 rounded-2xl">
        <p className="text-center py-4 text-gray-500">Nenhum truck encontrado</p>
      </div>
    );
  }

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
            <th scope="col" className="px-6 py-3 text-center">
              STATUS
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredTrucks.map((truck) => (
            <tr key={truck.id} className="bg-white border-b border-gray-200">
              <th scope="row" className="px-6 py-4 font-medium text-black whitespace-nowrap">
                Truck {truck.id}
              </th>
              <td className="px-6 py-4 flex justify-start text-black">
                {truck.localizacao}
              </td>
              <td className="px-6 py-4 text-center">
                <Status status={truck.ativo ? "active" : "inactive"} /> {/* Assuma que Status aceita isso */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}