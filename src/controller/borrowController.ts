import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    errorFormat: "minimal"
});

const createBorrow = async (req: Request, res: Response): Promise<any> => {
    try {
        const { user_id, item_id } = req.body
        const borrow_date : Date = new Date(req.body.borrow_date)
        const return_date : Date = new Date(req.body.return_date)

        const findUser = await prisma.users.findFirst({
            where: { id: user_id }
        })

        if(!findUser) {
            res.status(404).json({ 
                message: "User not found" 
            })
            return
        }

        const findItem = await prisma.inventory.findFirst({
            where: { id: item_id }
        })

        if(!findItem) {
            res.status(404).json({
                message: "Item not found"
            })
            return
        }

        const borrow = await prisma.borrow.create({
            data: {
                user_id: user_id,
                item_id: item_id,
                borrow_date,
                return_date
            }
        })

        res.status(201).json({
            status: `succes`,
            message: `Peminjaman berhasil dicatat`,
            data: borrow
        })
    } catch (error) {
        res.status(500).json(error)
        console.log(error)
    }
}


const borrowReturn = async (req: Request, res: Response): Promise<any> => {
    try {
        const borrow_id = req.body.borrow_id

        const findBorrow = await prisma.borrow.findFirst({
            where: { borrow_id: Number(borrow_id) }
        })

        if(!findBorrow) {
            return res.status(404).json({
                message: "Peminjaman not found"
            })
        }

        const return_date : Date = new Date(req.body.return_date)

        const createReturn = await prisma.borrowReturn.create({
            data: {
                borrow_id: Number(borrow_id),
                actual_return_date: return_date,
                user_id: findBorrow.user_id,
                item_id: findBorrow.item_id
            }
        })

        res.status(200).json({
            status: `succes`,
            message: `Pengembalian berhasil`,
            data: createReturn
        })
    } catch (error) {
        res.status(500).json(error)
        console.log(error)
    }
}


const analyzeUsage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { start_date, end_date, group_by } = req.body;

        // Ambil data BorrowRecord sesuai tanggal
        const borrowData = await prisma.borrow.findMany({
            where: {
                borrow_date: {
                    gte: new Date(start_date),
                    lte: new Date(end_date),
                },
            },
            include: {
                inventory: true
            },
        });

        const returnData = await prisma.borrowReturn.findMany({
            where: {
                actual_return_date: {
                    gte: new Date(start_date),
                    lte: new Date(end_date),
                },
            },
        });

        // Grup data berdasarkan `group_by`
        const groupedData = borrowData.reduce((acc: Record<string, any>, borrow) => {
            const group = borrow.inventory[group_by as keyof typeof borrow.inventory] as string; // Type assertion
            if (!acc[group]) {
                acc[group] = {
                    group,
                    total_borrowed: 0,
                    total_returned: 0,
                    items_in_use: 0,
                };
            }

            acc[group].total_borrowed++;
            if (returnData.some((r) => r.borrow_id === borrow.borrow_id)) {
                acc[group].total_returned++;
            } else {
                acc[group].items_in_use++;
            }

            return acc;
        }, {});

        // Ubah objek menjadi array
        const usageAnalysis = Object.values(groupedData);

        // Format respons
        res.status(200).json({
            status: "success",
            data: {
                analysis_period: {
                    start_date,
                    end_date,
                },
                usage_analysis: usageAnalysis,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
};

const borrowAnalysis = async (req: Request, res: Response): Promise<any> => {
    try {
        const { start_date, end_date } = req.body;

        // Validasi input tanggal
        if (!start_date || !end_date) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        // Barang paling sering dipinjam
        const frequentlyBorrowed = await prisma.borrow.groupBy({
            by: ['item_id'],
            _count: { item_id: true },
            where: {
                borrow_date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                _count: { item_id: 'desc' },
            },
            take: 5, // Batasi pada top 5 barang
        });

        // Ambil detail barang untuk barang paling sering dipinjam
        const frequentlyBorrowedItems = await Promise.all(
            frequentlyBorrowed.map(async (borrow) => {
                const item = await prisma.inventory.findUnique({
                    where: { id: borrow.item_id },
                });
                return {
                    item_id: borrow.item_id,
                    name: item?.name || "Unknown",
                    category: item?.category || "Unknown",
                    total_borrowed: borrow._count.item_id,
                };
            })
        );

        // Barang dengan pengembalian terlambat
        const inefficientItems = await prisma.borrowReturn.groupBy({
            by: ['item_id'],
            _count: { item_id: true },
            where: {
                actual_return_date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                _count: { item_id: 'desc' },
            },
        });

        // Ambil detail barang untuk barang dengan pengembalian terlambat
        const inefficientItemDetails = await Promise.all(
            inefficientItems.map(async (borrow) => {
                const item = await prisma.inventory.findUnique({
                    where: { id: borrow.item_id },
                });
                return {
                    item_id: borrow.item_id,
                    name: item?.name || "Unknown",
                    category: item?.category || "Unknown",
                    total_borrowed: borrow._count.item_id,
                    total_late_returns: borrow._count.item_id, // Jumlah peminjaman terlambat
                };
            })
        );

        res.status(200).json({
            status: "success",
            data: {
                analysis_period: {
                    start_date,
                    end_date,
                },
                frequently_borrowed_items: frequentlyBorrowedItems,
                inefficient_items: inefficientItemDetails,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error", error });
    }
};

export { createBorrow, borrowReturn, analyzeUsage, borrowAnalysis};