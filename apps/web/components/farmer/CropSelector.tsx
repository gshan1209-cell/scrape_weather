import { Select } from "@/components/ui/select";

const crops = ["水稻", "葉菜", "果樹", "一般作物"];

export function CropSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Select label="作物" value={value} onChange={(event) => onChange(event.target.value)}>
      {crops.map((crop) => (
        <option key={crop} value={crop}>
          {crop}
        </option>
      ))}
    </Select>
  );
}
