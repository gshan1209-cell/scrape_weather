export function TemperatureRange({ min, max }: { min?: number | null; max?: number | null }) {
  return (
    <span>
      {min ?? "--"} / {max ?? "--"} C
    </span>
  );
}
