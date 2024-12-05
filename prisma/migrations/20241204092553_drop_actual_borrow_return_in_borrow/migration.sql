/*
  Warnings:

  - You are about to drop the column `actual_return_date` on the `borrow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `borrow` DROP COLUMN `actual_return_date`,
    ALTER COLUMN `borrow_date` DROP DEFAULT,
    ALTER COLUMN `return_date` DROP DEFAULT;
