"use client";

import { useState } from "react";
import Button from "../components/ui/button"
import SelectButton from "../components/selectButton"
import logo from "../public/logo.png"
import Image from "next/image"
import OnEye from "../public/favicon/on_eye";
import OffEye from "../public/favicon/off_eye";

export default function Login() {
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  return (
    <div className="flex h-dvh w-full">
      <div className="hidden md:block md:w-3/5 bg-amber-600">

      </div>
      <div className="w-full md:w-2/5 bg-[#EFEAEA] flex items-center justify-center">
        <div className="flex flex-col justify-center w-[70%] max-w-md">
          <div className="flex justify-center mb-5">
            <Image
            priority={false}
            src={logo} 
            alt={"logo"} 
            width={150} 
            height={150}/>
          </div>

          <SelectButton
            colorButton1="bg-[#EA2626]"
            colorButton2="bg-[#E7E5E5]"
          />

          <h1 className="text-black justify-start mt-5">Email</h1>
          <input className="border-b-2 border-b-black w-full mb-10 text-gray-700"></input>
          
          <h1 className="text-black">Senha</h1>
            <div className="relative w-full mb-10">
              <input
                type={showPassword1 ? "text" : "password"}
                className="border-b-2 border-b-black w-full text-gray-700 pr-10"
              />
  
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword1(!showPassword1)}
              >
                {showPassword1 ? <OnEye/> : <OffEye/>}
              </div>
            </div>
          
          <h1 className="text-black">Senha</h1>
            <div className="relative w-full mb-5">
              <input
                type={showPassword2 ? "text" : "password"}
                className="border-b-2 border-b-black w-full text-gray-700 pr-10"
              />
  
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword2(!showPassword2)}
              >
                {showPassword2 ? <OnEye/> : <OffEye/>}
              </div>
            </div>
          
          <div className="flex justify-center">
            <Button text={"Cadastrar-se"} href={"/login"}/>
          </div>
        </div>
      </div>
    </div>
  )
}