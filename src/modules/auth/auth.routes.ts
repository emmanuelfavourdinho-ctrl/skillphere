import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validateBody } from '../../middleware/validate.js';
import { artisanRegistrationSchema, loginSchema, registerSchema } from './auth.validation.js';
import { loginUser, registerArtisan, registerUser } from './auth.service.js';

const router = Router();

router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const user = await registerUser({ ...req.body, role: req.body.role ?? 'CUSTOMER' });
    res.status(201).json({ message: 'Customer account created.', user });
  } catch (error) {
    next(error);
  }
});

router.post('/register/artisan', validateBody(artisanRegistrationSchema), async (req, res, next) => {
  try {
    const artisan = await registerArtisan(req.body);
    res.status(201).json({ message: 'Artisan registration submitted.', artisan });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const user = await loginUser(req.body.email, req.body.password);
    req.session.userId = user.id;
    req.session.role = user.role;
    await new Promise<void>((resolve, reject) => {
      req.session.save((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    res.status(200).json({ message: 'Login successful.', user });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticate, async (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: 'Logout successful.' });
  });
});

router.get('/me', authenticate, async (req, res) => {
  res.status(200).json({ user: req.user });
});

router.get('/admin-check', authenticate, authorize('ADMIN'), (_req, res) => {
  res.json({ ok: true, role: 'ADMIN' });
});

export default router;
