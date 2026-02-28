-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: campus_lost_found
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category` varchar(20) NOT NULL DEFAULT 'Lost',
  `description` text NOT NULL,
  `status` varchar(20) DEFAULT 'lost',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `location` varchar(255) DEFAULT NULL,
  `item_date` date DEFAULT NULL,
  `contact_info` varchar(100) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,'Lost Wallet','Lost','Black leather wallet near library','lost','2026-02-26 11:40:48',NULL,NULL,NULL,NULL,NULL),(2,'Found Umbrella','Lost','Blue umbrella in cafeteria','found','2026-02-26 11:40:48',NULL,NULL,NULL,NULL,NULL),(3,'Lost Keys','Lost','Set of car keys in parking lot','lost','2026-02-26 11:40:48',NULL,NULL,NULL,NULL,NULL),(4,'Lost Wallet','Lost','Black leather wallet near library','lost','2026-02-26 11:41:50',NULL,NULL,NULL,NULL,NULL),(5,'Found Umbrella','Lost','Blue umbrella in cafeteria','found','2026-02-26 11:41:50',NULL,NULL,NULL,NULL,NULL),(6,'Lost Keys','Lost','Set of car keys in parking lot','lost','2026-02-26 11:41:50',NULL,NULL,NULL,NULL,NULL),(7,'dd','Lost','dddd','Resolved','2026-02-26 12:27:29','ASB,LVL1','2026-02-26','011-36670902',NULL,NULL),(8,'d','Lost','dd','Claimed','2026-02-26 12:31:59','ASB,LVL1','2026-02-26','011-36670902',NULL,NULL),(9,'d','Lost','dd','Lost','2026-02-26 12:37:14','ASB,LVL1','2026-02-26','011-36670902',NULL,NULL),(10,'Black Chicken','Found','grey hair , diao dai shirt and basketball','Resolved','2026-02-28 06:38:53','Library','2026-02-28','011-36670902',NULL,NULL),(11,'Black Ak','Lost','Ak-47','Active','2026-02-28 07:09:43','La Hong','2026-02-28','011-36670902',NULL,1),(12,'Black water','Found','No fur','Active','2026-02-28 10:32:53','La Hong','2026-02-28','011-36670902',NULL,1),(13,'FFF','Lost','FFFFFFF','Active','2026-02-28 10:35:06','Ddd','2026-02-28','011-36670902',NULL,1),(14,'&lt;script&gt;alert(1)&lt;/script&gt;','Lost','Black TEst','Active','2026-02-28 10:35:49','ASB,LVL1','2026-03-01','011-36670902',NULL,1);
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Valent Chua Jia Shiuh','valent.chua@quest.edu.my','$2b$10$WBhlHiwky2JWMA048lM/VuUl0ZiBjgR2jczxAczwma2zbAspfI4CW','2026-02-28 06:49:20');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-28 18:57:54
