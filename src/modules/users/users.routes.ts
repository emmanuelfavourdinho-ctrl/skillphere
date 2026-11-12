import { Router } from 'express';
import prisma from '../../database/prisma.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/me', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      accountStatus: true,
      artisanProfile: true,
    },
  });

  res.json({ user });
});

export default router;
