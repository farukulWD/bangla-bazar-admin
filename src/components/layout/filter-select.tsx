import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ALL = "all";

type FilterSelectProps = {
  items: readonly { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
};

export function FilterSelect({ items, value, onChange }: FilterSelectProps) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => onChange(next ?? ALL)}
    >
      <SelectTrigger className="w-full data-[size=default]:h-9 sm:w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
