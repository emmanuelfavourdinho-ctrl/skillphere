const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'
).replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

async function getCsrfToken() {
  const response = await fetch(`${API_BASE_URL}/csrf-token`, {
    credentials: 'include',
  });
  const payload = (await response.json()) as { csrfToken?: string; message?: string };

  if (!response.ok || !payload.csrfToken) {
    throw new ApiError(payload.message ?? 'Could not start a secure request.', response.status);
  }

  return payload.csrfToken;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const headers = new Headers(options.headers);
  let body: BodyInit | undefined;

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    headers.set('X-CSRF-Token', await getCsrfToken());
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers,
    body,
    credentials: 'include',
  });

  const payload = (await response.json()) as { message?: string } & T;
  if (!response.ok) {
    throw new ApiError(payload.message ?? `Request failed (${response.status}).`, response.status);
  }

  return payload;
}

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'ARTISAN' | 'ADMIN' | 'MODERATOR';
};

export type Artisan = {
  id: string;
  businessName: string | null;
  bio: string | null;
  profileImage: string | null;
  experienceYears: number | null;
  city: string | null;
  region: string | null;
  generalLocation: string | null;
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  skills: Array<{
    skill: { name: string };
    verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  }>;
  verifications: Array<{ status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' }>;
};

export type ArtisanSearchResult = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  data: Artisan[];
};
