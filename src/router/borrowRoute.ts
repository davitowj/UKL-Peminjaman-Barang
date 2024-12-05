import { Router } from "express";
import {createBorrow, borrowReturn, analyzeUsage, borrowAnalysis} from "../controller/borrowController"
import { verifyToken } from "../middleware/authorization";
import { createValidation, returnValidation} from "../middleware/borrowValidate";


const router = Router()

router.post(`/inventory/borrow`,[createValidation], createBorrow)

router.post(`/inventory/return`, [returnValidation], borrowReturn)

router.post(`/inventory/usage-report`,[verifyToken], analyzeUsage)

router.post(`/inventory/borrow-analysis/`, [verifyToken], borrowAnalysis)

export default router