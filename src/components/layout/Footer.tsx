/**
 * TYPEPLAY — Footer
 * ==========================================================================
 * Premium footer crediting the creator and linking to social profiles.
 *
 * Social links are intentional placeholders — clearly marked PLACEHOLDER
 * values that Jesse will replace with real profile URLs later. We never
 * invent real-looking URLs. Each link opens in a new tab safely
 * (rel="noopener noreferrer") and carries an accessible label.
 */
import { Keyboard } from 'lucide-react';
import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/jessesilvanus',
    icon: FaGithub,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/jessesilvanus_k/',
    icon: FaInstagram,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/jesse-silvanus-3a601a2a6/',
    icon: FaLinkedin,
  },
] as const;

function SocialLink({ label, href, Icon }: { label: string; href: string; Icon: React.ComponentType<{ size?: number }> }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text-secondary)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'transparent',
        textDecoration: 'none',
        transition: 'color var(--transition-fast), border-color var(--transition-fast), background-color var(--transition-fast), transform var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-accent)';
        e.currentTarget.style.borderColor = 'var(--color-accent)';
        e.currentTarget.style.backgroundColor = 'var(--color-accent-muted)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--color-text-secondary)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid var(--color-accent)';
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
    >
      <Icon size={18} aria-hidden="true" />
    </a>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div
        className="container"
        style={{
          paddingTop: 'var(--space-12)',
          paddingBottom: 'var(--space-12)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-8)',
          }}
        >
          {/* Brand + tagline */}
          <div style={{ maxWidth: '24rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <Keyboard
                size={20}
                style={{ color: 'var(--color-accent)' }}
                aria-hidden="true"
              />
              <span
                style={{
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                }}
              >
                TYPE<span style={{ color: 'var(--color-accent)' }}>PLAY</span>
              </span>
            </div>
            <p
              style={{
                margin: 0,
                color: 'var(--color-text-secondary)',
                fontSize: '0.875rem',
                lineHeight: 1.6,
              }}
            >
              Learn to type. Play the keys. A premium touch-typing practice
              with a musical identity.
            </p>
          </div>

          {/* Social links */}
          <div>
            <p
              style={{
                margin: '0 0 0.75rem 0',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
              }}
            >
              Created by Jesse Silvanus
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <SocialLink key={label} label={label} href={href} Icon={Icon} />
              ))}
            </div>
          </div>
        </div>

        {/* Fine print */}
        <div
          style={{
            marginTop: 'var(--space-10)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
            }}
          >
            © 2026 Jesse Silvanus. All rights reserved.
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
            }}
          >
            Accuracy &rarr; Technique &rarr; Speed
          </p>
        </div>
      </div>
    </footer>
  );
}
