/**
 * TYPEPLAY — NotFoundPage
 * ==========================================================================
 * 404 fallback. Kept consistent with the premium dark aesthetic and offers
 * a clear way back home. The page is keyboard navigable (a real link) and
 * uses a heading so screen-reader users skip straight to the message.
 */
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section
      className="container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        paddingTop: 'var(--space-24)',
        paddingBottom: 'var(--space-24)',
      }}
    >
      <p
        style={{
          margin: '0 0 var(--space-4) 0',
          fontSize: '5rem',
          fontWeight: 700,
          lineHeight: 1,
          color: 'var(--color-accent)',
          letterSpacing: '-0.02em',
        }}
      >
        404
      </p>
      <h1
        style={{
          margin: '0 0 var(--space-3) 0',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
        }}
      >
        Page not found
      </h1>
      <p
        style={{
          margin: '0 0 var(--space-8) 0',
          maxWidth: '26rem',
          color: 'var(--color-text-secondary)',
          fontSize: '0.9375rem',
        }}
      >
        The page you&rsquo;re looking for doesn&rsquo;t exist or hasn&rsquo;t
        been built yet. Let&rsquo;s get you back to practicing.
      </p>
      <Link to="/" className="btn btn-secondary btn-md">
        <Home size={16} aria-hidden="true" />
        Back to home
      </Link>
    </section>
  );
}
