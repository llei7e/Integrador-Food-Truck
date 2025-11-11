"use client";

import Button from "../components/ui/button"
import SelectButton from "../components/selectButton"
import OffEye from "../public/favicon/off_eye"
import OnEye from "../public/favicon/on_eye"
import logo from "../public/logo.png"
import Image from "next/image"
import { useState } from "react";
import GoogleButton from "@/components/googleButton";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

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

          <GoogleButton/>
          
          <SelectButton
            colorButton1="bg-[#E7E5E5]"
            colorButton2="bg-[#EA2626]"
          />
          
          <h1 className="text-black mt-10">Email</h1>
          <input className="border-b-2 border-b-black w-full mb-10 text-gray-700"></input>
          
          <h1 className="text-black">Senha</h1>
          <div className="relative w-full mb-10">
            <input
              type={showPassword ? "text" : "password"}
              className="border-b-2 border-b-black w-full text-gray-700 pr-10"
            />

            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <OnEye/> : <OffEye/>}
            </div>
          </div>
         
          <div className="flex justify-center">
            <Button text={"Entrar"} href={"/sales"}/>
          </div>
        </div>
      </div>
    </div>
  )
}