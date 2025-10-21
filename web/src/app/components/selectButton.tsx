import Link from "next/link";

interface ButtonsProps {
  colorButton1: string;
  colorButton2: string;
}

export default function SelectButton({ colorButton1, colorButton2 }: ButtonsProps) {
  return (
    <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 mb-2">
      <Link href="/register">
        <button
          className={`
            px-6 py-2 sm:px-8 sm:py-3 md:px-10 md:py-4
            rounded-3xl 
            ${colorButton1} 
            cursor-pointer 
            shadow-lg shadow-gray-400 
            text-sm sm:text-base md:text-lg
            transition-all duration-300
            hover:brightness-90
            text-black
          `}
        >
          Registro
        </button>
      </Link>
      <Link href="/login">
        <button
          className={`
            px-6 py-2 sm:px-8 sm:py-3 md:px-10 md:py-4
            rounded-3xl 
            ${colorButton2} 
            cursor-pointer 
            shadow-lg shadow-gray-400 
            text-sm sm:text-base md:text-lg
            transition-all duration-300
            hover:brightness-90
            text-black
          `}
        >
          Entrar
        </button>
      </Link>
    </div>
  );
}
