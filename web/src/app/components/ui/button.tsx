// src/components/ui/button.tsx

import Link from "next/link";

interface ButtonProps {
  text: string;
  href?: string;
  onClick?: () => void | Promise<void>;
}

export default function Button({ text, href, onClick }: ButtonProps) {
  const content = (
    <button
      className="w-50 h-15 md:h-15 md:w-60 rounded-3xl bg-[#EA2626] text-2xl cursor-pointer shadow-gray-400 shadow-lg"
      type="button"
      onClick={onClick}
    >
      {text}
    </button>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
