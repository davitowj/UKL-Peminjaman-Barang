-- AlterTable
ALTER TABLE `users` ADD COLUMN `user_role` ENUM('Admin', 'User') NOT NULL DEFAULT 'User';

-- CreateTable
CREATE TABLE `borrowReturn` (
    `return_id` INTEGER NOT NULL AUTO_INCREMENT,
    `borrow_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL DEFAULT 0,
    `item_id` INTEGER NOT NULL DEFAULT 0,
    `actual_return_date` DATETIME(3) NOT NULL,

    UNIQUE INDEX `borrowReturn_borrow_id_key`(`borrow_id`),
    PRIMARY KEY (`return_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `borrowReturn` ADD CONSTRAINT `borrowReturn_borrow_id_fkey` FOREIGN KEY (`borrow_id`) REFERENCES `borrow`(`borrow_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `borrowReturn` ADD CONSTRAINT `borrowReturn_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `borrowReturn` ADD CONSTRAINT `borrowReturn_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `Inventory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
