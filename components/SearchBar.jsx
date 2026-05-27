'use client'
import { useRef, useEffect } from 'react'
import styles from './SearchBar.module.css'

/**
 * SearchBar — composant réutilisable
 * Props :
 *   value       : string
 *   onChange    : (value: string) => void
 *   placeholder : string
 *   autoFocus   : boolean
 *   onClear     : () => void  (optionnel)
 */
export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Rechercher…',
  autoFocus = false,
  onClear,
}) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [autoFocus])

  const handleClear = () => {
    onChange?.('')
    onClear?.()
    inputRef.current?.focus()
  }

  return (
    <div className={styles.wrap} role="search">
      {/* Icône recherche */}
      <span className={styles.iconSearch} aria-hidden>
        <SearchIcon />
      </span>

      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Bouton clear */}
      {value && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={handleClear}
          aria-label="Effacer la recherche"
          tabIndex={0}
        >
          ✕
        </button>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
