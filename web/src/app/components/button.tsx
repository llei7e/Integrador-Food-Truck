import Link from "next/link";

interface ButtonProps {
    text: string;
    href: string;
}

export default function Button({text, href = " "} : ButtonProps){

     return (
            <Link href={href}>
                <button className="w-50 h-20 md:h-20 md:w-80 rounded-3xl bg-[#EA2626] text-2xl cursor-pointer shadow-gray-400 shadow-lg">
                    {text}
                </button>
            </Link>
     );
}