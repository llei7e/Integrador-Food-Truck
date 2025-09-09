import Link from "next/link";

export default function RegisterLoginButton() {
  return (
    <div className="relative w- flex justify-center">
      <div className="relative w-[200px] h-[60px] text-white">
        <Link href="/register">
          <button className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[60px] rounded-3xl bg-amber-600 text-2xl cursor-pointer">
            Registro
          </button>
        </Link>
        <Link href="/login">
          <button className="absolute top-0 left-1/2 -translate-x-65 translate-y-0 w-[200px] h-[60px] rounded-3xl bg-[#EA2626] text-2xl cursor-pointer">
            Entrar
          </button>
        </Link>
      </div>
    </div>
  );
}
