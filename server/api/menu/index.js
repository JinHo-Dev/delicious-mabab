import 'express-async-errors'
import { Router } from 'express'
import * as controller from './menu.controller'
import * as auth from '../../auth/auth.service'

import upload from '../../upload'

const router = Router();

router.get('/', auth.isAuthenticated(), controller.index)
router.get('/category/:categoryId', auth.isAuthenticated(), controller.indexByCategory)
router.get('/:id', auth.isAuthenticated(), controller.show)
router.delete('/:id', auth.hasRole('admin'), controller.destroy)
router.put('/:id', auth.hasRole('admin'), upload.single('imagefile'), controller.change)
router.post('/', auth.hasRole('admin'), upload.single('file'), controller.create)

export default router;
