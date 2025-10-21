import { Icon } from "@iconify/react/dist/iconify.js";

interface cardProps {
    iconImage:string;
    iconColor:string;
    Title:string;
}

export default function Card({iconImage,iconColor,Title}:cardProps){
    return (
    <div className="max-w-sm p-6 bg-white rounded-3xl shadow-sm mt-2 ml-5 h-30 w-80 flex align-middle items-center">
        <div>
            <Icon icon={iconImage} color={iconColor} height={50}/>
        </div>
        <div className="justify-center w-full">
            <a>
                <h5 className="flex justify-center mb-2 text-2xl font-bold tracking-tight text-gray-700 ">
                    {Title}
                </h5>
            </a>
            <p className="mb-3 font-normal text-gray-700 flex justify-center">
                3
            </p>
        </div>
    </div>
    )
}