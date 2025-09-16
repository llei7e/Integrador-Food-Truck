import IconFilter from "./iconFilter";

interface filterProps {
  placeholder: string;
  icon: string;
}

export default function Filter({ placeholder, icon }: filterProps) {
  return (
    <div className="w-100 h-12 bg-[#E7E7E7] border border-gray-500 text-[#323232] rounded-md mr-10 text-2xl flex items-center px-2">
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
