"use client";
import Filter from "../components/filter";
import Header from "../components/header";
import Table from "../components/tableIngredient";
import Card from "../components/ui/card";

export default function Trucks() {
  return (
      <div className="mr-4 ml-4">
        <Header />
        <div className="flex justify-start items-center">
          <Filter placeholder="Data: 10/08/2025 - 20/08/2025" icon="bx:calendar" />
        </div>
        <div className="flex">
          <Table/>
          <Card
            Title="Itens Faltando" 
            iconColor="gray" 
            iconImage="solar:danger-triangle-bold"
            API_VALUE={""}/>
          <Card 
            Title="Item Faltando" 
            iconColor="gray" 
            iconImage="solar:danger-triangle-bold"
            API_VALUE={""}/>
          <Card 
            Title="Item Faltando" 
            iconColor="gray" 
            iconImage="solar:danger-triangle-bold"
            API_VALUE={""}/>
        </div>
      </div>
  )
}