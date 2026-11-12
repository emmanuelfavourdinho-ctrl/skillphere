'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ArrowLeft, MapPin, ShieldCheck } from 'lucide-react';
import { apiRequest, type ArtisanSearchResult } from '../../lib/api';

export default function Discover() {
  return (
    <Suspense fallback={<main className="connection-page"><p>Loading search…</p></main>}>
      <DiscoverResults />
    </Suspense>
  );
}

function DiscoverResults() {
  const params = useSearchParams();
  const service = params.get('service') ?? '';
  const location = params.get('location') ?? '';
  const [results, setResults] = useState<ArtisanSearchResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = new URLSearchParams({ limit: '12' });
    if (service) {
      const serviceAliases: Record<string, string> = {
        electricians: 'electrician',
        plumbers: 'plumber',
        carpenters: 'carpenter',
        mechanics: 'mechanic',
        welders: 'welder',
        painters: 'painter',
        masons: 'mason',
        'appliance-repair': 'appliance repair',
      };
      query.set('skill', serviceAliases[service.toLowerCase()] ?? service);
    }
    if (location) query.set('location', location);

    setLoading(true);
    setError('');
    apiRequest<ArtisanSearchResult>(`/artisans?${query.toString()}`)
      .then(setResults)
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : 'Could not load artisans.');
      })
      .finally(() => setLoading(false));
  }, [service, location]);

  const title = service || 'Artisans';
  const place = location || 'all locations';

  return (
    <main className="connection-page connection-page-wide">
      <Link href="/" className="back"><ArrowLeft size={16} /> Back to TrustTrade</Link>
      <span className="eyebrow">ARTISAN DISCOVERY</span>
      <h1>Find {title} in {place}</h1>
      <p className="connection-lead">Profiles and availability are loaded from the TrustTrade marketplace.</p>
      {loading && <p role="status">Loading artisans…</p>}
      {error && <section className="connection-card" role="alert"><p>{error}</p><p>Check that the API and database are running, then refresh this page.</p></section>}
      {!loading && !error && results?.data.length === 0 && (
        <section className="connection-card"><p>No artisans matched this search yet. Try a different skill or location.</p></section>
      )}
      {!loading && !error && results && results.data.length > 0 && (
        <>
          <p className="connection-count">{results.total} artisan{results.total === 1 ? '' : 's'} found</p>
          <div className="artisan-grid">
            {results.data.map((artisan) => {
              const skills = artisan.skills.map(({ skill }) => skill.name).join(', ') || 'Skills not listed';
              const address = [artisan.city, artisan.region || artisan.generalLocation].filter(Boolean).join(', ');
              return (
                <article className="artisan-card" key={artisan.id}>
                  {artisan.profileImage && <div className="artisan-photo"><img src={artisan.profileImage} alt="" /></div>}
                  <div className="artisan-info">
                    <div className="artisan-title">
                      <div><h2>{artisan.businessName || `${artisan.user.firstName} ${artisan.user.lastName}`}</h2><p>{skills}</p></div>
                      <span className={`availability availability-${artisan.availabilityStatus.toLowerCase()}`}>
                        {artisan.availabilityStatus.toLowerCase()}
                      </span>
                    </div>
                    {address && <p className="artisan-location"><MapPin size={14} />{address}</p>}
                    <p className="artisan-work">{artisan.bio || 'No profile description provided.'}</p>
                    <div className="evidence-row">
                      {artisan.experienceYears === null ? 'Experience not listed' : `${artisan.experienceYears} years’ experience`}
                    </div>
                    <div className="card-foot">
                      <span className="unverified">
                        <ShieldCheck size={14} />
                        {artisan.verifications.some(({ status }) => status === 'APPROVED') ? 'Verification on file' : 'Not verified'}
                      </span>
                      <Link href={`/artisans/${artisan.id}`}>View profile →</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
