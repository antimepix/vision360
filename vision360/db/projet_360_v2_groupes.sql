-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: projet_360_v2
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
  `ID` int NOT NULL AUTO_INCREMENT,
  `code` varchar(70) NOT NULL,
  `label` varchar(150) NOT NULL,
  `on_site` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ID_UNIQUE` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=228 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `groupes`
--

LOCK TABLES `groupes` WRITE;
/*!40000 ALTER TABLE `groupes` DISABLE KEYS */;
INSERT INTO `groupes` VALUES (216,'2526 ISEN BORDEAUX CIR2','Promotion Bordeaux Cycle Informatique et Réseaux 2ème année 2025-2026',1),(217,'2526 ISEN BORDEAUX AP5','Promotion 5ème année ISEN  BORDEAUX Apprentissage 2025-2026',1),(218,'2526 ISEN BORDEAUX CIR1','Promotion Bordeaux Cycle Informatique et Réseaux 1ère année 2025-2026',1),(219,'2526 ADIMAKER BORDEAUX A1','Promotion Adimaker Bordeaux 1ère année 2025-2026',1),(220,'2526 ISEN BORDEAUX CSI3','Promotion 1ère année de Cycle Ingénieur (CSI3) 2025-2026',1),(221,'2526 ADIMAKER BORDEAUX A2','Promotion Adimaker Bordeaux 2ème année 2025-2026',1),(222,'2526 ISEN BORDEAUX AP5 2526 ISEN BORDEAUX AP5 DEV','Promotion 5ème année ISEN  BORDEAUX Apprentissage 2025-2026 AP5 Bdx Option Développement Logiciel',1),(223,'2526 ISEN BORDEAUX AP5 2526 ISEN BORDEAUX AP5 CYBER','Promotion 5ème année ISEN  BORDEAUX Apprentissage 2025-2026 AP5 Bdx Option Cybersécurité',1),(224,'2526 ADIMAKER BORDEAUX A1 2526 ADIMAKER BORDEAUX A2','Promotion Adimaker Bordeaux 1ère année 2025-2026 Promotion Adimaker Bordeaux 2ème année 2025-2026',1),(225,'2526 ADIMAKER BORDEAUX A1 2526 ISEN BORDEAUX CIR1','Promotion Adimaker Bordeaux 1ère année 2025-2026 Promotion Bordeaux Cycle Informatique et Réseaux 1ère année 2025-2026',1),(226,'2526 ADIMAKER BORDEAUX A2 2526 ISEN BORDEAUX CIR2','Promotion Adimaker Bordeaux 2ème année 2025-2026 Promotion Bordeaux Cycle Informatique et Réseaux 2ème année 2025-2026',1),(227,'2526 ISEN AP5 2526 ISEN BORDEAUX AP5 2526 ISEN BORDEAUX AP5 DEV','Promotion 5ème année ISEN Apprentissage 2025-2026 Promotion 5ème année ISEN  BORDEAUX Apprentissage 2025-2026 AP5 Bdx Option Développement Logiciel',1);
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

-- Dump completed on 2026-02-16 14:23:14
