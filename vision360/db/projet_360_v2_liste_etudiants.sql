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
-- Table structure for table `liste_etudiants`
--

DROP TABLE IF EXISTS `liste_etudiants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `liste_etudiants` (
  `ï»¿Nom` text,
  `PrÃ©nom` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `liste_etudiants`
--

LOCK TABLES `liste_etudiants` WRITE;
/*!40000 ALTER TABLE `liste_etudiants` DISABLE KEYS */;
INSERT INTO `liste_etudiants` VALUES ('ï»¿Nom','PrÃ©nom'),('DUBOIS','Arno'),('DÃ‰LAYAT','Joan'),('VIALANEIX','Hugo'),('ROUSERÃ‰','Alexis'),('RÃ‰MY','Killian'),('GOUAUX','Nicolas'),('GOUGEON','Taho'),('BENSLAMA','Jed'),('MECHLER','Ivy'),('GUERIN','Louis'),('ALMODOVAR','Nikita'),('METELSKI','Alexis'),('NICOLAS--ESSIANE','Sevan'),('POUX','TimothÃ©e'),('BENEDETTO','Loan'),('MAURIAC','Anatole'),('SMULSKI','Noah'),('STROTZ','NaÃ«la'),('BALARD','Sacha'),('JEANNEROD','Amaury'),('LAWSON','Yoann'),('MILLOGO','Uriel Arthur'),('ARBONA','CÃ©lian'),('BRUNET','Paul'),('ERIT','Juliette'),('EL HIRECH','Amal'),('LAPUYADE--SOLDADO','Emmanuelle'),('BARDOU','Killian'),('ROCH','MattÃ©o'),('TELLE','Antonin'),('DE BACKER','Valentin'),('BAILLY','Florian'),('BOUCKAERT','RÃ©mi'),('BERTRON','Mathieu'),('TINGAUD','Galdric'),('ANSOULT','Ã‰loÃ¯se'),('GUERRA','Jules'),('PACAU','Kento'),('COKOL','Arda'),('BURGER','InÃ¨s'),('TUR','Jean-Baptiste'),('MUYAN','Mathis'),('DAVID','Alvyn'),('LOPEZ','Baptiste'),('COSTES','ClÃ©ment'),('HURVOIS','Martin'),('LE BLANC','EloÃ¯se'),('PULLÃˆS','Edgar'),('HARLÃ‰','Thomas'),('BONCOMPAIN','Raphael'),('BORDELAIS','Louis'),('JAKUBOWSKI','Adam'),('BARRÃ‰-BEYLOT','GaÃ«l'),('RAMIREZ','Benjamin'),('MIGON','Killian'),('COMIN','Charles'),('DÃ‰LAYAT','Xan'),('MOULIS','Alexandre'),('TRISCOS','Mathys'),('HENNEBERT','Gautier'),('MARHRAOUI','Hatem'),('BALZAN','Malo'),('NORMAND','Arone'),('MARTIN','Eliott'),('LOZANO','Anthony'),('EL KHARROUBI','Samy'),('SACEPE','Fabien'),('ZELLER','Hugo'),('LUCAS','Joshua'),('SABADIE','Aylia'),('SOUCHET','RaphaÃ«l'),('GRABHERR','Yuma'),('VERRON','Lucas'),('COELHO','Lucas'),('PARRABERE','Mathis'),('ARGAÃ‘O','MaÃ«na'),('ALBERTOS','Elvin'),('POUBLANC','Tom'),('COSTREL DE CORAINVILLE','Mayeul'),('DENIS','Valentin'),('PRADEL DAVAULT','Pierre-Adrien'),('COSTREL DE CORAINVILLE','Paul Eloi'),('TORRES--HAZOUARD','TÃ©o'),('MALLIER','Romain'),('CHEVALIER','Edouard'),('RENAUD','Rozenn'),('SEENE','Allan'),('ABADIR HOUMED HASSAN','Rayan'),('GILLET','Adrien'),('GABRIEL','Armand'),('FERREIRA','Eline'),('BOZ','Kaan'),('VALTON','RaphaÃ«l'),('MALANDIT','Bryan'),('POCHOLLE','Arthur'),('MACAIGNE','Wilhelm'),('HAMON','Malo'),('PLOUVIER','Yann'),('AMROUCHE','Elliott'),('MARY','Nathan'),('PAILLÃ‰','Arthur'),('LAFITTE','Milan'),('DESTRUHAUT','Romain'),('BLANC','Louis'),('NORMAND','Noah'),('LABÃ‰COT','DaphnÃ©'),('FEDEVIEILLE','Gildas'),('FOUCHER','Maxens'),('LOUBIAT','LÃ©o'),('DE SOUZA','Lucile'),('MLIKA','Imen'),('KASRI','Younes'),('GRISON','Tom'),('BÃ‰GUÃ‰--HOUET','ThÃ©o'),('MAZEAU','ClÃ©ment'),('BEN AHMED','Mehdi'),('SOUINI-RENAUDON','AnaÃ«lle'),('DESTOMBES','Yvi'),('GUYOMARD','Gildas'),('DE SOUSA ALGARVE','Miguel'),('RICHARD','Mathias'),('GAIGNEROT','Edouard'),('DUBERNET','Corentin'),('MACHENAUD','Alix'),('MILLE','Alexandre'),('SFIOTTI','Luca'),('PHAN','Thanh-TÃ¹ng');
/*!40000 ALTER TABLE `liste_etudiants` ENABLE KEYS */;
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
