import { user_role } from "@prisma/client"
import { NextFunction, Request, Response } from "express"
import Joi from "joi"

//Create a rule/schema for add new User
const createScheme = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    user_role: Joi.string().valid("Admin", "User").required()
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

//Create a rule/ schema for change new user
const updateScheme = Joi.object({
    username: Joi.string().optional(),
    password: Joi.string().optional(),
    user_role: Joi.string().valid("Admin", "User").optional()
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

const authSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
})

const authValidation = (req: Request, res: Response, next: NextFunction): any => {
    const validate = authSchema.validate(req.body)

    if(validate.error) {
        return res.status(400)
            .json({
                message: validate.error.details.map(it => it.message).join()
            })
    }
    next()
}

export{createValidation, updateValidation, authValidation}