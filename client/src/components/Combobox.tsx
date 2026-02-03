"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

interface Option {
  id: string;
  label: string;
}

interface ComboboxProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function Combobox({ options, value, onChange, placeholder = "Select...", disabled = false }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive the display label from value and options
  const selectedLabel = useMemo(() => {
    const selected = options.find(o => o.id === value);
    return selected ? selected.label : "";
  }, [value, options]);

  // What to show in the input field
  const displayValue = hasUserTyped ? searchTerm : selectedLabel;

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHasUserTyped(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    const term = hasUserTyped ? searchTerm.toLowerCase() : "";
    if (!term) return options;
    return options.filter(option => 
      option.label.toLowerCase().includes(term)
    );
  }, [options, searchTerm, hasUserTyped]);

  const handleClear = () => {
    onChange("");
    setSearchTerm("");
    setHasUserTyped(false);
    setIsOpen(false);
  };

  const handleSelect = (option: Option) => {
    onChange(option.id);
    setSearchTerm("");
    setHasUserTyped(false);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setHasUserTyped(true);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
          className="w-full bg-bg-muted border border-border-input text-text-primary pl-4 pr-16 py-3 rounded-md focus:outline-none focus:border-brand-primary transition-colors text-sm disabled:opacity-50"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-text-tertiary hover:text-danger transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <div 
            className="text-text-tertiary cursor-pointer"
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <ChevronsUpDown size={16} />
          </div>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-bg-surface border border-border-main rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-tertiary">No results found.</div>
          ) : (
            <div>
              {filteredOptions.map((option, index) => (
                <div
                  key={`${option.id}-${index}`}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-bg-muted flex items-center justify-between ${
                    value === option.id ? "bg-brand-primary/10 text-brand-primary font-medium" : "text-text-primary"
                  }`}
                >
                  {option.label}
                  {value === option.id && <Check size={14} />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
