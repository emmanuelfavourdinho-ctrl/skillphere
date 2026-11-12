import argon2 from 'argon2';
import prisma from '../../database/prisma.js';
import { AppError, ValidationError } from '../../lib/errors.js';

export async function registerUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'CUSTOMER' | 'ARTISAN';
}) {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new ValidationError('A user with this email already exists.');
  }

  const passwordHash = await argon2.hash(data.password);

  return prisma.user.create({
    data: {
      email: data.email,
      phone: data.phone ?? null,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role ?? 'CUSTOMER',
      accountStatus: 'ACTIVE',
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      accountStatus: true,
      createdAt: true,
    },
  });
}

export async function registerArtisan(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
  city: string;
  region: string;
  skill: string;
  phone?: string;
}) {
  const user = await registerUser({
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    role: 'ARTISAN',
  });

  const result = await prisma.$transaction(async (tx) => {
    const artisanProfile = await tx.artisanProfile.create({
      data: {
        userId: user.id,
        businessName: data.businessName,
        city: data.city,
        region: data.region,
        availabilityStatus: 'AVAILABLE',
        profileCompleteness: 0.5,
      },
    });

    const category = await tx.category.upsert({
      where: { slug: 'general-services' },
      update: {},
      create: { name: 'General Services', slug: 'general-services', description: 'General trade and service categories' },
    });

    const skill = await tx.skill.upsert({
      where: { slug: data.skill.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        categoryId: category.id,
        name: data.skill,
        slug: data.skill.toLowerCase().replace(/\s+/g, '-'),
      },
    });

    await tx.artisanSkill.create({
      data: {
        artisanProfileId: artisanProfile.id,
        skillId: skill.id,
        proficiencyLevel: 'BEGINNER',
        yearsOfExperience: 1,
        verificationStatus: 'PENDING',
      },
    });

    return { user, artisanProfile, skill };
  });

  return {
    id: result.user.id,
    email: result.user.email,
    role: result.user.role,
    artisanProfileId: result.artisanProfile.id,
    skill: result.skill.name,
  };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const passwordMatches = await argon2.verify(user.passwordHash, password);
  if (!passwordMatches) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (user.accountStatus !== 'ACTIVE') {
    throw new AppError('This account is not active. Please contact support.', 403);
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}
