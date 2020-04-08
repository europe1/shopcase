-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 08, 2020 at 10:38 AM
-- Server version: 10.1.37-MariaDB
-- PHP Version: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `shopcase_manager`
--

-- --------------------------------------------------------

--
-- Table structure for table `objects`
--

CREATE TABLE `objects` (
  `id` int(11) NOT NULL,
  `uid` int(11) NOT NULL,
  `name` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `path` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `upload_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `objects`
--

INSERT INTO `objects` (`id`, `uid`, `name`, `path`, `upload_time`) VALUES
(4, 1566918454, 'iphone.glb', 'shopcase_files/objects/iphone.glb', '2019-08-27 15:07:34'),
(5, 1566984530, 'test.glb', 'shopcase_files/objects/test.glb', '2019-08-28 09:28:50');

-- --------------------------------------------------------

--
-- Table structure for table `object_options`
--

CREATE TABLE `object_options` (
  `id` int(11) NOT NULL,
  `object_id` int(11) NOT NULL,
  `object3d` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mat_name` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `object_options`
--

INSERT INTO `object_options` (`id`, `object_id`, `object3d`, `mat_name`, `option_id`) VALUES
(19, 4, 'Mesh.067_0', 'Material.001', 4),
(20, 4, 'Mesh.067_0', 'Material.001', 5),
(21, 4, 'Mesh.067_2', 'Material.002', 4);

-- --------------------------------------------------------

--
-- Table structure for table `options`
--

CREATE TABLE `options` (
  `id` int(11) NOT NULL,
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` int(1) NOT NULL,
  `path` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `upload_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `options`
--

INSERT INTO `options` (`id`, `name`, `type`, `path`, `upload_time`) VALUES
(4, 'ÐÐµÐ¿Ñ€Ð¸ÑÑ‚ÐµÐ»ÑŒ', 1, '124, 57, 226, 1', '2019-08-17 14:53:46'),
(5, 'Ð“Ñ€ÑÐ·Ð½Ñ‹Ð¹ Ð¼ÐµÑ‚Ð°Ð»Ð»', 0, 'shopcase_files/images/Dirty_metal_weave_01_2K_Base_Color.png', '2019-08-28 09:17:33');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`) VALUES
(1, 'shopcase1', '$2y$10$x5U.f3ahrJMw27feKFvLpuOmVH3NzCPb52KU4FeJZram/br4d5wt.');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `objects`
--
ALTER TABLE `objects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uid` (`uid`);

--
-- Indexes for table `object_options`
--
ALTER TABLE `object_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `object_del` (`object_id`),
  ADD KEY `option_del` (`option_id`);

--
-- Indexes for table `options`
--
ALTER TABLE `options`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `objects`
--
ALTER TABLE `objects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `object_options`
--
ALTER TABLE `object_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `options`
--
ALTER TABLE `options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `object_options`
--
ALTER TABLE `object_options`
  ADD CONSTRAINT `object_del` FOREIGN KEY (`object_id`) REFERENCES `objects` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `option_del` FOREIGN KEY (`option_id`) REFERENCES `options` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
