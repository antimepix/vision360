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
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL,
  `courses` varchar(60) NOT NULL,
  `module_` varchar(90) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `ID_UNIQUE` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=224 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (190,'2526 ISEN BORDEAUX CIR2 S3 PROG3','Programmation 3 : Orientée Objet','Unité d\'Enseignement : Informatique S3'),(191,'2526 ISEN BORDEAUX AP5 DEVSECOPS','DevSecOPS','Unité d\'Enseignement SI et développement responsable'),(192,'2526 ISEN BORDEAUX CIR1 S1 PROG1','Programmation 1 : Fondamentaux','Unité d\'enseignement : Informatique S1'),(193,'2526 ADIMAKER BORDEAUX A1 SCI1 MECA','[ADI1] Mécanique du point S1','Unité d\'enseignement Sciences de l\'Ingénieur 1'),(194,'2526 ISEN BORDEAUX CSI3 S5 ANGLAIS','Anglais S1','Unité d\'Enseignement : Humanités, Langues'),(195,'2526 ISEN BORDEAUX CSI3 S5 MECAQ','Mécanique Quantique','Unité d\'Enseignement : Physique, Electronique'),(196,'2526 ADIMAKER BORDEAUX A2 FHL3 ANGLAIS','[ADI2] Anglais S3','Unité d\'enseignement Humanités 3'),(197,'2526 ADIMAKER BORDEAUX A1 INFO1 CMICROALGO','[ADI1] C Microcontrôleur et Algorithmie 1','Unité d\'enseignement Informatique 1'),(198,'2526 ADIMAKER BORDEAUX A1 INFO1 WEB','[ADI1] Web 1','Unité d\'enseignement Informatique 1'),(199,'2526 ISEN BORDEAUX CIR2 S3 ELECMAG','Electromagnétisme','Unité d\'Enseignement : Physique, Electronique S3'),(200,'2526 ADIMAKER BORDEAUX A1 SCI1 ELECNUM','[ADI1] Electronique numérique 1','Unité d\'enseignement Sciences de l\'Ingénieur 1'),(201,'2526 ISEN BORDEAUX CSI3 S5 ELEC NUM1 FPGA','Electronique Numérique - FPGA','Unité d\'Enseignement : Physique, Electronique'),(202,'2526 ISEN BORDEAUX CIR1 S1 MATH2','Mathématiques 2 : Analyse','Unité d\'enseignement : Mathématiques S1'),(203,'2526 ISEN BORDEAUX AP5 BI','Business Intelligence','Unité d\'Enseignement IA et protection des données'),(204,'2526 ADIMAKER BORDEAUX A2 INFO3 IA','[ADI2] Programmation et IA S3','Unité d\'enseignement Informatique 3'),(205,'2526 ISEN BORDEAUX CIR1 S1 WEB','Développement Web statique','Unité d\'enseignement : Informatique S1'),(206,'2526 ADIMAKER BORDEAUX A1 MATHS02','[ADI1] Suites et Fonctions usuelles','Unité d\'enseignement Mathématiques 1'),(207,'2526 ISEN BORDEAUX CSI3 S5 EDD','Enjeu du Développement durable','Unité d\'Enseignement : Responsabilité sociale et environnementale'),(208,'2526 ISEN BORDEAUX CIR2 S3 MATH6','Mathématiques 6 : Analyse avancée','Unité d\'Enseignement : Mathématiques S3'),(209,'2526 ISEN BORDEAUX AP5 SECURITE SI','Sécurité des SI','Unité d\'Enseignement SI et développement responsable'),(210,'2526 ISEN BORDEAUX CSI3 S5 ELEC NUM2 MICROC','Electronique Numérique - Microcontrôleur','Unité d\'Enseignement : Physique, Electronique'),(211,'2526 ISEN BORDEAUX CIR2 S3 ANGLAIS','Anglais S1','Unité d\'Enseignement : Humanités, Langues S3'),(212,'2526 ISEN BORDEAUX AP5 PENTESTING','Pentesting','Unité d\'Enseignement Cybersécurité'),(213,'2526 ISEN BORDEAUX CIR1 S1 COM','Communication interpersonnelle - Bases','Unité d\'enseignement : Humanités, Langues'),(214,'2526 ADIMAKER BORDEAUX A1 PROJET1 BETA 2526 ADIMAKER BORDEAUX A2 PROJET3 BETA','[ADI1] Projet de Semestre 1 [ADI2] Projet de Semestre 3','Unité d\'enseignement Projet 1 Unité d\'enseignement Projets 3'),(215,'2526 ISEN BORDEAUX CIR2 S3 MATH TP','Mathématiques Pratiques S1','Unité d\'Enseignement : Mathématiques S3'),(216,'2526 ADIMAKER BORDEAUX A2 SCI3 ELECAPP','[ADI2] Electronique Appliquée S3','Unité d\'enseignement Sciences de l\'Ingénieur 3'),(217,'2526 ADIMAKER BORDEAUX A1 SCI1 MACHINESOUTILS','[ADI1] Machines Outils 1','Unité d\'enseignement Sciences de l\'Ingénieur 1'),(218,'2526 ADIMAKER BORDEAUX A1 PROJET1 ALPHA 2526 ADIMAKER BORDEAUX A2 PROJET3 ALPHA','[ADI1] Projets Techniques S1 [ADI2] Projets Techniques S3','Unité d\'enseignement Projet 1 Unité d\'enseignement Projets 3'),(219,'2526 ISEN BORDEAUX CSI3 S5 TRANSFO','Transformations Intégrales','Unité d\'Enseignement : Signaux et Systèmes'),(220,'2526 ADIMAKER BORDEAUX A1 FHL1 PPP','[ADI1] Projet Professionnel et Personnel 1','Unité d\'enseignement Humanités 1'),(221,'2526 ADIMAKER BORDEAUX A2 FHL3 PPP','[ADI2] Projet Professionnel et Personnel S3','Unité d\'enseignement Humanités 3'),(222,'2526 ISEN AP5 PROG MOBILE 2526 ISEN BORDEAUX AP5 PROG MOBILE','Android Android','Unité d\'Enseignement Développement logiciel Unité d\'Enseignement Développement logiciel'),(223,'2526 ISEN BORDEAUX CIR1 S1 ELEC ANA','Electronique analogique','Unité d\'enseignement : Physique, Electronique S1');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
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
