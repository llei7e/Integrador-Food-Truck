import GoogleIcon from "@/public/favicon/google";

export default function GoogleButton() {
  return (
    <div className="w-auto h-15 bg-gray-200 border-gray-400 mb-5 border-2 rounded-2xl flex justify-center items-center shadow-lg shadow-gray-400">
      <div className="flex items-center gap-2 text-gray-700">
        <GoogleIcon />
        <p className="ml-20">Autenticação Google</p>
      </div>
    </div>
  );
}