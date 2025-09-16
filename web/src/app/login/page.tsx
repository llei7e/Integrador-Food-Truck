import Button from "../components/button"
import SelectButton from "../components/selectButton"
import logo from "../public/logo.png"
import Image from "next/image"

export default function Login() {
  return (
    <div className="p-0 m-0 flex">
      <div className="h-dvh w-3/5 bg-amber-600">

      </div>
      <div className="h-dvh w-2/5 bg-[#EFEAEA] flex items-center justify-center">
        <div className="flex flex-col justify-center">
          <div className="flex justify-center mb-15">
            <Image
            priority={false}
            src={logo} 
            alt={"logo"} 
            width={200} 
            height={200}/>
          </div>
          <SelectButton colorButton1="bg-[#E7E5E5]" colorButton2="bg-[#EA2626]" positionButton1="z-10" positionButton2="z-20"/>
          <h1 className="text-black justify-start mt-10">Email</h1>
          <input className="border-b-2 border-b-black w-170 mb-10 text-gray-700"></input>
          <h1 className="text-black">Senha</h1>
          <input className="border-b-2 border-b-black w-170 mb-10 text-gray-700"></input>
          <div className="flex justify-center">
            <Button text={"Entrar"} href={"/sales"}/>
          </div>
        </div>
      </div>
    </div>
  )
}