import { NextFunction, Request, Response } from "express";
import Joi, { valid } from "joi";

const createScheme = Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required(),
    location: Joi.string().required(),
    quantity: Joi.number().required()
})

const createValidation = (req: Request, res: Response, next: NextFunction): any => {
    const validate = createScheme.validate(req.body)

    if(validate.error){
        return res.status(400).json({
            message: validate
            .error
            .details
            .map(item => item.message)
            .join()
        })
    }
    next()
}

const updateScheme = Joi.object({
    name: Joi.string().optional(),
    category: Joi.string().optional(),
    location: Joi.string().optional(),
    quantity: Joi.number().optional()
})

const updateValidation = (req: Request, res: Response, next: NextFunction): any => {
    const validate = updateScheme.validate(req.body)
    if (validate.error) {
        return res.status(400).json({
            message: validate
                .error
                .details
                .map(item => item.message)
                .join()
        })
    }
    next()
}

export {createValidation, updateValidation}