'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { apiRequest, type Artisan } from '../../../lib/api';
import { artisans as demoArtisans } from '../../../lib/data';

export default function Profile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const demo = demoArtisans.find((profile) => profile.id === id);
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setArtisan(null);
    setError('');
    if (demo) return;
    let active = true;
    apiRequest<Artisan>(`/artisans/${encodeURIComponent(id)}`)
      .then((profile) => {
        if (active) setArtisan(profile);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : 'Could not load this artisan profile.');
        }
      });

    return () => {
      active = false;
    };
  }, [demo, id]);

  return (
    <main className="connection-page">
      <Link href="/discover" className="back"><ArrowLeft size={16} /> Back to artisans</Link>
      {error ? (
        <section className="connection-card" role="alert"><h1>Profile unavailable</h1><p>{error}</p></section>
      ) : demo ? (
        <>
          <span className="eyebrow">DEMONSTRATION PROFILE · NOT A TRUSTTRADE MEMBER</span>
          <h1>{demo.name}</h1>
          <p className="connection-lead">{demo.trade}</p>
          <img className="profile-image" src={demo.image} alt="" />
          <section className="connection-card profile-details">
            <p><MapPin size={16} />{demo.location}</p>
            <p><strong>Experience:</strong> {demo.experience}</p>
            <p><strong>Verification:</strong> {demo.status}</p>
            <p>{demo.work}</p>
            <p>This is sample content only and does not represent a registered artisan.</p>
          </section>
        </>
      ) : !artisan ? (
        <p role="status">Loading artisan profile…</p>
      ) : (
        <>
          <span className="eyebrow">ARTISAN PROFILE</span>
          <h1>{artisan.businessName || `${artisan.user.firstName} ${artisan.user.lastName}`}</h1>
          <p className="connection-lead">{artisan.skills.map(({ skill }) => skill.name).join(', ') || 'Skills not listed'}</p>
          {artisan.profileImage && <img className="profile-image" src={artisan.profileImage} alt="" />}
          <section className="connection-card profile-details">
            {(artisan.city || artisan.region || artisan.generalLocation) && (
              <p><MapPin size={16} /> {[artisan.city, artisan.region || artisan.generalLocation].filter(Boolean).join(', ')}</p>
            )}
            <p><strong>Availability:</strong> {artisan.availabilityStatus.toLowerCase()}</p>
            <p><strong>Experience:</strong> {artisan.experienceYears === null ? 'Not listed' : `${artisan.experienceYears} years (self-reported)`}</p>
            <p><strong>Verification:</strong> {artisan.verifications.some(({ status }) => status === 'APPROVED') ? 'An approved verification is on file' : 'No approved verification on file'}</p>
            <p>{artisan.bio || 'No profile description provided.'}</p>
          </section>
        </>
      )}
    </main>
  );
}
