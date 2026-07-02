import { Select } from "@/components/ui/select";

const crops = ["rice", "leafy greens", "fruit", "general"];

export function CropSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Select label="Crop" value={value} onChange={(event) => onChange(event.target.value)}>
      {crops.map((crop) => (
        <option key={crop} value={crop}>
          {crop}
        </option>
      ))}
    </Select>
  );
}
