"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "../components/ui/button";
import SelectButton from "../components/selectButton";
import OffEye from "../public/favicon/off_eye";
import OnEye from "../public/favicon/on_eye";
import logo from "../public/logo.png";
import Image from "next/image";
import GoogleButton from "@/components/googleButton";

import { login, register } from "@/services/authService";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const router = useRouter();

  async function handleLogin() {
    try {
      setLoading(true);
      setErro(null);

      // chama o backend
      const data = await login(email, senha); // { token: "..." }

      // salva o token no navegador
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
      }

      // se deu certo, vai pra tela de vendas
      router.push("/sales");
    } catch (e: any) {
      setErro(e.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-dvh w-full">
      <div className="hidden md:block md:w-3/5 bg-amber-600" />

      <div className="w-full md:w-2/5 bg-[#EFEAEA] flex items-center justify-center">
        <div className="flex flex-col justify-center w-[70%] max-w-md">
          <div className="flex justify-center mb-5">
            <Image
              priority={false}
              src={logo}
              alt={"logo"}
              width={150}
              height={150}
            />
          </div>

          <GoogleButton />

          <SelectButton
            colorButton1="bg-[#E7E5E5]"
            colorButton2="bg-[#EA2626]"
          />

          <h1 className="text-black mt-10">Email</h1>
          <input
            className="border-b-2 border-b-black w-full mb-10 text-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <h1 className="text-black">Senha</h1>
          <div className="relative w-full mb-10">
            <input
              type={showPassword ? "text" : "password"}
              className="border-b-2 border-b-black w-full text-gray-700 pr-10"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <OnEye /> : <OffEye />}
            </div>
          </div>

          {erro && (
            <p className="text-red-600 text-sm mb-4 text-center">
              {erro}
            </p>
          )}

          <div className="flex justify-center">
            <Button
              text={loading ? "Entrando..." : "Entrar"}
              onClick={handleLogin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
