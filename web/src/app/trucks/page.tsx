import Filter from "../components/filter";
import Header from "../components/header";
import MapView from "../components/map";
import TableChartTruck from "../components/tableChartTruck";
import Table from "../components/tableTruck";
import Card from "../components/ui/card";

export default function Trucks() {
  return (
    <div className="mr-4 ml-4">
      <Header/>
      <div className="flex justify-start items-center">
        <Filter 
          placeholder="Truck: Truck A" 
          icon="bx:calendar"
        />
        <Filter 
          placeholder="Data: 10/08/2025 - 20/08/2025" 
          icon="tabler:search"
        />
        <Filter 
          placeholder="Status: Todos" 
          icon="hugeicons:status"
        />
      </div>
      <div className="flex">
        <div className="flex mt-2"> {/* Wrapper com flex-1 para o mapa ocupar o resto */}
          <MapView />
        </div>
        <div>
          <div className="flex">
            <Card 
              Title="Média de Vendas" 
              iconColor="gray" 
              iconImage="tdesign:money"/>
            <Card 
              Title="Média de Pedidos" 
              iconColor="gray" 
              iconImage="icon-park-outline:bill"/>
            <Card 
              Title="Trucks Cadastrados" 
              iconColor="gray" 
              iconImage="streamline-plump:food-truck-event-fair"/>
          </div>
          <div className="ml-5 mt-4 flex">
            <Table/>
            <div className="ml-5 mt-2">
              <TableChartTruck/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}