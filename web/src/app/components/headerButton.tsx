import Link from "next/link";

export default function HeaderButton() {
    return(
    <>
    <Link href={"/sales"}>
        <button className="hover:bg-gray-400 active:bg-gray-400 rounded-md py-3 px-5 cursor-pointer">
            Vendas
        </button>
    </Link>

    <Link href={"/stocks"}>
        <button className="hover:bg-gray-400 active:bg-gray-400 rounded-md py-3 px-5 cursor-pointer">
            Estoque
        </button>
    </Link>

    <Link href={"/trucks"}>
        <button className="hover:bg-gray-400 active:bg-gray-400 rounded-md py-3 px-5 cursor-pointer">
            Trucks
        </button>
    </Link>
    </>
    )
}