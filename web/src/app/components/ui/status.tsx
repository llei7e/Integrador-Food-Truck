interface StatusProps {
  status: string;
}

export default function Status({ status }: StatusProps) {
  let bg = '';
  let color = '';
  let displayText = status;

  if (status === 'Suficiente' || status === 'Concluído') {
    bg = 'bg-green-200';
    color = 'text-green-500';
  } else if (status === 'Alerta' || status === 'Em preparo') {
    bg = 'bg-orange-200';
    color = 'text-orange-400';
  } else if (status === 'Em falta' || status === 'Cancelado') {
    bg = 'bg-red-200';
    color = 'text-red-500';
  } 

  else if (status === 'active') {
    bg = 'bg-green-200';
    color = 'text-green-500';
    displayText = 'Ativo';
  } else if (status === 'inactive') {
    bg = 'bg-red-200';
    color = 'text-red-500';
    displayText = 'Inativo';
  } 

  else if (typeof status === 'boolean') {
    if (status) {
      bg = 'bg-green-200';
      color = 'text-green-500';
      displayText = 'Ativo';
    } else {
      bg = 'bg-red-200';
      color = 'text-red-500';
      displayText = 'Inativo';
    }
  } else {
    bg = 'bg-gray-200';
    color = 'text-gray-500';
  }

  return (
    <span className={`${color} ${bg} h-7 w-30 flex items-center justify-center text-xs font-medium me-2 px-2.5 py-0.5 rounded-full`}>
      {displayText}
    </span>
  );
}