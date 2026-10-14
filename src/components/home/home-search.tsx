"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { FormEvent } from "react";

import type { MasterOption } from "@/lib/api/master";

import { MenuSelect } from "@/components/ui/menu-select";

export function HomeSearch({ categories }: { categories: MasterOption[] }) {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  function go(event?: FormEvent) {
    event?.preventDefault();
    const params = new URLSearchParams();
    if (category.trim()) params.set("category", category.trim());
    if (search.trim()) params.set("search", search.trim());
    const query = params.toString();
    router.push(query ? `/coach?${query}` : "/coach");
  }

  return (
    <div className="search-section">
      <div className="container">
        <form className="search-box" onSubmit={go}>
          <MenuSelect
            id="heroCategory"
            aria-label="All Categories"
            skin="public"
            variant="bar"
            className="ui-select ui-select-bar"
            value={category}
            placeholder="All Categories"
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((item) => ({
                value: item.code,
                label: item.label,
              })),
            ]}
            onChange={(event) => setCategory(event.target.value)}
          />
          <input
            type="text"
            id="heroSearch"
            aria-label="Search coaches by name, specialty, city or goal"
            placeholder="Search by name, specialty, city or goal..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button type="submit">
            <i className="fas fa-search" /> Search Coaches
          </button>
        </form>
      </div>
    </div>
  );
}
