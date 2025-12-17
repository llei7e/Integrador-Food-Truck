import Truck from "../public/favicon/truck";
import User from "../public/favicon/user";
import Divider from "./divider";
import HeaderButton from "./headerButton";

export default function Header() {
  const userString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userString ? JSON.parse(userString) : null;

  const getInitials = (name: string): string => {
    if (!name) return "US";
    const words = name.split(' ').slice(0, 2);
    return words.map(word => word.charAt(0).toUpperCase()).join(''); 
  };

  const initials = user ? getInitials(user.name) : "ADM";

  return (
    <div>
      <div className="flex items-center justify-between h-18">
        <div className="flex items-center">
          <Truck />
          <div className="text-gray-950 justify-start">
            <h1 className="font-bold text-2xl">Food Truck</h1>
            <h1 className="font-light">Gerenciador</h1>
          </div>
        </div>

        <div className="flex justify-end text-gray-950 text-2xl gap-20">
          <HeaderButton />
        </div>
        <div className="justify-end">
          <User initials={initials} />
        </div>
      </div>
      <Divider/>
    </div>
  );
}