interface statusProps {
  text: string;
}

export default function Status({ text }: statusProps) {
  let bg = '';
  let border = '';
  let color = '';

  if (text === 'Suficiente') {
    bg = 'bg-green-200';
    border = 'border-green-500';
    color = 'text-green-500';
  } else if (text === 'Alerta') {
    bg = 'bg-orange-200';
    border = 'border-orange-500';
    color = 'text-orange-500';
  } else if (text === 'Em falta') {
    bg = 'bg-red-200';
    border = 'border-red-500';
    color = 'text-red-500';
  }

  return (
    <div className={`h-7 w-30 ${bg} ${border} rounded-2xl border-2 flex items-center justify-center`}>
      <span className={color}>
        {text}
      </span>
    </div>
  );
}
