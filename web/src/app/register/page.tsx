"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "../components/ui/button";
import SelectButton from "../components/selectButton";
import logo from "../public/logo.png";
import Image from "next/image";
import OnEye from "../public/favicon/on_eye";
import OffEye from "../public/favicon/off_eye";

import { register } from "@/services/authService";

export default function RegisterPage() {
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha1, setSenha1] = useState("");
  const [senha2, setSenha2] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleRegister() {
    try {
      setErro(null);

      if (!nome.trim()) {
        setErro("Informe o nome.");
        return;
      }

      if (senha1 !== senha2) {
        setErro("As senhas não coincidem.");
        return;
      }

      setLoading(true);

      // chama o backend para salvar no banco
      await register(nome, email, senha1);

      // depois de cadastrar, manda o usuário pro login
      router.push("/login");
    } catch (e: any) {
      setErro(e.message || "Erro ao registrar usuário.");
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

          <SelectButton
            colorButton1="bg-[#EA2626]"
            colorButton2="bg-[#E7E5E5]"
          />

          {/* NOME */}
          <h1 className="text-black justify-start mt-5">Nome</h1>
          <input
            className="border-b-2 border-b-black w-full mb-6 text-gray-700"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          {/* EMAIL */}
          <h1 className="text-black justify-start mt-2">Email</h1>
          <input
            className="border-b-2 border-b-black w-full mb-6 text-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* SENHA */}
          <h1 className="text-black">Senha</h1>
          <div className="relative w-full mb-6">
            <input
              type={showPassword1 ? "text" : "password"}
              className="border-b-2 border-b-black w-full text-gray-700 pr-10"
              value={senha1}
              onChange={(e) => setSenha1(e.target.value)}
            />

            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword1(!showPassword1)}
            >
              {showPassword1 ? <OnEye /> : <OffEye />}
            </div>
          </div>

          {/* CONFIRMAR SENHA */}
          <h1 className="text-black">Confirmar senha</h1>
          <div className="relative w-full mb-4">
            <input
              type={showPassword2 ? "text" : "password"}
              className="border-b-2 border-b-black w-full text-gray-700 pr-10"
              value={senha2}
              onChange={(e) => setSenha2(e.target.value)}
            />

            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword2(!showPassword2)}
            >
              {showPassword2 ? <OnEye /> : <OffEye />}
            </div>
          </div>

          {/* ERRO */}
          {erro && (
            <p className="text-red-600 text-sm mb-3 text-center">
              {erro}
            </p>
          )}

          <div className="flex justify-center">
            <Button
              text={loading ? "Cadastrando..." : "Cadastrar-se"}
              onClick={handleRegister}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
