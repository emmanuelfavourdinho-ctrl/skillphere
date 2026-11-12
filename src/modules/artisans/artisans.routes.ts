import { Router } from 'express';
import { validateQuery } from '../../middleware/validate.js';
import { artisanQuerySchema } from './artisans.validation.js';
import { getArtisanById, listArtisans } from './artisans.service.js';

const router = Router();

router.get('/', validateQuery(artisanQuerySchema), async (req, res, next) => {
  try {
    const result = await listArtisans(req.query as any);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const artisan = await getArtisanById(req.params.id);
    res.status(200).json(artisan);
  } catch (error) {
    next(error);
  }
});

export default router;
