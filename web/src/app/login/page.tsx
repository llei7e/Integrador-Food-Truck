import LoginButton from "../components/loginButton"
import logo from "../public/logo.png"
import Image from "next/image"

export default function Login() {
  return (
    <div className="p-0 m-0 flex">
      <div className="h-dvh w-3/5 bg-amber-600">

      </div>
      <div className="h-dvh w-2/5 bg-[#EFEAEA] flex items-center justify-center">
        <div className="flex flex-col justify-center">
          <div className="flex justify-center">
            <Image 
            src={logo} 
            alt={"logo"} 
            width={200} 
            height={200}/>
          </div>
          <text className="text-black justify-start">Email</text>
          <input className="border-b-2 border-b-black w-170 mb-9 text-gray-700"></input>
          <text className="text-black">Senha</text>
          <input className="border-b-2 border-b-black w-170 mb-9 text-gray-700"></input>
          <text className="text-black">Senha</text>
          <input className="border-b-2 border-b-black w-170 mb-20 text-gray-700"></input>
          <div className="flex justify-center">
            <LoginButton/>
          </div>
        </div>
      </div>
    </div>
  )
}