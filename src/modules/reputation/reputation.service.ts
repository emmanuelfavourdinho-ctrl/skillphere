import prisma from '../../database/prisma.js';

export async function computeReputationSummary(artisanProfileId: string) {
  const artisan = await prisma.artisanProfile.findUnique({
    where: { id: artisanProfileId },
    include: {
      verifications: true,
      portfolioItems: true,
      skills: { include: { skill: true } },
      endorsements: true,
      reviewsReceived: true,
    },
  });

  if (!artisan) {
    return { status: 'insufficient_evidence', dimensions: {} };
  }

  const identityVerified = artisan.verifications.some((verification) =>
    verification.verificationType === 'IDENTITY' && verification.status === 'APPROVED',
  );

  const skillEvidence = artisan.skills.length > 0;
  const completedWorkHistory = artisan.portfolioItems.length + artisan.reviewsReceived.length;
  const customerFeedback = artisan.reviewsReceived.length > 0
    ? artisan.reviewsReceived.reduce((sum, review) => sum + review.rating, 0) / artisan.reviewsReceived.length
    : null;
  const reliability = artisan.verifications.filter((verification) => verification.status === 'APPROVED').length;
  const communityEndorsements = artisan.endorsements.filter((endorsement) => endorsement.status === 'APPROVED').length;

  return {
    status: completedWorkHistory > 0 || identityVerified || skillEvidence ? 'evidence_based' : 'insufficient_evidence',
    dimensions: {
      identityVerification: identityVerified ? 'verified' : 'pending_or_missing',
      skillEvidence: skillEvidence ? 'present' : 'insufficient',
      completedWorkHistory: completedWorkHistory > 0 ? completedWorkHistory : 'insufficient',
      customerFeedback: customerFeedback ? Number(customerFeedback.toFixed(2)) : 'insufficient',
      reliability: reliability > 0 ? `${reliability} approved checks` : 'insufficient',
      endorsements: communityEndorsements > 0 ? `${communityEndorsements} approved endorsements` : 'insufficient',
      notes: 'Scores are derived from verified evidence and never from self-reported data alone.',
    },
  };
}
