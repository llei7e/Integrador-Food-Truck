import { Icon } from "@iconify/react";

interface iconName {
    icon: string;
}

export default function IconFilter({icon} : iconName) {
  return (
    <Icon icon={icon} width={20} color="black"/>
  );
}