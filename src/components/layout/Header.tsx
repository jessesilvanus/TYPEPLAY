/**
 * TYPEPLAY — Header
 * ==========================================================================
 * Top navigation bar. Renders the brand mark and primary navigation links.
 *
 * Uses semantic <header> + <nav> elements and exposes every interactive
 * element as a real link, so the entire nav is keyboard navigable and
 * screen-reader friendly. Active route styling relies on react-router's
 * NavLink so navigation state is conveyed visually (underline) in addition
 * to aria-current.
 */
import { NavLink } from 'react-router-dom';
import { Keyboard } from 'lucide-react';
import type { NavItem } from '../../types/global';

/** Navigation entries. Kept here rather than in a routes config for now;
 *  when more routes exist we will centralise them (likely Phase 2+). */
const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', path: '/', description: 'TYPEPLAY home' },
  { id: 'practice', label: 'Practice', path: '/practice', description: 'Start a typing practice session' },
  { id: 'test', label: 'Typing Test', path: '/test', description: 'Timed typing test with live WPM and accuracy' },
  { id: 'music', label: 'Music', path: '/music', description: 'Play piano-like notes by typing accurately' },
  { id: 'learn', label: 'Learn Typing', path: '/learn', description: 'Structured touch-typing lessons' },
  { id: 'progress', label: 'Progress', path: '/progress', description: 'Your typing history and stats' },
  { id: 'settings', label: 'Settings', path: '/settings', description: 'Audio and display preferences' },
];

function BrandMark() {
  return (
    <NavLink
      to="/"
      aria-label="TYPEPLAY — home"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <Keyboard
        size={22}
        style={{ color: 'var(--color-accent)' }}
        aria-hidden="true"
      />
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '1.125rem',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}
      >
        TYPE<span style={{ color: 'var(--color-accent)' }}>PLAY</span>
      </span>
    </NavLink>
  );
}

function NavLinks() {
  return (
    <nav aria-label="Primary">
      <ul
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          margin: 0,
          padding: 0,
          listStyle: 'none',
        }}
      >
        {NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <NavLink
              to={item.path}
              title={item.description}
              style={({ isActive }) => ({
                display: 'inline-block',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-secondary)',
                textDecoration: 'none',
                borderRadius: 'var(--radius-md)',
                transition: 'color var(--transition-fast), background-color var(--transition-fast)',
                backgroundColor: isActive ? 'var(--color-bg-elevated)' : 'transparent',
              })}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Header() {
  return (
    <header
      className="navbar-glass"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4rem',
        }}
      >
        <BrandMark />
        <NavLinks />
      </div>
    </header>
  );
}
