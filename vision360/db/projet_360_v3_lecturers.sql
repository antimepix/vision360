-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: projet_360_v3
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
-- Table structure for table `lecturers`
--

DROP TABLE IF EXISTS `lecturers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lecturers` (
  `lecturer_id` bigint NOT NULL AUTO_INCREMENT,
  `last_name` varchar(120) NOT NULL,
  `first_name` varchar(120) NOT NULL,
  `last_time_on_site` date DEFAULT NULL,
  `first_time_on_site` date NOT NULL DEFAULT '2025-07-01',
  PRIMARY KEY (`lecturer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lecturers`
--

LOCK TABLES `lecturers` WRITE;
/*!40000 ALTER TABLE `lecturers` DISABLE KEYS */;
INSERT INTO `lecturers` VALUES (1,'DIET','Jean-Aymeric',NULL,'2025-07-01'),(2,'JABARRI','Mohammad',NULL,'2025-07-01'),(3,'FABREÂ SINEGRE','Laureen',NULL,'2025-07-01'),(4,'LARROQUE','Thibaut',NULL,'2025-07-01'),(5,'DURANT','Sophie',NULL,'2025-07-01'),(6,'COUDERT','Mathieu',NULL,'2025-07-01'),(7,'TREMENT','Paul',NULL,'2025-07-01'),(8,'RIGAUD','Paul',NULL,'2025-07-01'),(9,'SMYRNOFFÂ BODIN','LoÃ¯c',NULL,'2025-07-01'),(10,'DEÂ CONTO','Antoine',NULL,'2025-07-01'),(11,'MOKRANI','Cyril',NULL,'2025-07-01'),(12,'PONASSIE','Damien',NULL,'2025-07-01'),(13,'NALEPA','Olivier',NULL,'2025-07-01'),(14,'PIROG','Antoine',NULL,'2025-07-01'),(15,'HINCU','Sergiu',NULL,'2025-07-01'),(16,'CUISINAUD','LaÃ«titia',NULL,'2025-07-01'),(17,'VIOT','Lucas',NULL,'2025-07-01'),(18,'PAUL','Laetitia',NULL,'2025-07-01'),(19,'MORELLE','Mikael',NULL,'2025-07-01'),(20,'FLAMENT','Axel',NULL,'2025-07-01'),(21,'FACON','FranÃ§ois',NULL,'2025-07-01');
/*!40000 ALTER TABLE `lecturers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-23 14:21:05
