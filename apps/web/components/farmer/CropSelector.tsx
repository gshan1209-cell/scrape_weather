import { cn } from "@/lib/utils";

const crops = ["水稻", "葉菜", "果樹", "一般作物"];

type Props = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function CropSelector({ value, onChange, className }: Props) {
  return (
    <select
      aria-label="作物"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("h-10 rounded-md border border-stone-300 bg-white px-3 text-sm [&>option]:text-stone-900", className)}
    >
      {crops.map((crop) => (
        <option key={crop} value={crop}>
          {crop}
        </option>
      ))}
    </select>
  );
}
