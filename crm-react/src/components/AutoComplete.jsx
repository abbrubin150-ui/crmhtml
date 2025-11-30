import { useState, useEffect, useRef } from 'react';

const AutoComplete = ({
  value,
  onChange,
  suggestions = [],
  placeholder = '',
  className = '',
  onSelect,
  filterFn,
  renderSuggestion,
  minChars = 1,
  maxSuggestions = 10,
  ...inputProps
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter suggestions based on input value
  useEffect(() => {
    if (!value || value.length < minChars) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = filterFn
      ? filterFn(suggestions, value)
      : suggestions.filter(item =>
          (typeof item === 'string' ? item : item.label)
            .toLowerCase()
            .includes(value.toLowerCase())
        );

    setFilteredSuggestions(filtered.slice(0, maxSuggestions));
    setShowSuggestions(filtered.length > 0);
  }, [value, suggestions, minChars, maxSuggestions, filterFn]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelect(filteredSuggestions[selectedIndex]);
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;

      default:
        break;
    }
  };

  const handleSelect = (suggestion) => {
    const selectedValue = typeof suggestion === 'string' ? suggestion : suggestion.value;
    onChange({ target: { value: selectedValue } });
    setShowSuggestions(false);
    setSelectedIndex(-1);

    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const defaultRenderSuggestion = (suggestion, index) => {
    const isSelected = index === selectedIndex;
    const display = typeof suggestion === 'string' ? suggestion : suggestion.label;

    return (
      <div
        key={index}
        className={`autocomplete-item ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSelect(suggestion)}
        onMouseEnter={() => setSelectedIndex(index)}
      >
        {typeof suggestion === 'object' && suggestion.icon && (
          <i className={`fas ${suggestion.icon}`} style={{ marginRight: '8px', color: suggestion.iconColor || 'var(--accent)' }}></i>
        )}
        <span>{display}</span>
        {typeof suggestion === 'object' && suggestion.meta && (
          <span className="autocomplete-meta">{suggestion.meta}</span>
        )}
      </div>
    );
  };

  return (
    <div className="autocomplete-container" style={{ position: 'relative', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (filteredSuggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        {...inputProps}
      />

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div ref={dropdownRef} className="autocomplete-dropdown">
          {filteredSuggestions.map((suggestion, index) =>
            renderSuggestion
              ? renderSuggestion(suggestion, index, index === selectedIndex, () => handleSelect(suggestion))
              : defaultRenderSuggestion(suggestion, index)
          )}
        </div>
      )}
    </div>
  );
};

export default AutoComplete;
