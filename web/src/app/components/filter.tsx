import IconFilter from "./ui/iconFilter";

interface filterProps {
  placeholder: string;
  icon: string;
}

export default function Filter({ placeholder, icon }: filterProps) {
  return (
    <div className="w-75 h-8 bg-[#E7E7E7] border border-gray-500 text-[#323232] rounded-md mr-10 flex items-center px-2">
      {/* Texto do input alinhado à esquerda */}
      <input
        placeholder={placeholder}
        className="flex-1 h-full bg-transparent outline-none"
      />

      {/* Ícone alinhado à direita */}
      <IconFilter icon={icon} />
    </div>
  );
}
