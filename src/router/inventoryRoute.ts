import { Router } from "express";
import {createInventory, readInventory, updateInventory, deleteInventory} from "../controller/inventoryController"
import {createValidation, updateValidation} from "../middleware/inventoryValidate"
import { verifyToken } from "../middleware/authorization";


const router = Router()

router.post(`/inventory`,[verifyToken, createInventory], createInventory)

router.get(`/inventory/:id`, readInventory)

router.put(`/inventory/:id`, [verifyToken, updateValidation], updateInventory)

router.delete(`/inventory/:id`, [verifyToken], deleteInventory)

export default router