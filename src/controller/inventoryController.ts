import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client"
import { date } from "joi";

const prisma = new PrismaClient({ errorFormat: "minimal" })

const createInventory = async (req: Request, res: Response): Promise<any> => {
    try {
        const name: string = req.body.name
        const category: string = req.body.category
        const location: string = req.body.location
        const quantity: number = Number(req.body.quantity)

        const newInventory = await prisma.inventory.create({
            data: {
                name,
                category,
                location,
                quantity
            }
        })
        return res.status(200).json({
            status: `Sucess`,
            message: `Barang berhasil ditambahkan`,
            data: newInventory
        })
    } catch (error) {
        return res.status(500).json(error)
    }
}

const readInventory = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = Number(req.params.id);

        // Cari inventory berdasarkan id
        const inventory = await prisma.inventory.findFirst({
            where: { id: id }
        });

        if (!inventory) {
            return res.status(404).json({
                message: `Inventory tidak ditemukan`
            })
        }

        return res.status(200).json({
            status: "success",
            message: `Inventory berhasil ditemukan.`,
            data: inventory,
        });
    } catch (error) {
        return res.status(500).json(error)
    }
}

const updateInventory = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = req.params.id

        const findInventory = await prisma.inventory.findFirst({
            where: { id: Number(id) }
        })

        if (!findInventory) {
            return res.status(200).json({
                message: `Inventory is not found`
            })
        }
        const { name, category, location, quantity } = req.body

        //update material
        const saveInventory = await prisma.inventory.update({
            where: { id: Number(id) }, data: {
                name: name ? name : findInventory.name,
                category: category ? category : findInventory.category,
                location: location ? location : findInventory.location,
                quantity: quantity ? quantity : findInventory.quantity
            }
        })
        return res.status(200).json({
            message: `Material has been updated`,
            data: saveInventory
        })
    } catch (error) {
        return res.status(500).json(error)
    }
}

const deleteInventory = async (req: Request, res: Response): Promise<any> => {
    try {
        const id = req.params.id

        const findInventory = await prisma.inventory.findFirst({
            where: { id: Number(id) }
        })

        if (!findInventory) {
            return res.status(200).json({
                message: `Barang tidak ditemukan`
            })
        }

        const saveInventory = await prisma.inventory.delete({
            where: { id: Number(id ) } 
        })

        return res.status(200).json({
            status: `Sucess`,
            message: `Barang berhasil dihapus`,
            data: saveInventory
        })
        
    } catch (error) {
        return res.status(200).json(error)
    }
}



export {createInventory, readInventory, updateInventory, deleteInventory}