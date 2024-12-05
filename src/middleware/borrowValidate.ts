import { group } from "console";
import { NextFunction, Request, Response } from "express";
import { validateHeaderName } from "http";
import Joi, { valid } from "joi";
import { start } from "repl";

const createScheme = Joi.object({
    user_id: Joi.number().required(),
    item_id: Joi.number().required(),
    borrow_date: Joi.date().required(),
    return_date: Joi.date().required()
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

const returnSchema = Joi.object({
    borrow_id: Joi.number().min(1).required(),
    return_date: Joi.date().required(),
});

const returnValidation = (req: Request, res: Response, next: NextFunction): any => {
    const validate = returnSchema.validate(req.body, { abortEarly: false }); // To get all errors
    if (validate.error) {
        return res.status(400).json({
            message: validate.error.details.map(it => it.message).join(", "), // Error messages separated by comma
        });
    }
    next();
};

const usageReport = Joi.object({
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    group_by: Joi.string().valid("category", "location").required()
})

const UsageValidation = (req: Request, res: Response, next: NextFunction): any => {
    const validate = usageReport.validate(req.body, {abortEarly: false })
    if (validate.error) {
        return res.status(400).json({
            message: validate.error.details.map(it => it.message).join(", "),
        })
    }
    next()
}

export {createValidation, returnValidation}