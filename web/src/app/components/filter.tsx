import IconFilter from "./ui/iconFilter";

interface FilterProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder: string;
  icon: string;
  options?: { value: string; label: string }[];
  isSelect?: boolean;
}

export default function Filter({ placeholder, icon, value, onChange, options, isSelect = false }: FilterProps) {
  return (
    <div className="w-75 h-8 bg-[#E7E7E7] border border-gray-500 text-[#323232] rounded-md mr-10 flex items-center px-2">
      {isSelect ? (
        <select
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 h-full bg-transparent outline-none"
        >
          <option value="">{placeholder}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          placeholder={placeholder}
          className="flex-1 h-full bg-transparent outline-none"
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
      <IconFilter icon={icon} />
    </div>
  );
}