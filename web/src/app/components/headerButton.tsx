"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HeaderButton() {
  const pathname = usePathname();

  return (
    <>
      <Link href="/sales">
        <button
          className={`rounded-md py-3 px-5 cursor-pointer transition 
            hover:bg-red-900
            ${pathname === "/sales" ? "bg-red-900 text-white" : ""}`}
        >
          Pedidos
        </button>
      </Link>

      <Link href="/stocks">
        <button
          className={`rounded-md py-3 px-5 cursor-pointer transition 
            hover:bg-red-900
            ${pathname === "/stocks" ? "bg-red-900 text-white" : ""}`}
        >
          Estoque
        </button>
      </Link>

      <Link href="/trucks">
        <button
          className={`rounded-md py-3 px-5 cursor-pointer transition 
            hover:bg-red-900
            ${pathname === "/trucks" ? "bg-red-900 text-white" : ""}`}
        >
          Trucks
        </button>
      </Link>

            <Link href="/users">
        <button
          className={`rounded-md py-3 px-5 cursor-pointer transition 
            hover:bg-red-900
            ${pathname === "/trucks" ? "bg-red-900 text-white" : ""}`}
        >
          Usuários
        </button>
      </Link>
    </>
  );
}
