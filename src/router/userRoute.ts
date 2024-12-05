import {Router} from "express";
import {createUser, readUser, updateUser, deleteUser, authentication} from "../controller/userController"
import {createValidation, updateValidation} from "../middleware/usersValidate"
import { authValidation } from "../middleware/usersValidate"

const router = Router()

router.post(`/`,[createValidation], createUser)

router.get(`/:id`, readUser)

router.put(`/:id`,[updateValidation], updateUser)

router.delete(`/:id`, deleteUser)

router.post(`/auth/login`, [authValidation], authentication)

export default router