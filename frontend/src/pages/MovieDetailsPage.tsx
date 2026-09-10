import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Globe, Film, Users } from 'lucide-react';
import { moviesApi } from '../api/movies.api';
import { MovieDetails } from '../types';
import { RatingBadge } from '../components/common/RatingBadge';
import { WishlistButton } from '../components/movie/WishlistButton';
import { MovieRail } from '../components/movie/MovieRail';
import { ErrorState } from '../components/common/ErrorState';
import { CastMember } from '../types';

// ==========================================
// CAST CARD with Initials Avatar Fallback
// ==========================================

/** Generate up to 2 initials from a person's full name, e.g. "Timothée Chalamet" → "TC" */
function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/** Deterministic hue derived from the actor's name for visual variety across cards */
function getAvatarHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

const CastCard: React.FC<{ actor: CastMember }> = ({ actor }) => {
  const [imgFailed, setImgFailed] = React.useState(false);
  const hasValidUrl = actor.profileUrl && actor.profileUrl.trim().length > 0 && !imgFailed;

  const initials = getInitials(actor.name);
  const hue = getAvatarHue(actor.name);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ width: '100%', aspectRatio: '1 / 1.2', backgroundColor: 'var(--bg-subtle)', overflow: 'hidden' }}>
        {hasValidUrl ? (
          <img
            src={actor.profileUrl!}
            alt={`Photo of ${actor.name}`}
            loading="lazy"
            onError={() => setImgFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            aria-label={`${actor.name} — no photo available`}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: `linear-gradient(145deg, hsl(${hue}, 25%, 18%) 0%, hsl(${hue}, 20%, 12%) 100%)`
            }}
          >
            <div
              style={{
                width: '3.2rem',
                height: '3.2rem',
                borderRadius: '50%',
                background: `linear-gradient(135deg, hsl(${hue}, 40%, 35%) 0%, hsl(${hue}, 35%, 25%) 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: `hsl(${hue}, 30%, 75%)`,
                letterSpacing: '0.05em',
                border: `2px solid hsl(${hue}, 30%, 30%)`
              }}
            >
              {initials}
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                color: `hsl(${hue}, 15%, 50%)`,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              No Photo
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: '0.65rem 0.75rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {actor.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '0.15rem' }}>
          {actor.character}
        </div>
      </div>
    </div>
  );
};

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    if (!id) return;
    const movieId = parseInt(id, 10);
    if (isNaN(movieId)) {
      setError('Invalid movie identifier.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setPosterError(false);

    moviesApi
      .getMovieDetails(movieId)
      .then((data) => {
        setMovie(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to load movie details');
        setLoading(false);
      });
  }, [id]);

  const formatRuntime = (minutes: number | null): string | null => {
    if (!minutes || minutes <= 0) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <div className="skeleton" style={{ width: '120px', height: '2rem', marginBottom: '2rem' }} />
        <div className="skeleton" style={{ width: '100%', height: '480px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <ErrorState
          title="Movie Not Found"
          message={error || 'We could not retrieve information for this movie.'}
          onRetry={() => navigate(-1)}
        />
      </div>
    );
  }

  const runtimeString = formatRuntime(movie.runtime);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Immersive Backdrop Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '480px',
          maxHeight: '620px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-subtle)'
        }}
      >
        {movie.backdropUrl && (
          <img
            src={movie.backdropUrl}
            alt={movie.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 20%',
              filter: 'brightness(0.65)'
            }}
          />
        )}

        {/* Ambient Dark Gradient Blend */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              linear-gradient(to top, var(--bg-canvas) 0%, rgba(11, 13, 19, 0.8) 50%, rgba(11, 13, 19, 0.3) 100%),
              linear-gradient(to right, rgba(11, 13, 19, 0.95) 0%, rgba(11, 13, 19, 0.6) 50%, transparent 100%)
            `
          }}
        />
      </div>

      {/* Main Details Card Layout */}
      <div className="container" style={{ position: 'relative', marginTop: '-360px', zIndex: 10 }}>
        {/* Back / Continue Exploring Button */}
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/search');
            }
          }}
          aria-label="Back to search results or previous page"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(11, 13, 19, 0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.75rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-medium)';
          }}
        >
          <ArrowLeft size={16} />
          Back to Results
        </button>

        {/* Hero Details Flex Layout */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2.5rem',
            alignItems: 'flex-start'
          }}
          className="details-hero-flex"
        >
          {/* Movie Poster */}
          <div
            style={{
              width: '260px',
              minWidth: '240px',
              aspectRatio: '2 / 3',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-surface)',
              flexShrink: 0
            }}
          >
            {movie.posterUrl && !posterError ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                onError={() => setPosterError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}
              >
                <Film size={48} strokeWidth={1.5} />
                <span style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>No Poster</span>
              </div>
            )}
          </div>

          {/* Details Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
            {/* Title & Tagline */}
            <div>
              <h1
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem'
                }}
              >
                {movie.title}
              </h1>

              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Original: {movie.originalTitle}
                </div>
              )}

              {movie.tagline && (
                <p style={{ fontSize: '1.05rem', color: 'var(--color-accent)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                  "{movie.tagline}"
                </p>
              )}
            </div>

            {/* Badges & Technical Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <RatingBadge rating={movie.rating} size="lg" />

              {movie.voteCount > 0 && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  ({movie.voteCount.toLocaleString()} votes)
                </span>
              )}

              {movie.releaseDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={16} color="var(--color-accent)" />
                  <span>{new Date(movie.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              )}

              {runtimeString && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={16} color="var(--color-accent)" />
                  <span>{runtimeString}</span>
                </div>
              )}

              {movie.originalLanguage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Globe size={16} color="var(--color-accent)" />
                  <span style={{ textTransform: 'uppercase' }}>{movie.originalLanguage}</span>
                </div>
              )}
            </div>

            {/* Genre Pills */}
            {movie.genres && movie.genres.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Overview / Synopsis */}
            <div style={{ marginTop: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Synopsis
              </h3>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '780px' }}>
                {movie.overview || 'No synopsis is currently available for this title.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <WishlistButton movie={movie} size="lg" showLabel={true} />
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {movie.cast && movie.cast.length > 0 && (
          <section style={{ marginTop: '4rem', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Users size={20} color="var(--color-accent)" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Top Billed Cast</h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {movie.cast.map((actor) => (
                <CastCard key={actor.id} actor={actor} />
              ))}
            </div>
          </section>
        )}

        {/* Recommendations & Similar Rails */}
        {movie.recommendations && movie.recommendations.length > 0 && (
          <div style={{ marginTop: '3.5rem' }}>
            <MovieRail
              title="You Might Also Enjoy"
              subtitle="Curated recommendations based on this movie"
              movies={movie.recommendations}
            />
          </div>
        )}

        {movie.similar && movie.similar.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <MovieRail
              title="Similar Titles"
              subtitle="Movies exploring comparable themes and tones"
              movies={movie.similar}
            />
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .details-hero-flex {
            flex-direction: row !important;
          }
        }
      `}</style>
    </div>
  );
};
