import Status from "./ui/status";

export default function TableSales() {
  return (
    <div className="relative overflow-x-auto mt-2 w-full rounded-2xl">
      <table className="w-full text-sm text-left rtl:text-right text-white">
        <thead className="text-xs text-white uppercase bg-gray-50 dark:bg-red-900">
          <tr>
            <th scope="col" className="px-6 py-3 text-center">ID</th>
            <th scope="col" className="px-6 py-3 text-center">Data/Hora</th>
            <th scope="col" className="px-6 py-3 text-center">Cliente</th>
            <th scope="col" className="px-6 py-3 text-center">Itens</th>
            <th scope="col" className="px-6 py-3 text-center">Valor</th>
            <th scope="col" className="px-6 py-3 text-center">Pagamento</th>
            <th scope="col" className="px-6 py-3 text-center">Status</th>
          </tr>
        </thead>

        <tbody>
          {/* Linha 1 */}
          <tr className="bg-white border-b border-gray-200 text-black">
            <td className="px-6 py-4 text-center">#001</td>
            <td className="px-6 py-4 text-center">14/10/2025 - 10:32</td>
            <td className="px-6 py-4 text-center">João Silva</td>
            <td className="px-6 py-4 text-start">2x Hamburguer, 1x Refri</td>
            <td className="px-6 py-4 text-center">R$ 48,90</td>
            <td className="px-6 py-4 text-center">Pix</td>
            <td className="px-6 py-4 flex items-center justify-center">
              <Status text="Concluído" />
            </td>
          </tr>

          {/* Linha 2 */}
          <tr className="bg-white border-b border-gray-200 text-black">
            <td className="px-6 py-4 text-center">#002</td>
            <td className="px-6 py-4 text-center">14/10/2025 - 11:15</td>
            <td className="px-6 py-4 text-center">Maria Souza</td>
            <td className="px-6 py-4 text-start">1x Batata, 1x Refri</td>
            <td className="px-6 py-4 text-center">R$ 22,00</td>
            <td className="px-6 py-4 text-center">Crédito</td>
            <td className="px-6 py-4 flex items-center justify-center">
              <Status text="Em preparo" />
            </td>
          </tr>

          {/* Linha 3 */}
          <tr className="bg-white border-b border-gray-200 text-black">
            <td className="px-6 py-4 text-center">#003</td>
            <td className="px-6 py-4 text-center">14/10/2025 - 11:47</td>
            <td className="px-6 py-4 text-center">Carlos Lima</td>
            <td className="px-6 py-4 text-start">3x Hambúrguer Duplo</td>
            <td className="px-6 py-4 text-center">R$ 75,00</td>
            <td className="px-6 py-4 text-center">Dinheiro</td>
            <td className="px-6 py-4 flex items-center justify-center">
              <Status text="Cancelado" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
