"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { monthToDate, presetRange, RANGE_PRESETS, toIsoDate } from "@/lib/dashboard";
import type { DashboardRange } from "@/store/api/dashboard/types";

export function DateRangePicker({
  value,
  onChange,
}: {
  value: DashboardRange;
  onChange: (range: DashboardRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>();

  const from = parseISO(value.from);
  const to = parseISO(value.to);

  const apply = (range: DashboardRange) => {
    onChange(range);
    setDraft(undefined);
    setOpen(false);
  };

  const handleSelect = (range: DateRange | undefined) => {
    setDraft(range);
    if (range?.from && range.to && range.from.getTime() !== range.to.getTime()) {
      apply({ from: toIsoDate(range.from), to: toIsoDate(range.to) });
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setDraft(undefined);
      }}
    >
      <PopoverTrigger
        render={<Button variant="outline" aria-label="Filter by date range" />}
      >
        <CalendarIcon />
        {format(from, "d MMM")} – {format(to, "d MMM yyyy")}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-wrap gap-1 p-2 sm:flex-col sm:border-r">
            {RANGE_PRESETS.map((preset) => (
              <Button
                key={preset.key}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => apply(presetRange(preset.days))}
              >
                {preset.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => apply(monthToDate())}
            >
              This month
            </Button>
          </div>
          <Calendar
            mode="range"
            defaultMonth={from}
            selected={draft ?? { from, to }}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
