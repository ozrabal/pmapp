import {
  Select as SelectRoot,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

type SelectProps = React.ComponentProps<typeof SelectRoot> & {
  options: SelectOption[] | SelectGroup[];
  placeholder?: string;
  label?: string;
  width?: string;
  onChange?: (value: string) => void;
  value?: string;
  isGroup?: boolean;
};

export default function Select({
  options,
  placeholder = "Wybierz opcję",
  width = "w-full",
  onChange,
  value,
  isGroup = false,
  ...props
}: SelectProps) {
  const isGroupArray = (items: SelectOption[] | SelectGroup[]): items is SelectGroup[] => {
    return items.length > 0 && "options" in items[0];
  };

  const hasGroups = isGroup || isGroupArray(options);

  return (
    <SelectRoot value={value} onValueChange={onChange} {...props}>
      <SelectTrigger className={width}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {hasGroups
          ? // Render groups
            (options as SelectGroup[]).map((group) => (
              <SelectGroup key={group.label}>
                <SelectLabel>{group.label}</SelectLabel>
                {group.options.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          : // Render flat options
            (options as SelectOption[]).map((option) => (
              <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </SelectItem>
            ))}
      </SelectContent>
    </SelectRoot>
  );
}

// Export individual components for more complex use cases
export { SelectRoot, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue };
