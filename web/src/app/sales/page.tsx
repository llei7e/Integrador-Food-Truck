import Filter from "../components/filter";
import Header from "../components/header";
import TableSales from "../components/tableSales";
import Card from "../components/ui/card";

export default function Trucks() {
  return (
    <div className="mr-4 ml-4">
      <Header/>
      <div className="flex justify-start items-center">
        <Filter placeholder="Truck: Truck A" icon="bx:calendar"/>
        <Filter placeholder="Data: 10/08/2025 - 20/08/2025" icon="tabler:search"/>
      </div>
      <div>
        <div className="flex justify-evenly">
          <Card 
            Title="Vendas do Dia" 
            iconColor="gray" 
            iconImage="tdesign:money"
            API_VALUE=""/>
          <Card 
            Title="Média de Vendas" 
            iconColor="gray" 
            iconImage="tdesign:money"
            API_VALUE=""/>
          <Card 
            Title="Pedidos" 
            iconColor="gray" 
            iconImage="tdesign:money"
            API_VALUE=""/>
          <Card 
            Title="Ticket Médio" 
            iconColor="gray" 
            iconImage="tdesign:money"
            API_VALUE=""/>
        </div>
        <TableSales/>
      </div>
    </div>
  )
}