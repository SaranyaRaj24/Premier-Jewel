-- DropForeignKey
ALTER TABLE `customer_order` DROP FOREIGN KEY `customer_order_customer_id_fkey`;

-- DropForeignKey
ALTER TABLE `product_multiple_images` DROP FOREIGN KEY `product_multiple_images_customer_order_id_fkey`;

-- DropIndex
DROP INDEX `customer_order_customer_id_fkey` ON `customer_order`;

-- DropIndex
DROP INDEX `product_multiple_images_customer_order_id_fkey` ON `product_multiple_images`;

-- AddForeignKey
ALTER TABLE `customer_order` ADD CONSTRAINT `customer_order_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_multiple_images` ADD CONSTRAINT `product_multiple_images_customer_order_id_fkey` FOREIGN KEY (`customer_order_id`) REFERENCES `customer_order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
