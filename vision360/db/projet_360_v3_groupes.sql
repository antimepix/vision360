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
-- Table structure for table `groupes`
--

DROP TABLE IF EXISTS `groupes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `groupes` (
  `groupes_id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`groupes_id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groupes`
--

LOCK TABLES `groupes` WRITE;
/*!40000 ALTER TABLE `groupes` DISABLE KEYS */;
INSERT INTO `groupes` VALUES (1,'2526_ISEN_BORDEAUX_CIR2','Promotion Bordeaux Cycle Informatique et RÃ©seaux 2Ã¨me annÃ©e 2025-2026'),(2,'2526_ISEN_BORDEAUX_AP5','Promotion 5Ã¨me annÃ©e ISEN  BORDEAUX Apprentissage 2025-2026'),(3,'2526_ISEN_BORDEAUX_CIR1','Promotion Bordeaux Cycle Informatique et RÃ©seaux 1Ã¨re annÃ©e 2025-2026'),(4,'2526_ADIMAKER_BORDEAUX_A1','Promotion Adimaker Bordeaux 1Ã¨re annÃ©e 2025-2026'),(5,'2526_ISEN_BORDEAUX_CSI3','Promotion 1Ã¨re annÃ©e de Cycle IngÃ©nieur (CSI3) 2025-2026'),(6,'2526_ADIMAKER_BORDEAUX_A2','Promotion Adimaker Bordeaux 2Ã¨me annÃ©e 2025-2026'),(7,'2526_ISEN_BORDEAUX_AP5_DEV','AP5 Bdx Option DÃ©veloppement Logiciel'),(8,'2526_ISEN_BORDEAUX_AP5_CYBER','AP5 Bdx Option CybersÃ©curitÃ©'),(9,'2526_ISEN_AP5','Promotion 5Ã¨me annÃ©e ISEN Apprentissage 2025-2026');
/*!40000 ALTER TABLE `groupes` ENABLE KEYS */;
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
