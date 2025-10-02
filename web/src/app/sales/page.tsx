import Filter from "../components/filter";
import Header from "../components/header";

export default function Trucks() {
  return (
    <div className="mr-4 ml-4">
      <Header/>
      <div className="flex justify-start items-center">
        <Filter placeholder="Truck: Truck A" icon="bx:calendar"/>
        <Filter placeholder="Data: 10/08/2025 - 20/08/2025" icon="tabler:search"/>
      </div>
    </div>
  )
}