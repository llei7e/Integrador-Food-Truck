"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HeaderButton() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-20">  {/*   */}
      <Link href="/sales">
        <button
          className={`rounded-md py-3 px-5 cursor-pointer transition-all duration-200 font-medium
            hover:bg-red-900 hover:text-white focus:outline-none
            ${pathname === "/sales" ? "bg-red-900 text-white shadow-md" : "text-gray-700 border-gray-300"}`}
        >
          Pedidos
        </button>
      </Link>

      <Link href="/stocks">
        <button
          className={`rounded-md py-3 px-5 cursor-pointer transition-all duration-200 font-medium
            hover:bg-red-900 hover:text-white focus:outline-none
            ${pathname === "/stocks" ? "bg-red-900 text-white shadow-md" : "text-gray-700 border-gray-300"}`}
        >
          Estoque
        </button>
      </Link>

      <Link href="/trucks">
        <button
          className={`rounded-md py-3 px-5 cursor-pointer transition-all duration-200 font-medium
            hover:bg-red-900 hover:text-white focus:outline-none
            ${pathname === "/trucks" ? "bg-red-900 text-white shadow-md" : "text-gray-700 border-gray-300"}`}
        >
          Trucks
        </button>
      </Link>

      <Link href="/users">
        <button
          className={`rounded-md py-3 px-5 cursor-pointer transition-all duration-200 font-medium
            hover:bg-red-900 hover:text-white focus:outline-none
            ${pathname === "/users" ? "bg-red-900 text-white shadow-md" : "text-gray-700 border-gray-300"}`}
        >
          Usuários
        </button>
      </Link>
    </nav>
  );
}