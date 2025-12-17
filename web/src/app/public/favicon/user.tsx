interface UserProps {
  initials?: string;
}

export default function User({ initials = "ADM" }: UserProps) {
  return (
    <div className="relative inline-flex items-center justify-center w-15 h-15 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600 text-2xl">
      <span className="font-medium text-gray-600 dark:text-gray-300">{initials}</span>
    </div>
  );
}