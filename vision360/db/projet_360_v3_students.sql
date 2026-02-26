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
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `student_id` bigint NOT NULL AUTO_INCREMENT,
  `last_name` varchar(120) NOT NULL,
  `first_name` varchar(120) NOT NULL,
  PRIMARY KEY (`student_id`)
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'AMROUCHE','Elliott'),(2,'ANSOULT','Ã‰loÃ¯se'),(3,'ARBONA','CÃ©lian'),(4,'DENIS','Valentin'),(5,'DUBERNET','Corentin'),(6,'GILLET','Adrien'),(7,'HURVOIS','Martin'),(8,'NORMAND','Noah'),(9,'PAILLÃ‰','Arthur'),(10,'PARRABERE','Mathis'),(11,'POCHOLLE','Arthur'),(12,'POUX','TimothÃ©e'),(13,'SABADIE','Aylia'),(14,'SEENE','Allan'),(15,'SFIOTTI','Luca'),(16,'SOUCHET','RaphaÃ«l'),(17,'TUR','Jean-Baptiste'),(18,'VIALANEIX','Hugo'),(19,'ALBERTOS','Elvin'),(20,'ARGAÃ‘O','MaÃ«na'),(21,'BARRÃ‰-BEYLOT','GaÃ«l'),(22,'BÃ‰GUÃ‰--HOUET','ThÃ©o'),(23,'BENEDETTO','Loan'),(24,'CHEVALIER','Edouard'),(25,'COSTREL DE CORAINVILLE','Paul Eloi'),(26,'DESTOMBES','Yvi'),(27,'DESTRUHAUT','Romain'),(28,'FEDEVIEILLE','Gildas'),(29,'GAIGNEROT','Edouard'),(30,'GUYOMARD','Gildas'),(31,'LE BLANC','EloÃ¯se'),(32,'LOZANO','Anthony'),(33,'METELSKI','Alexis'),(34,'PACAU','Kento'),(35,'RENAUD','Rozenn'),(36,'STROTZ','NaÃ«la'),(37,'BAILLY','Florian'),(38,'BENSLAMA','Jed'),(39,'BERTRON','Mathieu'),(40,'BLANC','Louis'),(41,'BORDELAIS','Louis'),(42,'COELHO','Lucas'),(43,'EL HIRECH','Amal'),(44,'GUERIN','Louis'),(45,'HAMON','Malo'),(46,'JAKUBOWSKI','Adam'),(47,'MACAIGNE','Wilhelm'),(48,'MARHRAOUI','Hatem'),(49,'MAURIAC','Anatole'),(50,'MOULIS','Alexandre'),(51,'PULLÃˆS','Edgar'),(52,'SOUINI-RENAUDON','AnaÃ«lle'),(53,'VERRON','Lucas'),(54,'BARDOU','Killian'),(55,'BEN AHMED','Mehdi'),(56,'BURGER','InÃ¨s'),(57,'COKOL','Arda'),(58,'COMIN','Charles'),(59,'COSTREL DE CORAINVILLE','Mayeul'),(60,'DE SOUZA','Lucile'),(61,'ERIT','Juliette'),(62,'GRABHERR','Yuma'),(63,'GRISON','Tom'),(64,'KASRI','Younes'),(65,'LABÃ‰COT','DaphnÃ©'),(66,'LAFITTE','Milan'),(67,'LAPUYADE--SOLDADO','Emmanuelle'),(68,'LOUBIAT','LÃ©o'),(69,'MALLIER','Romain'),(70,'MARY','Nathan'),(71,'MIGON','Killian'),(72,'MILLE','Alexandre'),(73,'MUYAN','Mathis'),(74,'NORMAND','Arone'),(75,'PLOUVIER','Yann'),(76,'TORRES--HAZOUARD','TÃ©o'),(77,'TRISCOS','Mathys'),(78,'VALTON','RaphaÃ«l'),(79,'ZELLER','Hugo'),(80,'ABADIR HOUMED HASSAN','Rayan'),(81,'DÃ‰LAYAT','Joan'),(82,'DÃ‰LAYAT','Xan'),(83,'DUBOIS','Arno'),(84,'GOUAUX','Nicolas'),(85,'GOUGEON','Taho'),(86,'PHAN','Thanh-TÃ¹ng'),(87,'PRADEL DAVAULT','Pierre-Adrien'),(88,'RÃ‰MY','Killian'),(89,'ALMODOVAR','Nikita'),(90,'BALARD','Sacha'),(91,'BALZAN','Malo'),(92,'BONCOMPAIN','Raphael'),(93,'BOUCKAERT','RÃ©mi'),(94,'BRUNET','Paul'),(95,'COSTES','ClÃ©ment'),(96,'DAVID','Alvyn'),(97,'DE SOUSA ALGARVE','Miguel'),(98,'EL KHARROUBI','Samy'),(99,'FERREIRA','Eline'),(100,'FOUCHER','Maxens'),(101,'GABRIEL','Armand'),(102,'GUERRA','Jules'),(103,'HARLÃ‰','Thomas'),(104,'JEANNEROD','Amaury'),(105,'LOPEZ','Baptiste'),(106,'MACHENAUD','Alix'),(107,'MALANDIT','Bryan'),(108,'MARTIN','Eliott'),(109,'MECHLER','Ivy'),(110,'NICOLAS--ESSIANE','Sevan'),(111,'POUBLANC','Tom'),(112,'RAMIREZ','Benjamin'),(113,'RICHARD','Mathias'),(114,'ROCH','MattÃ©o'),(115,'BOZ','Kaan'),(116,'DE BACKER','Valentin'),(117,'HENNEBERT','Gautier'),(118,'LAWSON','Yoann'),(119,'LUCAS','Joshua'),(120,'MAZEAU','ClÃ©ment'),(121,'MILLOGO','Uriel Arthur'),(122,'MLIKA','Imen'),(123,'ROUSERÃ‰','Alexis'),(124,'SACEPE','Fabien'),(125,'SMULSKI','Noah'),(126,'TELLE','Antonin'),(127,'TINGAUD','Galdric');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
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
