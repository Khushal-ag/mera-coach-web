"use client";

import { useRouter } from "next/navigation";

import { SelectField } from "@/components/ui/field";

export function DirectoryPageSizeSelect({
  pageSize,
  options,
}: {
  pageSize: number;
  options: { size: number; href: string }[];
}) {
  const router = useRouter();
  return (
    <SelectField
      label="Per page"
      name="pageSize"
      value={String(pageSize)}
      className="w-36"
      onChange={(event) => {
        const next = options.find(
          (option) => String(option.size) === event.target.value,
        );
        if (next && next.size !== pageSize) router.push(next.href);
      }}
    >
      {options.map((option) => (
        <option key={option.size} value={option.size}>
          {option.size}
        </option>
      ))}
    </SelectField>
  );
}
