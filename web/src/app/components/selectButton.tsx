import Link from "next/link";

interface buttonsProps {
  colorButton1: string;
  positionButton1: string;

  colorButton2: string;
  positionButton2: string;
}

export default function SelectButton({colorButton1,colorButton2, positionButton1, positionButton2} : buttonsProps) {
  return (
    <div className="relative">
      <div className="relative w-150 h-15 text-black">
        <Link href="/register">
          <button className={`absolute top-0 left-105 -translate-x-1/2 w-50 h-20 rounded-3xl ${colorButton1} cursor-pointer ${positionButton1} shadow-lg shadow-black`}>
            Registro
          </button>
        </Link>
        <Link href="/login">
          <button className={`absolute top-0 left-105 -translate-x-65 translate-y-0 w-50 h-20 rounded-3xl ${colorButton2} cursor-pointer ${positionButton2} shadow-lg shadow-black`}>
            Entrar
          </button>
        </Link>
      </div>
    </div>
  );
}
