'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  id?: string
  options: MultiSelectOption[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
  // See Input's controlColor -- same adaptive border override for arbitrary card backgrounds
  // (e.g. the subscription centre widget's style presets).
  controlColor?: string
}

export function MultiSelect({ id, options, selected, onChange, placeholder = 'Select options', className, controlColor }: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  const selectedLabels = options.filter((o) => selected.includes(o.value)).map((o) => o.label)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            controlColor
              ? 'border-[var(--control-color,var(--input))] aria-expanded:border-2 aria-expanded:border-[var(--control-color)]'
              : 'aria-expanded:ring-[3px] aria-expanded:ring-ring/50 aria-expanded:border-ring',
            className
          )}
          style={controlColor ? ({ '--control-color': controlColor } as React.CSSProperties) : undefined}
        >
          <span className="truncate text-left">
            {selectedLabels.length ? (
              selectedLabels.join(', ')
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem key={option.value} value={option.label} onSelect={() => toggle(option.value)}>
                  <Check className={cn('h-4 w-4', selected.includes(option.value) ? 'opacity-100' : 'opacity-0')} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
