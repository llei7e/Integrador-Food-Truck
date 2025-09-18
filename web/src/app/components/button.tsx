import Link from "next/link";

interface ButtonProps {
    text: string;
    href: string;
}

export default function RegisterButton({text, href = " "} : ButtonProps){

     return (
        <>
            <Link href={href}>
                <button className="w-100 h-20 rounded-3xl bg-[#EA2626] text-2xl cursor-pointer shadow-black shadow-lg">
                    {text}
                </button>
            </Link>
        </>
     )
}