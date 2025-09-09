import Link from "next/link";

export default function LoginButton(){
     return (
        <>
            <Link href={"/sales"}>
                <button className="w-100 h-20 rounded-3xl bg-[#EA2626] text-2xl cursor-pointer shadow-black shadow-2xl rouded-s">
                    Cadatra-se
                </button>
            </Link>
        </>
     )
}