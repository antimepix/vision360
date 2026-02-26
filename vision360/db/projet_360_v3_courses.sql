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
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `course_id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL,
  `course` varchar(255) NOT NULL,
  `modules` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`course_id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (47,'2526_ISEN_BORDEAUX_CIR2_S3_PROG3','Programmation 3 : OrientÃ©e Objet','UnitÃ© d\'Enseignement : Informatique S3'),(48,'2526_ISEN_BORDEAUX_AP5_DEVSECOPS','DevSecOPS','UnitÃ© d\'Enseignement SI et dÃ©veloppement responsable'),(49,'2526_ISEN_BORDEAUX_CIR1_S1_PROG1','Programmation 1 : Fondamentaux','UnitÃ© d\'enseignement : Informatique S1'),(50,'2526_ADIMAKER_BORDEAUX_A1_SCI1_MECA','[ADI1] MÃ©canique du point S1','UnitÃ© d\'enseignement Sciences de l\'IngÃ©nieur 1'),(51,'2526_ISEN_BORDEAUX_CSI3_S5_ANGLAIS','Anglais S1','UnitÃ© d\'Enseignement : HumanitÃ©s, Langues'),(52,'2526_ISEN_BORDEAUX_CSI3_S5_MECAQ','MÃ©canique Quantique','UnitÃ© d\'Enseignement : Physique, Electronique'),(53,'2526_ADIMAKER_BORDEAUX_A2_FHL3_ANGLAIS','[ADI2] Anglais S3','UnitÃ© d\'enseignement HumanitÃ©s 3'),(54,'2526_ADIMAKER_BORDEAUX_A1_INFO1_CMICROALGO','[ADI1] C MicrocontrÃ´leur et Algorithmie 1','UnitÃ© d\'enseignement Informatique 1'),(55,'2526_ADIMAKER_BORDEAUX_A1_INFO1_WEB','[ADI1] Web 1','UnitÃ© d\'enseignement Informatique 1'),(56,'2526_ISEN_BORDEAUX_CIR2_S3_ELECMAG','ElectromagnÃ©tisme','UnitÃ© d\'Enseignement : Physique, Electronique S3'),(57,'2526_ADIMAKER_BORDEAUX_A1_SCI1_ELECNUM','[ADI1] Electronique numÃ©rique 1','UnitÃ© d\'enseignement Sciences de l\'IngÃ©nieur 1'),(58,'2526_ISEN_BORDEAUX_CSI3_S5_ELEC_NUM1_FPGA','Electronique NumÃ©rique - FPGA','UnitÃ© d\'Enseignement : Physique, Electronique'),(59,'2526_ISEN_BORDEAUX_CIR1_S1_MATH2','MathÃ©matiques 2 : Analyse','UnitÃ© d\'enseignement : MathÃ©matiques S1'),(60,'2526_ISEN_BORDEAUX_AP5_BI','Business Intelligence','UnitÃ© d\'Enseignement IA et protection des donnÃ©es'),(61,'2526_ADIMAKER_BORDEAUX_A2_INFO3_IA','[ADI2] Programmation et IA S3','UnitÃ© d\'enseignement Informatique 3'),(62,'2526_ISEN_BORDEAUX_CIR1_S1_WEB','DÃ©veloppement Web statique','UnitÃ© d\'enseignement : Informatique S1'),(63,'2526_ADIMAKER_BORDEAUX_A1_MATHS02','[ADI1] Suites et Fonctions usuelles','UnitÃ© d\'enseignement MathÃ©matiques 1'),(64,'2526_ISEN_BORDEAUX_CSI3_S5_EDD','Enjeu du DÃ©veloppement durable','UnitÃ© d\'Enseignement : ResponsabilitÃ© sociale et environnementale'),(65,'2526_ISEN_BORDEAUX_CIR2_S3_MATH6','MathÃ©matiques 6 : Analyse avancÃ©e','UnitÃ© d\'Enseignement : MathÃ©matiques S3'),(66,'2526_ISEN_BORDEAUX_AP5_SECURITE_SI','SÃ©curitÃ© des SI','UnitÃ© d\'Enseignement SI et dÃ©veloppement responsable'),(67,'2526_ISEN_BORDEAUX_CSI3_S5_ELEC_NUM2_MICROC','Electronique NumÃ©rique - MicrocontrÃ´leur','UnitÃ© d\'Enseignement : Physique, Electronique'),(68,'2526_ISEN_BORDEAUX_CIR2_S3_ANGLAIS','Anglais S1','UnitÃ© d\'Enseignement : HumanitÃ©s, Langues S3'),(69,'2526_ISEN_BORDEAUX_AP5_PENTESTING','Pentesting','UnitÃ© d\'Enseignement CybersÃ©curitÃ©'),(70,'2526_ISEN_BORDEAUX_CIR1_S1_COM','Communication interpersonnelle - Bases','UnitÃ© d\'enseignement : HumanitÃ©s, Langues'),(71,'2526_ADIMAKER_BORDEAUX_A1_PROJET1_BETA','[ADI1] Projet de Semestre 1','UnitÃ© d\'enseignement Projet 1'),(72,'2526_ADIMAKER_BORDEAUX_A2_PROJET3_BETA','[ADI2] Projet de Semestre 3','UnitÃ© d\'enseignement Projets 3'),(73,'2526_ISEN_BORDEAUX_CIR2_S3_MATH_TP','MathÃ©matiques Pratiques S1','UnitÃ© d\'Enseignement : MathÃ©matiques S3'),(74,'2526_ADIMAKER_BORDEAUX_A2_SCI3_ELECAPP','[ADI2] Electronique AppliquÃ©e S3','UnitÃ© d\'enseignement Sciences de l\'IngÃ©nieur 3'),(75,'2526_ADIMAKER_BORDEAUX_A1_SCI1_MACHINESOUTILS','[ADI1] Machines Outils 1','UnitÃ© d\'enseignement Sciences de l\'IngÃ©nieur 1'),(76,'2526_ADIMAKER_BORDEAUX_A1_PROJET1_ALPHA','[ADI1] Projets Techniques S1','UnitÃ© d\'enseignement Projet 1'),(77,'2526_ADIMAKER_BORDEAUX_A2_PROJET3_ALPHA','[ADI2] Projets Techniques S3','UnitÃ© d\'enseignement Projets 3'),(78,'2526_ISEN_BORDEAUX_CSI3_S5_TRANSFO','Transformations IntÃ©grales','UnitÃ© d\'Enseignement : Signaux et SystÃ¨mes'),(79,'2526_ADIMAKER_BORDEAUX_A1_FHL1_PPP','[ADI1] Projet Professionnel et Personnel 1','UnitÃ© d\'enseignement HumanitÃ©s 1'),(80,'2526_ADIMAKER_BORDEAUX_A2_FHL3_PPP','[ADI2] Projet Professionnel et Personnel S3','UnitÃ© d\'enseignement HumanitÃ©s 3'),(81,'2526_ISEN_AP5_PROG_MOBILE','Android','UnitÃ© d\'Enseignement DÃ©veloppement logiciel'),(82,'2526_ISEN_BORDEAUX_AP5_PROG_MOBILE','Android','UnitÃ© d\'Enseignement DÃ©veloppement logiciel'),(83,'2526_ISEN_BORDEAUX_CIR1_S1_ELEC_ANA','Electronique analogique','UnitÃ© d\'enseignement : Physique, Electronique S1');
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

-- Dump completed on 2026-02-23 14:21:05
