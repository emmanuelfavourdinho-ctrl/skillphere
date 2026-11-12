import prisma from '../../database/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import { computeReputationSummary } from '../reputation/reputation.service.js';

export async function listArtisans(filters: {
  skill?: string;
  location?: string;
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  minExperience?: number;
  availability?: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  page?: number;
  limit?: number;
  sort?: 'relevance' | 'experience' | 'rating';
}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 12;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    user: { accountStatus: 'ACTIVE' },
  };

  if (filters.skill) {
    where.skills = {
      some: {
        skill: {
          name: { contains: filters.skill, mode: 'insensitive' },
        },
      },
    };
  }

  if (filters.location) {
    where.OR = [
      { city: { contains: filters.location, mode: 'insensitive' } },
      { region: { contains: filters.location, mode: 'insensitive' } },
      { generalLocation: { contains: filters.location, mode: 'insensitive' } },
    ];
  }

  if (filters.minExperience) {
    where.experienceYears = { gte: filters.minExperience };
  }

  if (filters.availability) {
    where.availabilityStatus = filters.availability;
  }

  if (filters.verificationStatus) {
    where.verifications = {
      some: { status: filters.verificationStatus },
    };
  }

  const [artisans, total] = await Promise.all([
    prisma.artisanProfile.findMany({
      where,
      orderBy:
        filters.sort === 'experience'
          ? { experienceYears: 'desc' }
          : { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        skills: {
          include: { skill: true },
        },
        verifications: true,
        portfolioItems: true,
        availabilitySlots: true,
      },
    }),
    prisma.artisanProfile.count({ where }),
  ]);

  const enriched = await Promise.all(
    artisans.map(async (artisan) => {
      const reputation = await computeReputationSummary(artisan.id);
      const matchScore = calculateMatchScore(artisan, filters.skill, filters.location);
      return {
        ...artisan,
        reputation,
        matchScore,
      };
    }),
  );

  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    data: enriched,
  };
}

export async function getArtisanById(id: string) {
  const artisan = await prisma.artisanProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      skills: { include: { skill: true } },
      verifications: true,
      portfolioItems: true,
      availabilitySlots: true,
      endorsements: true,
    },
  });

  if (!artisan) {
    throw new NotFoundError('Artisan profile not found.');
  }

  return {
    ...artisan,
    reputation: await computeReputationSummary(artisan.id),
  };
}

function calculateMatchScore(
  artisan: {
    city?: string | null;
    region?: string | null;
    generalLocation?: string | null;
    availabilityStatus?: string | null;
    experienceYears?: number | null;
    verifications?: Array<{ status: string }>;
    skills?: Array<{ skill: { name: string } }>;
  },
  skill?: string,
  location?: string,
) {
  let score = 0;

  if (skill) {
    const matchesSkill = artisan.skills?.some((entry) =>
      entry.skill.name.toLowerCase().includes(skill.toLowerCase()),
    );
    score += matchesSkill ? 30 : 0;
  }

  if (location) {
    const locationText = [artisan.city, artisan.region, artisan.generalLocation].filter(Boolean).join(' ').toLowerCase();
    const matchesLocation = locationText.includes(location.toLowerCase());
    score += matchesLocation ? 20 : 0;
  }

  const approvedVerifications = artisan.verifications?.filter((v) => v.status === 'APPROVED').length ?? 0;
  score += approvedVerifications > 0 ? 25 : 0;

  score += artisan.experienceYears && artisan.experienceYears > 0 ? 15 : 0;

  if (artisan.availabilityStatus === 'AVAILABLE') {
    score += 10;
  }

  return Math.min(score, 100);
}
