import { Request, Response, NextFunction } from "express";
import { PrismaClient, user_role } from "@prisma/client";
import Joi from "joi";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

//create object of prisma
const prisma = new PrismaClient({ errorFormat: "minimal" })
const createUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const username:string = req.body.username
        const password: string = req.body.password
        const user_role: user_role = req.body.user_role

        const findUsername = await prisma.users.findFirst({ where: {username}})

        if (findUsername){
            return res.status(400).json({message: `Username Sudah Ada`})
        }

        const hashPassword = await bcrypt.hash(password, 12)
        //save a new user to db
        const saveUser = await prisma.users.create({
            data: {
                username, 
                password: hashPassword,
                user_role
            }
        })
        return res.status(200).json({
            message: `New User Has Been Created`,
            data:saveUser
        })
    } catch (error) {
        return res.status(500).json(error)
    }
}

const readUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = Number(req.params.id);

        // Cari inventory berdasarkan id
        const user = await prisma.users.findFirst({
          where: {id: id}
        });

        if (!user) {
            return res.status(404).json({
                message: `User tidak ditemukan`
            })
        }

        return res.status(200).json({
            status: "success",
            message: `User berhasil ditemukan.`,
            data: user,
        });
    } catch (error) {
        return res.status(500).json(error)
    }
}


const updateUser = async (req: Request, res: Response): Promise<any> => {
    try {
        //read id user that sent at params URL
        const id = req.params.id
        
        //check existing cake based on id
        const findUser = await prisma.users.findFirst({
            where: { id: Number(id) }
        })

        if (!findUser) {
            return res.status(404).json({
                message: 'User is not found'
            })
        }

        //Read a property of user from req.body
        const { username, password, user_role} = req.body

        //Update User
        const saveUser = await prisma.users.update({
            where: { id: Number(id) }, 
            data: {
                username: username ?? findUser.username,
                password: password? await bcrypt.hash(password, 12): findUser.password,
                user_role: user_role ?? findUser.user_role
            }
        })

        return res.status(200).json({
            message: 'User has been updated',
            data: saveUser
        })
    } catch (error) {
        return res.status(500).json(error)
    }
}

const deleteUser = async (req: Request, res: Response): Promise <any> => {
    try {
        // read id of user from request parameter
        const id = req.params.id
        //check exicting user
        const findUser = await prisma.users.findFirst({
            where: { id: Number(id) }
        })

        if (!findUser) {
            return res.status(200).json({
                message: 'User is not found'
            })
        }

        //delete user
        const saveUser = await prisma.users.delete({
            where: { id: Number(id) }
        })

        return res.status(200).json({
            message: 'User has been removed',
            data: saveUser
        })
    } catch (error) {
        return res.status(200).json(error)
    }
}

const authentication = async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, password } = req.body;

        // Cari user berdasarkan username
        const findUser = await prisma.users.findFirst({ where: { username } });
        if (!findUser) {
            return res.status(404).json({ message: "Username not registered" });
        }

        // Periksa password
        const isMatchPassword = await bcrypt.compare(password, findUser.password);
        if (!isMatchPassword) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        // Tentukan payload berdasarkan role
        const payload = {
            username: findUser.username,
            role: findUser.user_role
        };

        const signature = process.env.SECRET || ``;

        // Buat token
        const token = Jwt.sign(payload, signature, { expiresIn: "1d" });

        return res.status(200).json({
            status: "Success",
            logged: true,
            token,
            id: findUser.id,
            username: findUser.username,
            role: findUser.user_role,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Authentication failed", error });
    }
};

export { createUser, readUser, updateUser, deleteUser, authentication}