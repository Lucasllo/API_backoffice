-- Demo iFarma. Copie estes valores; não há senha no .env.example.
-- Entregador: entregador.demo@example.com / Entrega1!
-- Operador: operador.demo@example.com / Entrega1! / storeCode 2312
-- Pedido: 1 / verificationCode 4821
CREATE DATABASE IF NOT EXISTS `ifarma` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ifarma`;
-- @schema

CREATE TABLE IF NOT EXISTS `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(63) NOT NULL,
  `email` varchar(127) NOT NULL,
  `birthAt` date NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `role` int NOT NULL DEFAULT 1,
  `cpf` varchar(255) NOT NULL,
  `numero` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `userbackoffice` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(63) NOT NULL,
  `email` varchar(127) NOT NULL,
  `validatedEmail` tinyint NOT NULL,
  `password` varchar(127) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `role` varchar(255) NOT NULL,
  `userAuthorized` int NOT NULL,
  `phoneNumber` varchar(11) NOT NULL,
  `storeCode` varchar(255) NOT NULL,
  `active` tinyint NOT NULL DEFAULT 1,
  `authorized` tinyint NOT NULL DEFAULT 0,
  `validCode` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_userbackoffice_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `userdelivery` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(63) NOT NULL,
  `email` varchar(127) NOT NULL,
  `validatedEmail` tinyint NOT NULL,
  `password` varchar(127) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `role` varchar(255) NOT NULL,
  `phoneNumber` varchar(11) NOT NULL,
  `cpf` varchar(11) NOT NULL,
  `numberVehicle` varchar(255) NOT NULL,
  `acceptTerms` tinyint NOT NULL,
  `active` tinyint NOT NULL DEFAULT 0,
  `validCode` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_userdelivery_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `shoppings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `storeAddress` varchar(255) NOT NULL,
  `deliveryAddress` varchar(255) NOT NULL,
  `deliveryTime` varchar(255) NOT NULL,
  `duration` varchar(255) NOT NULL,
  `status` int NOT NULL DEFAULT 1,
  `verificationCode` varchar(255) NOT NULL,
  `storeCode` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `modoPagamento` int NOT NULL DEFAULT 1,
  `userEntityId` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_shoppings_userEntityId` (`userEntityId`),
  CONSTRAINT `FK_shoppings_userEntityId` FOREIGN KEY (`userEntityId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `deliveryqueue` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `status` int NOT NULL DEFAULT 1,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `userDeliveryId` int unsigned NOT NULL,
  `shoppingId` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_deliveryqueue_userDeliveryId` (`userDeliveryId`),
  KEY `IDX_deliveryqueue_shoppingId` (`shoppingId`),
  CONSTRAINT `FK_deliveryqueue_userDeliveryId` FOREIGN KEY (`userDeliveryId`) REFERENCES `userdelivery` (`id`),
  CONSTRAINT `FK_deliveryqueue_shoppingId` FOREIGN KEY (`shoppingId`) REFERENCES `shoppings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

START TRANSACTION;
DELETE FROM `deliveryqueue` WHERE `shoppingId` = 1 OR `userDeliveryId` = 1;
DELETE FROM `shoppings` WHERE `id` = 1;
DELETE FROM `userdelivery` WHERE `id` = 1;
DELETE FROM `userbackoffice` WHERE `id` = 1;
DELETE FROM `users` WHERE `id` = 1;
INSERT INTO `users` (`id`, `name`, `email`, `birthAt`, `createdAt`, `updatedAt`, `role`, `cpf`, `numero`) VALUES (1, 'Cliente Demo', 'cliente.demo@example.com', NULL, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), 1, '00000000000', '0');
INSERT INTO `userbackoffice` (`id`, `name`, `email`, `validatedEmail`, `password`, `createdAt`, `updatedAt`, `role`, `userAuthorized`, `phoneNumber`, `storeCode`, `active`, `authorized`, `validCode`) VALUES (1, 'Operador Demo', 'operador.demo@example.com', 1, '$2b$10$l8NjzXTt.61KYtXhFxjdROgyAuywnqx8Rl8XRI5x9zoVQ2lK/u0zG', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), '1', 0, '00000000000', '2312', 1, 1, 0);
INSERT INTO `userdelivery` (`id`, `name`, `email`, `validatedEmail`, `password`, `createdAt`, `updatedAt`, `role`, `phoneNumber`, `cpf`, `numberVehicle`, `acceptTerms`, `active`, `validCode`) VALUES (1, 'Entregador Demo', 'entregador.demo@example.com', 1, '$2b$10$l8NjzXTt.61KYtXhFxjdROgyAuywnqx8Rl8XRI5x9zoVQ2lK/u0zG', CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6), '4', '00000000000', '00000000000', 'DEMO-000', 1, 1, 0);
INSERT INTO `shoppings` (`id`, `storeAddress`, `deliveryAddress`, `deliveryTime`, `duration`, `status`, `verificationCode`, `storeCode`, `value`, `modoPagamento`, `userEntityId`) VALUES (1, 'Rua das Acácias, 100', 'Rua do Comércio, 50', '30 min', '15 min', 6, '4821', '2312', '42.00', 1, 1);
COMMIT;
