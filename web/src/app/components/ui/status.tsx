interface statusProps {
  text: string;
}

export default function Status({ text }: statusProps) {
  let bg = '';
  let color = '';

  if (text === 'Suficiente' || text === 'Concluído') {
    bg = 'bg-green-200';
    color = 'text-green-500';
  } else if (text === 'Alerta' || text === 'Em preparo') {
    bg = 'bg-orange-200';
    color = 'text-orange-400';
  } else if (text === 'Em falta' || text === 'Cancelado') {
    bg = 'bg-red-200';
    color = 'text-red-500';
  }

  return (
    <span className={`${color} ${bg} h-7 w-30 flex items-center justify-center text-xs font-medium me-2 px-2.5 py-0.5 rounded-full`}>
      {text}
    </span>
  );
}
