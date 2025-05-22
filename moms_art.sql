-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 20, 2025 at 08:44 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `moms_art`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `name`, `email`, `password`) VALUES
(1, 'Siraj', 'siraj@gmail.com', '$2b$10$5dy5U9kc1IsSrcYw0hr1buiew6qvLagyvQIZzT4NIHp1AhpXwqvLS'),
(2, 'Yangki', 'yangki@gmail.com', '$2b$10$5dy5U9kc1IsSrcYw0hr1buiew6qvLagyvQIZzT4NIHp1AhpXwqvLS');

-- --------------------------------------------------------

--
-- Table structure for table `newsletter`
--

CREATE TABLE `newsletter` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subscribed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `newsletter`
--

INSERT INTO `newsletter` (`id`, `email`, `subscribed_at`) VALUES
(1, 'Yangkeeytshering57@gmail.com', '2025-05-17 18:54:50'),
(2, 'Yangkeeytshering57@gmail.com', '2025-05-18 07:37:51');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `date_uploaded` datetime DEFAULT current_timestamp(),
  `rating` decimal(3,2) DEFAULT 0.00,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `price`, `date_uploaded`, `rating`, `image`) VALUES
(1, '7 Wrap Stripes', 'Women', 11999.00, '2025-01-10 10:00:00', 4.50, '/productimage/p1.png'),
(2, '5 Wrap Stripes', 'Men', 10549.00, '2025-05-09 11:15:00', 4.00, '/productimage/p2.png'),
(3, '3 Wrap Stripes', 'Women', 5199.00, '2025-05-08 09:30:00', 3.80, '/productimage/p3.png'),
(4, 'Mixed Pattern Kira', 'Women', 22259.00, '2025-05-07 14:45:00', 4.70, '/productimage/p4.png'),
(5, '3 Wrap Stripes', 'Women', 5299.00, '2025-05-06 16:00:00', 3.90, '/productimage/p5.png'),
(6, '3 Wrap Stripes Kira', 'Women', 4999.00, '2025-05-05 08:20:00', 4.10, '/productimage/p6.png'),
(7, '5 Wrap Stripes Gho', 'Men', 16999.00, '2025-05-04 12:10:00', 4.30, '/productimage/p7.png'),
(8, '7 Wrap Stripes Silk', 'Men', 19999.00, '2025-05-03 13:55:00', 4.60, '/productimage/p8.png'),
(9, 'Cotton Kira', 'Women', 18999.00, '2025-05-02 15:30:00', 4.20, '/productimage/p9.png'),
(10, 'Shinglo Sersho', 'Men', 15549.00, '2025-05-01 17:45:00', 3.70, '/productimage/p10.png'),
(11, 'Silk coffee colour) ', 'Women', 25199.00, '2025-04-30 10:05:00', 4.80, '/productimage/p11.png'),
(12, 'Kishuthara', 'Women', 222259.00, '2025-04-29 11:30:00', 5.00, '/productimage/p12.png'),
(13, 'Jabgangma', 'Women', 5299.00, '2025-04-28 14:00:00', 3.60, '/productimage/p13.png'),
(14, 'Pure Silk Kira', 'Men', 4999.00, '2025-04-27 09:15:00', 4.00, '/productimage/p14.png'),
(15, '5 Wrap Stripes', 'Men', 16999.00, '2025-04-26 16:45:00', 4.40, '/productimage/p15.png'),
(16, 'Pure Silk Gho', 'Men', 19999.00, '2025-04-25 12:00:00', 4.50, '/productimage/p16.png'),
(17, 'Eterna long dress red', 'Women', 17999.00, '2025-04-24 10:30:00', 4.30, '/productimage/p17.jpg'),
(18, 'Elegant Brocade Kira', 'Women', 5499.00, '2025-04-23 11:45:00', 3.90, '/productimage/p18.jpg'),
(19, 'Festive Woven kira', 'Women', 18999.00, '2025-04-22 15:20:00', 4.20, '/productimage/p19.jpg'),
(20, 'Silk Blend Kira', 'Women', 4599.00, '2025-04-21 13:00:00', 3.80, '/productimage/p20.jpg'),
(21, 'Traditional Bhutan Scarf', 'Accessories', 15999.00, '2025-04-20 16:00:00', 4.00, '/productimage/p21.jpg'),
(22, 'Floral Silk Rachu', 'Accessories', 4899.00, '2025-04-19 10:45:00', 4.10, '/productimage/p22.jpg'),
(23, 'Minimal Stripe Belt', 'Accessories', 14999.00, '2025-04-18 09:30:00', 4.00, '/productimage/p23.jpg'),
(24, 'Royal Blue Belt', 'Accessories', 5799.00, '2025-04-17 14:15:00', 4.20, '/productimage/p24.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zip` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `street`, `city`, `state`, `zip`, `country`) VALUES
(2, 'ss', 's@1', '$2b$10$VLQ3tp1BItnEwEeFMrSajOL.ghCEYTwzgCf4VV/DZk2Qbe4aeDT0.', NULL, NULL, NULL, NULL, NULL),
(3, 'ty', 'ty1@gmail.com', '$2b$10$0v4UlnBCT/Ab.Wr/ZgIGLuyAe66I172ld9uvGtciROSD81jkncHZ6', NULL, NULL, NULL, NULL, NULL),
(4, 'tshe', 'tshe1@gmail.com', '$2b$10$Vht03rpuBpvF5V4TJjFViOlwBDHoAavQIvpopQ2KazocESgg./dDW', NULL, NULL, NULL, NULL, NULL),
(5, 'yang', 'yang@1', '$2b$10$IYPAEe8E0V/Sz5ommn7ayOzkNH5odVp6uMJ8/lhgiFRdqkpjyvTkK', NULL, NULL, NULL, NULL, NULL),
(6, 'u', 'u@1', '$2b$10$JNYj700QCOxlnYolGAJJ2ePVPFPgI0RVe2wFZz8QU0i3bsqHzcKc2', NULL, NULL, NULL, NULL, NULL),
(7, 'daza', 'daza@1', '$2b$10$NX.bMT8WQjQojuVEmF8cvuNyK3Yguiq1BcBIPwmuY8KtqG0QUqLVe', NULL, NULL, NULL, NULL, NULL),
(8, 'Tshering', 'Tshering@1gmail.com', '$2b$10$qoU.FCAeL9tuA/9ZhgTsrOtz.7BkW9nDpIXrdKJXOyf3mXW2pRiDi', NULL, NULL, NULL, NULL, NULL),
(9, 'Yangki', 'Yangki1@gmail.com', '$2b$10$o0AJRuAqbj6EMUng5Qay8OhMujK2Lfg1QswumXZGA5rv96/e.3mp2', NULL, NULL, NULL, NULL, NULL),
(10, 'Sangay', 'Sangay1@gmail.com', '$2b$10$IDh0nlfBheyiebUMvcWoiOK5yOX7jZUf5Drjom1XcihTrCDr5XOGW', NULL, NULL, NULL, NULL, NULL),
(11, 'yang', 'y@2', '$2b$10$1V3lgLwVjEzOHS5DIS0qKe1t4B5GMRKjN8eMknHwaPgC./QGerHHG', '42 Telopea Lane, wembley WA, Australia', 'wembley', 'WA', '6014', 'Australia'),
(12, 'Tshering Yangki', 'Yangkeeytshering57@gmail.com', '$2b$10$gc6fQsqdIQ8MiwhmV.qCVuOwiGbibEuEugN55y8BirwY1PqVlnakO', NULL, NULL, NULL, NULL, NULL),
(13, 't', 't@1', '$2b$10$7pf6qxuuScDcwlGRNq4d1OpuN9vWXGuWVqj3Tui4WjfmvWAEsEqhi', '42 Telopea Lane, wembley WA, Australia', 'wembley', 'WA', '6014', 'Australia'),
(14, '4', 't@4', '$2b$10$bYitTktxvuBMn0lnRFGCV.YXCevMkAV9toaHQXPu7ElMA5z5oXsY6', NULL, NULL, NULL, NULL, NULL),
(15, 'i@2', 'i@2', '$2b$10$hbzlYEaXFADlN/Q0.nIQZOSEVLcnuSy6ntVO.DhNUuNnaoaa9y0L.', '42 Telopea Lane, wembley WA, Australia', 'wembley', 'WA', '6014', 'Australia'),
(16, 'q', 'q@1', '$2b$10$fYnPrVp5kG6xi1dh68a9O.Sh/XB/KXNf7fuVqzT0zTG3AuZzjpRyq', NULL, NULL, NULL, NULL, NULL),
(17, 'a', 'a@1', '$2b$10$wx8G715q6RvJ5Fjy6gZ.yel4n3ETTVVxn/ibfZguHVmUANJ6VPJvy', NULL, NULL, NULL, NULL, NULL),
(18, 'yang', 'yang@123', '$2b$10$t6Z/pKP5Fk8RZZJycXo7ee6oFTUTknvRebPHtIRBpIy1K8UuX/J5i', '42/71 Herdsman parade', 'wembley', 'WA', '6014', 'Australia');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `newsletter`
--
ALTER TABLE `newsletter`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
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
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `newsletter`
--
ALTER TABLE `newsletter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
