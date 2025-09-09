import Truck from "../public/favicon/truck";
import User from "../public/favicon/user";
import HeaderButton from "./headerButton";

export default function Header() {
  return (
    <div className="flex items-center justify-between h-28">
      <div className="flex items-center">
        <Truck />
        <div className="text-gray-950 justify-start">
          <h1 className="font-bold text-3xl">Food Truck</h1>
          <h1 className="font-light text-2xl">Gerenciador</h1>
        </div>
      </div>

      <div className="flex justify-end text-gray-950 text-2xl gap-20">
        <HeaderButton />
      </div>
        <div className="justify-end">
          <User />
        </div>
    </div>
  );
}
