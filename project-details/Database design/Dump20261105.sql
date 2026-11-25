CREATE DATABASE  IF NOT EXISTS `rentacar` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `rentacar`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: rentacar
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `address`
--

DROP TABLE IF EXISTS `address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `address` (
  `addressID` int NOT NULL AUTO_INCREMENT,
  `street` varchar(255) NOT NULL,
  `number` varchar(20) NOT NULL,
  `apt` varchar(20) DEFAULT NULL,
  `zip` varchar(20) NOT NULL,
  `cityID` int NOT NULL,
  PRIMARY KEY (`addressID`),
  KEY `idx_address_city` (`cityID`),
  CONSTRAINT `fk_address_city` FOREIGN KEY (`cityID`) REFERENCES `city` (`cityID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `address`
--

LOCK TABLES `address` WRITE;
/*!40000 ALTER TABLE `address` DISABLE KEYS */;
/*!40000 ALTER TABLE `address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branch`
--

DROP TABLE IF EXISTS `branch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branch` (
  `branchID` int NOT NULL AUTO_INCREMENT,
  `branchName` varchar(100) NOT NULL,
  `addressID` int NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`branchID`),
  UNIQUE KEY `uq_branch_name` (`branchName`),
  UNIQUE KEY `uq_branch_address` (`addressID`),
  CONSTRAINT `fk_branch_address` FOREIGN KEY (`addressID`) REFERENCES `address` (`addressID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branch`
--

LOCK TABLES `branch` WRITE;
/*!40000 ALTER TABLE `branch` DISABLE KEYS */;
/*!40000 ALTER TABLE `branch` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_branch_bu` BEFORE UPDATE ON `branch` FOR EACH ROW BEGIN
  DECLARE v_old_city INT;
  DECLARE v_new_city INT;
  IF NOT (OLD.addressID <=> NEW.addressID) THEN
    SELECT cityID INTO v_old_city FROM address WHERE addressID = OLD.addressID;
    SELECT cityID INTO v_new_city FROM address WHERE addressID = NEW.addressID;
    IF v_old_city <> v_new_city
       AND EXISTS (SELECT 1 FROM dropofflocation WHERE branchID = OLD.branchID) THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Branch has drop-off locations in its current city; move or remove them first';
    END IF;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_branch_au` AFTER UPDATE ON `branch` FOR EACH ROW BEGIN
  IF OLD.isActive = 1 AND NEW.isActive = 0 THEN
    UPDATE dropofflocation SET isActive = 0 WHERE branchID = NEW.branchID;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `brand`
--

DROP TABLE IF EXISTS `brand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brand` (
  `brandID` int NOT NULL AUTO_INCREMENT,
  `brandName` varchar(100) NOT NULL,
  `manufacturerID` int NOT NULL,
  PRIMARY KEY (`brandID`),
  UNIQUE KEY `uq_brand_name` (`brandName`),
  KEY `idx_brand_manufacturer` (`manufacturerID`),
  CONSTRAINT `fk_brand_manufacturer` FOREIGN KEY (`manufacturerID`) REFERENCES `manufacturer` (`manufacturerID`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brand`
--

LOCK TABLES `brand` WRITE;
/*!40000 ALTER TABLE `brand` DISABLE KEYS */;
INSERT INTO `brand` VALUES (1,'Volkswagen',1),(2,'Toyota',2),(3,'Peugeot',3),(4,'Dacia',4),(5,'Hyundai',5),(6,'Kia',6),(7,'Ford',7),(8,'Chevrolet',8),(9,'Honda',9),(10,'Nissan',10),(11,'BMW',11),(12,'Mercedes-Benz',12),(13,'Suzuki',13),(14,'Mazda',14),(15,'Subaru',15),(16,'Tesla',16),(17,'Skoda',17),(18,'Mitsubishi',18),(19,'Volvo',19),(20,'Audi',20);
/*!40000 ALTER TABLE `brand` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `car`
--

DROP TABLE IF EXISTS `car`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `car` (
  `carID` int NOT NULL AUTO_INCREMENT,
  `modelID` int NOT NULL,
  `categoryID` int NOT NULL,
  `branchID` int NOT NULL,
  `plate` varchar(20) NOT NULL,
  `color` varchar(50) DEFAULT NULL,
  `fuelType` enum('Gas','Diesel','Electric','Hybrid') NOT NULL,
  `status` enum('Available','Maintenance','Inactive') NOT NULL DEFAULT 'Available',
  `currentMileage` int NOT NULL DEFAULT '0',
  `insuranceExpiry` date DEFAULT NULL,
  `registrationExpiry` date DEFAULT NULL,
  `inspectionExpiry` date DEFAULT NULL,
  `nextServiceDate` date DEFAULT NULL,
  `nextServiceMileage` int DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`carID`),
  UNIQUE KEY `uq_car_plate` (`plate`),
  KEY `idx_car_model` (`modelID`),
  KEY `idx_car_status` (`status`),
  KEY `idx_car_branch` (`branchID`),
  KEY `idx_car_category` (`categoryID`),
  CONSTRAINT `fk_car_branch` FOREIGN KEY (`branchID`) REFERENCES `branch` (`branchID`),
  CONSTRAINT `fk_car_category` FOREIGN KEY (`categoryID`) REFERENCES `carcategory` (`categoryID`),
  CONSTRAINT `fk_car_model` FOREIGN KEY (`modelID`) REFERENCES `model` (`modelID`),
  CONSTRAINT `chk_car_mileage` CHECK ((`currentMileage` >= 0)),
  CONSTRAINT `chk_car_nextservice` CHECK (((`nextServiceMileage` is null) or (`nextServiceMileage` >= 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `car`
--

LOCK TABLES `car` WRITE;
/*!40000 ALTER TABLE `car` DISABLE KEYS */;
/*!40000 ALTER TABLE `car` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_car_bu` BEFORE UPDATE ON `car` FOR EACH ROW BEGIN
  IF NEW.currentMileage < OLD.currentMileage THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Mileage cannot be decreased';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `carcategory`
--

DROP TABLE IF EXISTS `carcategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carcategory` (
  `categoryID` int NOT NULL AUTO_INCREMENT,
  `categoryName` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `depositAmount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'Security deposit required at pick-up',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`categoryID`),
  UNIQUE KEY `uq_category_name` (`categoryName`),
  CONSTRAINT `chk_category_deposit` CHECK ((`depositAmount` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carcategory`
--

LOCK TABLES `carcategory` WRITE;
/*!40000 ALTER TABLE `carcategory` DISABLE KEYS */;
INSERT INTO `carcategory` VALUES (1,'Economy','Small, fuel-efficient cars',0.00,1),(2,'Compact','Compact hatchbacks and sedans',0.00,1),(3,'Midsize','Midsize sedans and estates',0.00,1),(4,'SUV','SUVs and crossovers',0.00,1),(5,'Luxury','Premium vehicles',0.00,1),(6,'Van','Vans and minibuses',0.00,1);
/*!40000 ALTER TABLE `carcategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoryprice`
--

DROP TABLE IF EXISTS `categoryprice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoryprice` (
  `priceID` int NOT NULL AUTO_INCREMENT,
  `categoryID` int NOT NULL,
  `dailyRate` decimal(10,2) NOT NULL,
  `isSeasonal` tinyint(1) NOT NULL DEFAULT '0',
  `seasonName` varchar(50) DEFAULT NULL,
  `effectiveFrom` date NOT NULL,
  `effectiveTo` date DEFAULT NULL COMMENT 'NULL = open ended (base prices only)',
  PRIMARY KEY (`priceID`),
  KEY `idx_catprice_dates` (`categoryID`,`effectiveFrom`,`effectiveTo`),
  CONSTRAINT `fk_catprice_category` FOREIGN KEY (`categoryID`) REFERENCES `carcategory` (`categoryID`),
  CONSTRAINT `chk_catprice_dates` CHECK (((`effectiveTo` is null) or (`effectiveTo` >= `effectiveFrom`))),
  CONSTRAINT `chk_catprice_rate` CHECK ((`dailyRate` > 0)),
  CONSTRAINT `chk_catprice_season` CHECK (((`isSeasonal` = 0) or ((`effectiveTo` is not null) and (`seasonName` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoryprice`
--

LOCK TABLES `categoryprice` WRITE;
/*!40000 ALTER TABLE `categoryprice` DISABLE KEYS */;
/*!40000 ALTER TABLE `categoryprice` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_categoryprice_bi` BEFORE INSERT ON `categoryprice` FOR EACH ROW BEGIN
  IF EXISTS (SELECT 1 FROM categoryprice p
              WHERE p.categoryID = NEW.categoryID AND p.isSeasonal = NEW.isSeasonal
                AND p.effectiveFrom <= COALESCE(NEW.effectiveTo, '9999-12-31')
                AND NEW.effectiveFrom <= COALESCE(p.effectiveTo, '9999-12-31')) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Price period overlaps an existing price of the same kind for this category';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_categoryprice_ai` AFTER INSERT ON `categoryprice` FOR EACH ROW BEGIN
  INSERT INTO categorypriceauditlog (categoryID, oldDailyRate, newDailyRate, actionType, changedByUserID)
  VALUES (NEW.categoryID, NULL, NEW.dailyRate, 'INSERT', @app_user_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_categoryprice_bu` BEFORE UPDATE ON `categoryprice` FOR EACH ROW BEGIN
  IF EXISTS (SELECT 1 FROM categoryprice p
              WHERE p.categoryID = NEW.categoryID AND p.isSeasonal = NEW.isSeasonal
                AND p.priceID <> NEW.priceID
                AND p.effectiveFrom <= COALESCE(NEW.effectiveTo, '9999-12-31')
                AND NEW.effectiveFrom <= COALESCE(p.effectiveTo, '9999-12-31')) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Price period overlaps an existing price of the same kind for this category';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_categoryprice_au` AFTER UPDATE ON `categoryprice` FOR EACH ROW BEGIN
  IF NOT (OLD.dailyRate <=> NEW.dailyRate) THEN
    INSERT INTO categorypriceauditlog (categoryID, oldDailyRate, newDailyRate, actionType, changedByUserID)
    VALUES (NEW.categoryID, OLD.dailyRate, NEW.dailyRate, 'UPDATE', @app_user_id);
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_categoryprice_ad` AFTER DELETE ON `categoryprice` FOR EACH ROW BEGIN
  INSERT INTO categorypriceauditlog (categoryID, oldDailyRate, newDailyRate, actionType, changedByUserID)
  VALUES (OLD.categoryID, OLD.dailyRate, NULL, 'DELETE', @app_user_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `categorypriceauditlog`
--

DROP TABLE IF EXISTS `categorypriceauditlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorypriceauditlog` (
  `auditID` int NOT NULL AUTO_INCREMENT,
  `categoryID` int NOT NULL,
  `oldDailyRate` decimal(10,2) DEFAULT NULL,
  `newDailyRate` decimal(10,2) DEFAULT NULL,
  `actionType` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `changedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `changedBy` varchar(100) NOT NULL DEFAULT (current_user()),
  `changedByUserID` int DEFAULT NULL,
  PRIMARY KEY (`auditID`),
  KEY `idx_cataudit_cat` (`categoryID`,`changedAt`),
  KEY `fk_cataudit_user` (`changedByUserID`),
  CONSTRAINT `fk_cataudit_user` FOREIGN KEY (`changedByUserID`) REFERENCES `user` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorypriceauditlog`
--

LOCK TABLES `categorypriceauditlog` WRITE;
/*!40000 ALTER TABLE `categorypriceauditlog` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorypriceauditlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `city`
--

DROP TABLE IF EXISTS `city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `city` (
  `cityID` int NOT NULL AUTO_INCREMENT,
  `cityName` varchar(100) NOT NULL,
  `countryID` int NOT NULL,
  PRIMARY KEY (`cityID`),
  UNIQUE KEY `uq_city_country` (`cityName`,`countryID`),
  KEY `idx_city_country` (`countryID`),
  CONSTRAINT `fk_city_country` FOREIGN KEY (`countryID`) REFERENCES `country` (`countryID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `city`
--

LOCK TABLES `city` WRITE;
/*!40000 ALTER TABLE `city` DISABLE KEYS */;
/*!40000 ALTER TABLE `city` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client` (
  `clientID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `surname` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL COMMENT 'bcrypt / argon2 hash only, never plaintext',
  `phone` varchar(50) DEFAULT NULL,
  `addressID` int DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `dateOfBirth` date DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastLoginAt` datetime DEFAULT NULL,
  `failedLoginCount` int NOT NULL DEFAULT '0',
  `lastFailedLoginAt` datetime DEFAULT NULL,
  `lockedUntil` datetime DEFAULT NULL,
  PRIMARY KEY (`clientID`),
  UNIQUE KEY `uq_client_email` (`email`),
  UNIQUE KEY `uq_client_username` (`username`),
  KEY `idx_client_address` (`addressID`),
  CONSTRAINT `fk_client_address` FOREIGN KEY (`addressID`) REFERENCES `address` (`addressID`),
  CONSTRAINT `chk_client_dob` CHECK (((`dateOfBirth` is null) or (`dateOfBirth` >= _latin1'1900-01-01'))),
  CONSTRAINT `chk_client_email` CHECK (((not(regexp_like(`email`,_utf8mb4'[[:space:]]'))) and regexp_like(`email`,_utf8mb4'^[^@]+@[^@]+[.][^@.]{2,}$'))),
  CONSTRAINT `chk_client_login_pair` CHECK (((`username` is null) = (`password` is null))),
  CONSTRAINT `chk_client_password_hash` CHECK (((`password` is null) or regexp_like(`password`,_utf8mb4'^[$](2[aby][$][0-9]{2}[$].{53}|argon2(id|i|d)[$].+)$'))),
  CONSTRAINT `chk_client_username` CHECK (((`username` is null) or ((char_length(`username`) >= 3) and (not(regexp_like(`username`,_utf8mb4'[[:space:]]'))))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client`
--

LOCK TABLES `client` WRITE;
/*!40000 ALTER TABLE `client` DISABLE KEYS */;
/*!40000 ALTER TABLE `client` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_client_bi` BEFORE INSERT ON `client` FOR EACH ROW BEGIN
  IF NEW.dateOfBirth IS NOT NULL AND NEW.dateOfBirth > CURDATE() THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Date of birth cannot be in the future';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_client_bu` BEFORE UPDATE ON `client` FOR EACH ROW BEGIN
  IF NEW.dateOfBirth IS NOT NULL AND NEW.dateOfBirth > CURDATE() THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Date of birth cannot be in the future';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `conditionphoto`
--

DROP TABLE IF EXISTS `conditionphoto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conditionphoto` (
  `photoID` int NOT NULL AUTO_INCREMENT,
  `conditionID` int NOT NULL,
  `fileReference` varchar(500) NOT NULL COMMENT 'Path or URL of the stored photo (the file itself lives outside the DB)',
  `caption` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`photoID`),
  KEY `idx_photo_cond` (`conditionID`),
  CONSTRAINT `fk_photo_cond` FOREIGN KEY (`conditionID`) REFERENCES `vehiclecondition` (`conditionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conditionphoto`
--

LOCK TABLES `conditionphoto` WRITE;
/*!40000 ALTER TABLE `conditionphoto` DISABLE KEYS */;
/*!40000 ALTER TABLE `conditionphoto` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_photo_bu` BEFORE UPDATE ON `conditionphoto` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Condition photos cannot be edited';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_photo_bd` BEFORE DELETE ON `conditionphoto` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Condition photos cannot be deleted';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `country`
--

DROP TABLE IF EXISTS `country`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `country` (
  `countryID` int NOT NULL AUTO_INCREMENT,
  `countryName` varchar(100) NOT NULL,
  PRIMARY KEY (`countryID`),
  UNIQUE KEY `uq_country_name` (`countryName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `country`
--

LOCK TABLES `country` WRITE;
/*!40000 ALTER TABLE `country` DISABLE KEYS */;
/*!40000 ALTER TABLE `country` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `currency`
--

DROP TABLE IF EXISTS `currency`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `currency` (
  `currencyCode` char(3) NOT NULL,
  `currencyName` varchar(50) NOT NULL,
  `exchangeRateToBase` decimal(14,6) NOT NULL COMMENT '1 unit of this currency = this many base units',
  `isBase` tinyint(1) NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `baseMarker` tinyint GENERATED ALWAYS AS (if((`isBase` = 1),1,NULL)) STORED,
  PRIMARY KEY (`currencyCode`),
  UNIQUE KEY `uq_one_base_currency` (`baseMarker`),
  CONSTRAINT `chk_currency_base` CHECK (((`isBase` = 0) or (`exchangeRateToBase` = 1))),
  CONSTRAINT `chk_currency_rate` CHECK ((`exchangeRateToBase` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `currency`
--

LOCK TABLES `currency` WRITE;
/*!40000 ALTER TABLE `currency` DISABLE KEYS */;
INSERT INTO `currency` (`currencyCode`, `currencyName`, `exchangeRateToBase`, `isBase`, `isActive`) VALUES ('EUR','Euro',1.000000,1,1);
/*!40000 ALTER TABLE `currency` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `damagereport`
--

DROP TABLE IF EXISTS `damagereport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `damagereport` (
  `damageID` int NOT NULL AUTO_INCREMENT,
  `carID` int NOT NULL,
  `reservationID` int DEFAULT NULL,
  `reportDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `description` text NOT NULL,
  `repairCost` decimal(10,2) DEFAULT NULL,
  `isRepaired` tinyint(1) NOT NULL DEFAULT '0',
  `reportedByUserID` int DEFAULT NULL,
  `billedChargeID` int DEFAULT NULL COMMENT 'Charge created when the damage was billed to the client',
  PRIMARY KEY (`damageID`),
  UNIQUE KEY `uq_damage_charge` (`billedChargeID`),
  KEY `idx_damage_car` (`carID`),
  KEY `idx_damage_reservation` (`reservationID`),
  KEY `idx_damage_reportedby` (`reportedByUserID`),
  CONSTRAINT `fk_damage_car` FOREIGN KEY (`carID`) REFERENCES `car` (`carID`),
  CONSTRAINT `fk_damage_charge` FOREIGN KEY (`billedChargeID`) REFERENCES `reservationcharge` (`chargeID`),
  CONSTRAINT `fk_damage_reportedby` FOREIGN KEY (`reportedByUserID`) REFERENCES `user` (`userID`),
  CONSTRAINT `fk_damage_reservation` FOREIGN KEY (`reservationID`) REFERENCES `reservation` (`reservationID`),
  CONSTRAINT `chk_damage_cost` CHECK (((`repairCost` is null) or (`repairCost` >= 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `damagereport`
--

LOCK TABLES `damagereport` WRITE;
/*!40000 ALTER TABLE `damagereport` DISABLE KEYS */;
/*!40000 ALTER TABLE `damagereport` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_damage_bi` BEFORE INSERT ON `damagereport` FOR EACH ROW BEGIN
  SET NEW.reportedByUserID = COALESCE(NEW.reportedByUserID, @app_user_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_damage_ai` AFTER INSERT ON `damagereport` FOR EACH ROW BEGIN
  IF NEW.isRepaired = 0 THEN
    UPDATE car SET status = 'Maintenance'
     WHERE carID = NEW.carID AND status = 'Available';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_damage_au` AFTER UPDATE ON `damagereport` FOR EACH ROW BEGIN
  IF NEW.isRepaired = 1 AND OLD.isRepaired = 0 THEN
    IF NOT EXISTS (SELECT 1 FROM damagereport
                   WHERE carID = NEW.carID AND isRepaired = 0) THEN
      UPDATE car SET status = 'Available'
       WHERE carID = NEW.carID AND status = 'Maintenance';
    END IF;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `documentcounter`
--

DROP TABLE IF EXISTS `documentcounter`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentcounter` (
  `docType` varchar(10) NOT NULL,
  `docYear` int NOT NULL,
  `lastNumber` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`docType`,`docYear`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentcounter`
--

LOCK TABLES `documentcounter` WRITE;
/*!40000 ALTER TABLE `documentcounter` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentcounter` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dropofflocation`
--

DROP TABLE IF EXISTS `dropofflocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dropofflocation` (
  `locationID` int NOT NULL AUTO_INCREMENT,
  `locationName` varchar(100) NOT NULL,
  `addressID` int NOT NULL,
  `branchID` int NOT NULL COMMENT 'Branch that receives cars dropped here',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `dropoffFee` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT 'One-way fee charged when the car is dropped here and this is not the pick-up branch',
  PRIMARY KEY (`locationID`),
  UNIQUE KEY `uq_dropoff_name` (`locationName`),
  KEY `idx_dropoff_address` (`addressID`),
  KEY `idx_dropoff_branch` (`branchID`),
  CONSTRAINT `fk_dropoff_address` FOREIGN KEY (`addressID`) REFERENCES `address` (`addressID`),
  CONSTRAINT `fk_dropoff_branch` FOREIGN KEY (`branchID`) REFERENCES `branch` (`branchID`),
  CONSTRAINT `chk_dropoff_fee` CHECK ((`dropoffFee` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dropofflocation`
--

LOCK TABLES `dropofflocation` WRITE;
/*!40000 ALTER TABLE `dropofflocation` DISABLE KEYS */;
/*!40000 ALTER TABLE `dropofflocation` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_dropoff_bi` BEFORE INSERT ON `dropofflocation` FOR EACH ROW BEGIN
  DECLARE v_loc_city      INT;
  DECLARE v_branch_city   INT;
  DECLARE v_branch_active TINYINT(1);
  SELECT cityID INTO v_loc_city FROM address WHERE addressID = NEW.addressID;
  SELECT a.cityID, b.isActive INTO v_branch_city, v_branch_active
    FROM branch b JOIN address a ON a.addressID = b.addressID
   WHERE b.branchID = NEW.branchID;
  IF v_loc_city IS NULL OR v_branch_city IS NULL OR v_loc_city <> v_branch_city THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Drop-off locations must be in a city where the linked branch is located';
  END IF;
  IF NEW.isActive = 1 AND v_branch_active = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot activate a drop-off location of an inactive branch';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_dropoff_bu` BEFORE UPDATE ON `dropofflocation` FOR EACH ROW BEGIN
  DECLARE v_loc_city      INT;
  DECLARE v_branch_city   INT;
  DECLARE v_branch_active TINYINT(1);
  SELECT cityID INTO v_loc_city FROM address WHERE addressID = NEW.addressID;
  SELECT a.cityID, b.isActive INTO v_branch_city, v_branch_active
    FROM branch b JOIN address a ON a.addressID = b.addressID
   WHERE b.branchID = NEW.branchID;
  IF v_loc_city IS NULL OR v_branch_city IS NULL OR v_loc_city <> v_branch_city THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Drop-off locations must be in a city where the linked branch is located';
  END IF;
  IF NEW.isActive = 1 AND OLD.isActive = 0 AND v_branch_active = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot activate a drop-off location of an inactive branch';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `invoiceID` int NOT NULL AUTO_INCREMENT,
  `invoiceNumber` varchar(30) NOT NULL,
  `invoiceType` enum('Invoice','CreditNote') NOT NULL DEFAULT 'Invoice',
  `reservationID` int NOT NULL,
  `creditsInvoiceID` int DEFAULT NULL COMMENT 'For a credit note: the invoice it cancels',
  `status` enum('Issued','Voided') NOT NULL DEFAULT 'Issued',
  `isFinal` tinyint(1) NOT NULL DEFAULT '0',
  `issuedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `issuedByUserID` int DEFAULT NULL,
  `currencyCode` char(3) NOT NULL,
  `customerName` varchar(200) NOT NULL,
  `customerEmail` varchar(255) DEFAULT NULL,
  `customerAddress` varchar(400) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Sum of lines, discount already deducted',
  `discount` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Information: discount included in the lines',
  `taxTotal` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL DEFAULT '0.00',
  `voidReason` varchar(255) DEFAULT NULL,
  `activeKey` int GENERATED ALWAYS AS (if(((`invoiceType` = _utf8mb4'Invoice') and (`status` = _utf8mb4'Issued')),`reservationID`,NULL)) STORED,
  PRIMARY KEY (`invoiceID`),
  UNIQUE KEY `uq_invoice_number` (`invoiceNumber`),
  UNIQUE KEY `uq_invoice_active` (`activeKey`),
  UNIQUE KEY `uq_invoice_credits` (`creditsInvoiceID`),
  KEY `idx_invoice_res` (`reservationID`),
  KEY `idx_invoice_user` (`issuedByUserID`),
  KEY `fk_invoice_currency` (`currencyCode`),
  CONSTRAINT `fk_invoice_credits` FOREIGN KEY (`creditsInvoiceID`) REFERENCES `invoice` (`invoiceID`),
  CONSTRAINT `fk_invoice_currency` FOREIGN KEY (`currencyCode`) REFERENCES `currency` (`currencyCode`),
  CONSTRAINT `fk_invoice_res` FOREIGN KEY (`reservationID`) REFERENCES `reservation` (`reservationID`),
  CONSTRAINT `fk_invoice_user` FOREIGN KEY (`issuedByUserID`) REFERENCES `user` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_invoice_bu` BEFORE UPDATE ON `invoice` FOR EACH ROW BEGIN
  IF OLD.isFinal = 1 THEN
    IF NOT (OLD.status = 'Issued' AND NEW.status = 'Voided' AND NEW.voidReason IS NOT NULL
            AND NEW.isFinal = 1 AND NEW.invoiceNumber = OLD.invoiceNumber
            AND NEW.subtotal = OLD.subtotal AND NEW.taxTotal = OLD.taxTotal AND NEW.total = OLD.total
            AND NEW.reservationID = OLD.reservationID AND NEW.invoiceType = OLD.invoiceType) THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'An issued invoice cannot be edited; void it with a credit note';
    END IF;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_invoice_bd` BEFORE DELETE ON `invoice` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invoices cannot be deleted; void with a credit note';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `invoiceline`
--

DROP TABLE IF EXISTS `invoiceline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoiceline` (
  `lineID` int NOT NULL AUTO_INCREMENT,
  `invoiceID` int NOT NULL,
  `lineNo` int NOT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unitAmount` decimal(10,2) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `taxRatePercent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `taxAmount` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`lineID`),
  UNIQUE KEY `uq_invoiceline` (`invoiceID`,`lineNo`),
  CONSTRAINT `fk_invoiceline_invoice` FOREIGN KEY (`invoiceID`) REFERENCES `invoice` (`invoiceID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoiceline`
--

LOCK TABLES `invoiceline` WRITE;
/*!40000 ALTER TABLE `invoiceline` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoiceline` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_invoiceline_bi` BEFORE INSERT ON `invoiceline` FOR EACH ROW BEGIN
  DECLARE v_final TINYINT(1);
  SELECT isFinal INTO v_final FROM invoice WHERE invoiceID = NEW.invoiceID;
  IF v_final IS NULL OR v_final = 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lines cannot be added to an issued invoice';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_invoiceline_bu` BEFORE UPDATE ON `invoiceline` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invoice lines cannot be edited';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_invoiceline_bd` BEFORE DELETE ON `invoiceline` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invoice lines cannot be deleted';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `loyaltytier`
--

DROP TABLE IF EXISTS `loyaltytier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyaltytier` (
  `tierID` int NOT NULL AUTO_INCREMENT,
  `tierName` varchar(50) NOT NULL,
  `minCompletedRentals` int NOT NULL,
  `discountPercent` decimal(5,2) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`tierID`),
  UNIQUE KEY `uq_tier_name` (`tierName`),
  UNIQUE KEY `uq_tier_min` (`minCompletedRentals`),
  CONSTRAINT `chk_tier_min` CHECK ((`minCompletedRentals` >= 1)),
  CONSTRAINT `chk_tier_pct` CHECK (((`discountPercent` > 0) and (`discountPercent` <= 100)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyaltytier`
--

LOCK TABLES `loyaltytier` WRITE;
/*!40000 ALTER TABLE `loyaltytier` DISABLE KEYS */;
INSERT INTO `loyaltytier` VALUES (1,'Silver',5,5.00,0),(2,'Gold',15,10.00,0),(3,'Platinum',30,15.00,0);
/*!40000 ALTER TABLE `loyaltytier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenancerecord`
--

DROP TABLE IF EXISTS `maintenancerecord`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `maintenancerecord` (
  `maintenanceID` int NOT NULL AUTO_INCREMENT,
  `carID` int NOT NULL,
  `serviceType` enum('Service','Repair','Tyres','Inspection','Other') NOT NULL,
  `serviceDate` date NOT NULL,
  `mileage` int NOT NULL,
  `cost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `description` text,
  `performedBy` varchar(100) DEFAULT NULL COMMENT 'Garage / mechanic',
  `nextDueDate` date DEFAULT NULL,
  `nextDueMileage` int DEFAULT NULL,
  `createdByUserID` int DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`maintenanceID`),
  KEY `idx_maint_car` (`carID`,`serviceDate`),
  KEY `idx_maint_user` (`createdByUserID`),
  CONSTRAINT `fk_maint_car` FOREIGN KEY (`carID`) REFERENCES `car` (`carID`),
  CONSTRAINT `fk_maint_user` FOREIGN KEY (`createdByUserID`) REFERENCES `user` (`userID`),
  CONSTRAINT `chk_maint_cost` CHECK ((`cost` >= 0)),
  CONSTRAINT `chk_maint_mileage` CHECK ((`mileage` >= 0)),
  CONSTRAINT `chk_maint_next` CHECK (((`nextDueMileage` is null) or (`nextDueMileage` >= 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenancerecord`
--

LOCK TABLES `maintenancerecord` WRITE;
/*!40000 ALTER TABLE `maintenancerecord` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenancerecord` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_maintenance_bi` BEFORE INSERT ON `maintenancerecord` FOR EACH ROW BEGIN
  SET NEW.createdByUserID = COALESCE(NEW.createdByUserID, @app_user_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_maintenance_ai` AFTER INSERT ON `maintenancerecord` FOR EACH ROW BEGIN
  IF (NEW.nextDueDate IS NOT NULL OR NEW.nextDueMileage IS NOT NULL)
     AND NEW.serviceDate >= COALESCE((SELECT MAX(m.serviceDate) FROM maintenancerecord m
                                       WHERE m.carID = NEW.carID AND m.maintenanceID <> NEW.maintenanceID),
                                     '1900-01-01') THEN
    UPDATE car SET nextServiceDate = NEW.nextDueDate, nextServiceMileage = NEW.nextDueMileage
     WHERE carID = NEW.carID;
  END IF;
  UPDATE car SET currentMileage = GREATEST(currentMileage, NEW.mileage) WHERE carID = NEW.carID;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `manufacturer`
--

DROP TABLE IF EXISTS `manufacturer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `manufacturer` (
  `manufacturerID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`manufacturerID`),
  UNIQUE KEY `uq_manufacturer_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `manufacturer`
--

LOCK TABLES `manufacturer` WRITE;
/*!40000 ALTER TABLE `manufacturer` DISABLE KEYS */;
INSERT INTO `manufacturer` VALUES (20,'Audi AG'),(11,'BMW Group'),(7,'Ford Motor Company'),(8,'General Motors'),(9,'Honda Motor Co.'),(5,'Hyundai Motor Company'),(6,'Kia Corporation'),(14,'Mazda Motor Corporation'),(12,'Mercedes-Benz Group'),(18,'Mitsubishi Motors'),(10,'Nissan Motor Co.'),(4,'Renault Group'),(17,'Skoda Auto'),(3,'Stellantis'),(15,'Subaru Corporation'),(13,'Suzuki Motor Corporation'),(16,'Tesla, Inc.'),(2,'Toyota Motor Corporation'),(1,'Volkswagen AG'),(19,'Volvo Cars');
/*!40000 ALTER TABLE `manufacturer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model`
--

DROP TABLE IF EXISTS `model`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `model` (
  `modelID` int NOT NULL AUTO_INCREMENT,
  `modelName` varchar(100) NOT NULL,
  `brandID` int NOT NULL,
  PRIMARY KEY (`modelID`),
  UNIQUE KEY `uq_model_brand` (`modelName`,`brandID`),
  KEY `idx_model_brand` (`brandID`),
  CONSTRAINT `fk_model_brand` FOREIGN KEY (`brandID`) REFERENCES `brand` (`brandID`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model`
--

LOCK TABLES `model` WRITE;
/*!40000 ALTER TABLE `model` DISABLE KEYS */;
INSERT INTO `model` VALUES (3,'208',3),(11,'3 Series',11),(20,'A4',20),(12,'C-Class',12),(9,'Civic',9),(2,'Corolla',2),(14,'CX-5',14),(4,'Duster',4),(7,'Focus',7),(1,'Golf',1),(5,'i20',5),(15,'Impreza',15),(16,'Model 3',16),(17,'Octavia',17),(18,'Outlander',18),(10,'Qashqai',10),(8,'Spark',8),(6,'Sportage',6),(13,'Swift',13),(19,'XC60',19);
/*!40000 ALTER TABLE `model` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `paymentID` int NOT NULL AUTO_INCREMENT,
  `reservationID` int NOT NULL,
  `paymentType` enum('Payment','Refund','Deposit','DepositRefund') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` enum('Cash','Card','BankTransfer','Other') NOT NULL,
  `reference` varchar(100) DEFAULT NULL COMMENT 'Card slip / bank reference',
  `paidAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `receivedByUserID` int DEFAULT NULL,
  `currencyCode` char(3) DEFAULT NULL COMMENT 'NULL on insert = base currency',
  `exchangeRate` decimal(14,6) NOT NULL DEFAULT '1.000000',
  `amountBase` decimal(10,2) GENERATED ALWAYS AS (round((`amount` * `exchangeRate`),2)) STORED,
  `receiptNumber` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`paymentID`),
  UNIQUE KEY `uq_payment_receipt` (`receiptNumber`),
  KEY `idx_payment_reservation` (`reservationID`,`paymentType`),
  KEY `idx_payment_user` (`receivedByUserID`),
  KEY `idx_payment_currency` (`currencyCode`),
  CONSTRAINT `fk_payment_currency` FOREIGN KEY (`currencyCode`) REFERENCES `currency` (`currencyCode`),
  CONSTRAINT `fk_payment_reservation` FOREIGN KEY (`reservationID`) REFERENCES `reservation` (`reservationID`),
  CONSTRAINT `fk_payment_user` FOREIGN KEY (`receivedByUserID`) REFERENCES `user` (`userID`),
  CONSTRAINT `chk_payment_amount` CHECK ((`amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_payment_bi` BEFORE INSERT ON `payment` FOR EACH ROW BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_paid   DECIMAL(12,2);
  DECLARE v_held   DECIMAL(12,2);
  DECLARE v_rate   DECIMAL(14,6);
  DECLARE v_active TINYINT(1);
  DECLARE v_amt    DECIMAL(12,2);
  DECLARE v_num    VARCHAR(30);
  SELECT status INTO v_status FROM reservation WHERE reservationID = NEW.reservationID FOR UPDATE;
  
  
  CALL sp_next_doc_number(IF(NEW.paymentType IN ('Payment','Deposit'), 'REC', 'RFD'), v_num);
  SET NEW.receiptNumber = v_num;
  SET NEW.currencyCode = COALESCE(NEW.currencyCode, fn_base_currency());
  SELECT exchangeRateToBase, isActive INTO v_rate, v_active FROM currency WHERE currencyCode = NEW.currencyCode;
  IF v_rate IS NULL OR v_active = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Currency is unknown or inactive';
  END IF;
  SET NEW.exchangeRate = v_rate;
  SET v_amt = ROUND(NEW.amount * v_rate, 2);
  IF v_status = 'Cancelled' AND NEW.paymentType = 'Deposit' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot take a deposit on a cancelled reservation';
  END IF;
  IF NEW.paymentType = 'Refund' THEN
    SELECT COALESCE(SUM(IF(paymentType = 'Payment', amountBase, -amountBase)), 0) INTO v_paid
      FROM payment WHERE reservationID = NEW.reservationID AND paymentType IN ('Payment','Refund');
    IF v_amt > v_paid + 0.01 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Refund exceeds the amount paid';
    END IF;
  END IF;
  IF NEW.paymentType = 'DepositRefund' THEN
    SELECT COALESCE(SUM(IF(paymentType = 'Deposit', amountBase, -amountBase)), 0) INTO v_held
      FROM payment WHERE reservationID = NEW.reservationID AND paymentType IN ('Deposit','DepositRefund');
    IF v_amt > v_held + 0.01 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Deposit refund exceeds the deposit held';
    END IF;
  END IF;
  SET NEW.receivedByUserID = COALESCE(NEW.receivedByUserID, @app_user_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_payment_bu` BEFORE UPDATE ON `payment` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Payments cannot be edited; record a refund and a new payment instead';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_payment_bd` BEFORE DELETE ON `payment` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Payments cannot be deleted; record a refund instead';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `permissionID` int NOT NULL AUTO_INCREMENT,
  `permissionName` varchar(50) NOT NULL,
  PRIMARY KEY (`permissionID`),
  UNIQUE KEY `uq_permission_name` (`permissionName`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES (2,'MANAGE_CARS'),(4,'MANAGE_CLIENTS'),(6,'MANAGE_DAMAGES'),(11,'MANAGE_FINES'),(10,'MANAGE_INVOICES'),(9,'MANAGE_MAINTENANCE'),(8,'MANAGE_PAYMENTS'),(3,'MANAGE_PRICES'),(12,'MANAGE_PROMOS'),(5,'MANAGE_RESERVATIONS'),(1,'MANAGE_USERS'),(7,'VIEW_REPORTS');
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `priceauditlog`
--

DROP TABLE IF EXISTS `priceauditlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `priceauditlog` (
  `auditID` int NOT NULL AUTO_INCREMENT,
  `carID` int NOT NULL,
  `oldDailyRate` decimal(10,2) DEFAULT NULL,
  `newDailyRate` decimal(10,2) DEFAULT NULL,
  `actionType` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `changedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `changedBy` varchar(100) NOT NULL DEFAULT (current_user()),
  `changedByUserID` int DEFAULT NULL,
  PRIMARY KEY (`auditID`),
  KEY `idx_audit_car` (`carID`,`changedAt`),
  KEY `idx_audit_user` (`changedByUserID`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`changedByUserID`) REFERENCES `user` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `priceauditlog`
--

LOCK TABLES `priceauditlog` WRITE;
/*!40000 ALTER TABLE `priceauditlog` DISABLE KEYS */;
/*!40000 ALTER TABLE `priceauditlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pricehistory`
--

DROP TABLE IF EXISTS `pricehistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricehistory` (
  `priceID` int NOT NULL AUTO_INCREMENT,
  `carID` int NOT NULL,
  `dailyRate` decimal(10,2) NOT NULL,
  `effectiveFrom` date NOT NULL,
  `effectiveTo` date DEFAULT NULL COMMENT 'NULL = open ended',
  PRIMARY KEY (`priceID`),
  KEY `idx_price_car_dates` (`carID`,`effectiveFrom`,`effectiveTo`),
  CONSTRAINT `fk_price_car` FOREIGN KEY (`carID`) REFERENCES `car` (`carID`),
  CONSTRAINT `chk_price_dates` CHECK (((`effectiveTo` is null) or (`effectiveTo` >= `effectiveFrom`))),
  CONSTRAINT `chk_price_rate` CHECK ((`dailyRate` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pricehistory`
--

LOCK TABLES `pricehistory` WRITE;
/*!40000 ALTER TABLE `pricehistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `pricehistory` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_pricehistory_bi` BEFORE INSERT ON `pricehistory` FOR EACH ROW BEGIN
  DECLARE v_overlaps INT DEFAULT 0;

  SELECT COUNT(*) INTO v_overlaps
  FROM pricehistory p
  WHERE p.carID = NEW.carID
    AND p.effectiveFrom <= COALESCE(NEW.effectiveTo, '9999-12-31')
    AND NEW.effectiveFrom <= COALESCE(p.effectiveTo, '9999-12-31');

  IF v_overlaps > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Price period overlaps an existing price for this car';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_pricehistory_ai` AFTER INSERT ON `pricehistory` FOR EACH ROW BEGIN
  INSERT INTO priceauditlog (carID, oldDailyRate, newDailyRate, actionType, changedByUserID)
  VALUES (NEW.carID, NULL, NEW.dailyRate, 'INSERT', @app_user_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_pricehistory_bu` BEFORE UPDATE ON `pricehistory` FOR EACH ROW BEGIN
  DECLARE v_overlaps INT DEFAULT 0;

  SELECT COUNT(*) INTO v_overlaps
  FROM pricehistory p
  WHERE p.carID = NEW.carID
    AND p.priceID <> NEW.priceID
    AND p.effectiveFrom <= COALESCE(NEW.effectiveTo, '9999-12-31')
    AND NEW.effectiveFrom <= COALESCE(p.effectiveTo, '9999-12-31');

  IF v_overlaps > 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Price period overlaps an existing price for this car';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_pricehistory_au` AFTER UPDATE ON `pricehistory` FOR EACH ROW BEGIN
  IF NOT (OLD.dailyRate <=> NEW.dailyRate) THEN
    INSERT INTO priceauditlog (carID, oldDailyRate, newDailyRate, actionType, changedByUserID)
    VALUES (NEW.carID, OLD.dailyRate, NEW.dailyRate, 'UPDATE', @app_user_id);
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_pricehistory_ad` AFTER DELETE ON `pricehistory` FOR EACH ROW BEGIN
  INSERT INTO priceauditlog (carID, oldDailyRate, newDailyRate, actionType, changedByUserID)
  VALUES (OLD.carID, OLD.dailyRate, NULL, 'DELETE', @app_user_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `promocode`
--

DROP TABLE IF EXISTS `promocode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promocode` (
  `promoCodeID` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `discountType` enum('Percent','Fixed') NOT NULL,
  `discountValue` decimal(10,2) NOT NULL,
  `validFrom` date NOT NULL,
  `validTo` date NOT NULL,
  `minDays` int NOT NULL DEFAULT '1',
  `maxUses` int DEFAULT NULL COMMENT 'NULL = unlimited',
  `categoryID` int DEFAULT NULL COMMENT 'NULL = any category',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`promoCodeID`),
  UNIQUE KEY `uq_promo_code` (`code`),
  KEY `idx_promo_category` (`categoryID`),
  CONSTRAINT `fk_promo_category` FOREIGN KEY (`categoryID`) REFERENCES `carcategory` (`categoryID`),
  CONSTRAINT `chk_promo_dates` CHECK ((`validTo` >= `validFrom`)),
  CONSTRAINT `chk_promo_max` CHECK (((`maxUses` is null) or (`maxUses` >= 1))),
  CONSTRAINT `chk_promo_min` CHECK ((`minDays` >= 1)),
  CONSTRAINT `chk_promo_value` CHECK (((`discountValue` > 0) and ((`discountType` = _latin1'Fixed') or (`discountValue` <= 100))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promocode`
--

LOCK TABLES `promocode` WRITE;
/*!40000 ALTER TABLE `promocode` DISABLE KEYS */;
/*!40000 ALTER TABLE `promocode` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rentalextra`
--

DROP TABLE IF EXISTS `rentalextra`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rentalextra` (
  `extraID` int NOT NULL AUTO_INCREMENT,
  `extraName` varchar(100) NOT NULL,
  `pricingType` enum('PerDay','Flat') NOT NULL DEFAULT 'PerDay',
  `unitPrice` decimal(10,2) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`extraID`),
  UNIQUE KEY `uq_extra_name` (`extraName`),
  CONSTRAINT `chk_extra_price` CHECK ((`unitPrice` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rentalextra`
--

LOCK TABLES `rentalextra` WRITE;
/*!40000 ALTER TABLE `rentalextra` DISABLE KEYS */;
/*!40000 ALTER TABLE `rentalextra` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservation`
--

DROP TABLE IF EXISTS `reservation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservation` (
  `reservationID` int NOT NULL AUTO_INCREMENT,
  `clientID` int NOT NULL,
  `carID` int NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `status` enum('Pending','Active','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `totalPrice` decimal(10,2) DEFAULT NULL COMMENT 'Snapshot of the price at booking time',
  `startMileage` int DEFAULT NULL,
  `endMileage` int DEFAULT NULL,
  `pickupBranchID` int NOT NULL,
  `dropoffLocationID` int DEFAULT NULL COMMENT 'NULL = returned to the pick-up branch',
  `createdByUserID` int DEFAULT NULL,
  `depositAmount` decimal(10,2) DEFAULT NULL COMMENT 'Snapshot of the category deposit at booking',
  `returnedAt` datetime DEFAULT NULL COMMENT 'Actual return time',
  `cancelledAt` datetime DEFAULT NULL,
  `cancellationReason` varchar(255) DEFAULT NULL,
  `cancelledByUserID` int DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `discountPercent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `discountFixed` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discountAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `promoCodeID` int DEFAULT NULL,
  PRIMARY KEY (`reservationID`),
  KEY `idx_res_client` (`clientID`),
  KEY `idx_res_car_dates` (`carID`,`startDate`,`endDate`),
  KEY `idx_res_status` (`status`),
  KEY `idx_res_pickup` (`pickupBranchID`),
  KEY `idx_res_dropoff` (`dropoffLocationID`),
  KEY `idx_res_createdby` (`createdByUserID`),
  KEY `idx_res_cancelledby` (`cancelledByUserID`),
  KEY `idx_res_promo` (`promoCodeID`),
  CONSTRAINT `fk_res_cancelledby` FOREIGN KEY (`cancelledByUserID`) REFERENCES `user` (`userID`),
  CONSTRAINT `fk_res_car` FOREIGN KEY (`carID`) REFERENCES `car` (`carID`),
  CONSTRAINT `fk_res_client` FOREIGN KEY (`clientID`) REFERENCES `client` (`clientID`),
  CONSTRAINT `fk_res_createdby` FOREIGN KEY (`createdByUserID`) REFERENCES `user` (`userID`),
  CONSTRAINT `fk_res_dropoff` FOREIGN KEY (`dropoffLocationID`) REFERENCES `dropofflocation` (`locationID`),
  CONSTRAINT `fk_res_pickup` FOREIGN KEY (`pickupBranchID`) REFERENCES `branch` (`branchID`),
  CONSTRAINT `fk_res_promo` FOREIGN KEY (`promoCodeID`) REFERENCES `promocode` (`promoCodeID`),
  CONSTRAINT `chk_res_dates` CHECK ((`endDate` > `startDate`)),
  CONSTRAINT `chk_res_deposit` CHECK (((`depositAmount` is null) or (`depositAmount` >= 0))),
  CONSTRAINT `chk_res_discount` CHECK (((`discountPercent` between 0 and 100) and (`discountFixed` >= 0) and (`discountAmount` >= 0))),
  CONSTRAINT `chk_res_mileage` CHECK (((`startMileage` is null) or (`endMileage` is null) or (`endMileage` >= `startMileage`))),
  CONSTRAINT `chk_res_price` CHECK (((`totalPrice` is null) or (`totalPrice` >= 0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservation`
--

LOCK TABLES `reservation` WRITE;
/*!40000 ALTER TABLE `reservation` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservation` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_reservation_bi` BEFORE INSERT ON `reservation` FOR EACH ROW BEGIN
  DECLARE v_car_status    VARCHAR(20);
  DECLARE v_client_active TINYINT(1);
  DECLARE v_conflicts     INT DEFAULT 0;
  DECLARE v_pick_active   TINYINT(1);
  DECLARE v_drop_ok       TINYINT(1);
  DECLARE v_msg           VARCHAR(128);
  
  SELECT status INTO v_car_status FROM car WHERE carID = NEW.carID FOR UPDATE;
  SELECT isActive INTO v_client_active FROM client WHERE clientID = NEW.clientID;
  IF v_client_active = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Client account is inactive';
  END IF;
  IF NEW.promoCodeID IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Apply promo codes with sp_apply_promo after creating the reservation';
  END IF;
  IF NEW.status IN ('Pending','Active') THEN
    IF NEW.status = 'Pending'
       AND NEW.startDate < DATE_SUB(NOW(), INTERVAL CAST(fn_setting('booking_grace_minutes', 60) AS SIGNED) MINUTE)
       AND COALESCE(@allow_backdated, 0) <> 1 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A reservation cannot start in the past';
    END IF;
    IF fn_branch_access_ok(NEW.pickupBranchID) = 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Your account is restricted to another branch';
    END IF;
    IF v_car_status IS NOT NULL AND v_car_status <> 'Available' THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Car is not available for reservation (maintenance or inactive)';
    END IF;
    SELECT COUNT(*) INTO v_conflicts
    FROM reservation r
    WHERE r.carID = NEW.carID
      AND r.status IN ('Pending','Active')
      AND r.startDate < NEW.endDate
      AND fn_effective_end(r.status, r.endDate) > NEW.startDate;
    IF v_conflicts > 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Car is already reserved for the selected period';
    END IF;
    SELECT isActive INTO v_pick_active FROM branch WHERE branchID = NEW.pickupBranchID;
    IF v_pick_active IS NULL OR v_pick_active = 0 THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pick-up branch is not available';
    END IF;
    IF NEW.dropoffLocationID IS NOT NULL THEN
      SELECT (d.isActive AND b.isActive) INTO v_drop_ok
        FROM dropofflocation d JOIN branch b ON b.branchID = d.branchID
       WHERE d.locationID = NEW.dropoffLocationID;
      IF v_drop_ok IS NULL OR v_drop_ok = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Drop-off location is not available';
      END IF;
    END IF;
    SET v_msg = fn_driver_check(NEW.clientID, NEW.startDate, NEW.endDate, 0);
    IF v_msg IS NOT NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
    END IF;
    SET v_msg = fn_car_check(NEW.carID, NEW.endDate);
    IF v_msg IS NOT NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
    END IF;
  END IF;
  IF NEW.totalPrice IS NULL THEN
    SET NEW.totalPrice = fn_calculate_price(NEW.carID, NEW.startDate, NEW.endDate);
    IF NEW.totalPrice IS NULL THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No daily rate defined for this car for the selected period';
    END IF;
  END IF;
  
  IF NEW.discountPercent = 0 AND NEW.discountFixed = 0 THEN
    SET NEW.discountPercent = fn_loyalty_percent(NEW.clientID);
  END IF;
  SET NEW.discountAmount = LEAST(NEW.totalPrice,
        ROUND(NEW.totalPrice * NEW.discountPercent / 100, 2) + NEW.discountFixed);
  SET NEW.depositAmount = COALESCE(NEW.depositAmount,
        (SELECT cc.depositAmount FROM car c JOIN carcategory cc ON cc.categoryID = c.categoryID
          WHERE c.carID = NEW.carID), 0);
  SET NEW.createdByUserID = COALESCE(NEW.createdByUserID, @app_user_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_reservation_ai` AFTER INSERT ON `reservation` FOR EACH ROW BEGIN
  IF NEW.dropoffLocationID IS NOT NULL AND NEW.status IN ('Pending','Active') THEN
    INSERT INTO reservationcharge (reservationID, chargeType, description, quantity, unitAmount)
    SELECT NEW.reservationID, 'OneWay', CONCAT('One-way fee: ', d.locationName), 1, d.dropoffFee
      FROM dropofflocation d
     WHERE d.locationID = NEW.dropoffLocationID
       AND d.branchID <> NEW.pickupBranchID
       AND d.dropoffFee > 0;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_reservation_bu` BEFORE UPDATE ON `reservation` FOR EACH ROW BEGIN
  DECLARE v_lock        INT;
  DECLARE v_conflicts   INT DEFAULT 0;
  DECLARE v_pick_active TINYINT(1);
  DECLARE v_drop_ok     TINYINT(1);
  DECLARE v_msg         VARCHAR(128);
  DECLARE v_money_changed TINYINT(1);
  IF OLD.status IN ('Completed','Cancelled') AND NEW.status <> OLD.status THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'A completed or cancelled reservation cannot change status';
  END IF;
  SET v_money_changed =
        NOT (OLD.startDate <=> NEW.startDate) OR NOT (OLD.endDate <=> NEW.endDate)
     OR OLD.carID <> NEW.carID OR NOT (OLD.totalPrice <=> NEW.totalPrice)
     OR NOT (OLD.discountPercent <=> NEW.discountPercent)
     OR NOT (OLD.discountFixed   <=> NEW.discountFixed)
     OR NOT (OLD.promoCodeID     <=> NEW.promoCodeID);
  IF v_money_changed AND EXISTS (SELECT 1 FROM invoice WHERE activeKey = OLD.reservationID) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'An invoice has been issued for this reservation; void it before changing prices or dates';
  END IF;
  IF OLD.status <> 'Pending'
     AND (NOT (OLD.discountPercent <=> NEW.discountPercent)
       OR NOT (OLD.discountFixed   <=> NEW.discountFixed)
       OR NOT (OLD.promoCodeID     <=> NEW.promoCodeID)) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'The discount can only be changed on a Pending reservation';
  END IF;
  IF NEW.status = 'Cancelled' AND OLD.status <> 'Cancelled' THEN
    SET NEW.cancelledAt = COALESCE(NEW.cancelledAt, NOW());
    SET NEW.cancelledByUserID = COALESCE(NEW.cancelledByUserID, @app_user_id);
  END IF;
  IF NEW.status IN ('Pending','Active') THEN
    SELECT carID INTO v_lock FROM car WHERE carID = NEW.carID FOR UPDATE;
    SELECT COUNT(*) INTO v_conflicts
    FROM reservation r
    WHERE r.carID = NEW.carID
      AND r.reservationID <> NEW.reservationID
      AND r.status IN ('Pending','Active')
      AND r.startDate < NEW.endDate
      AND fn_effective_end(r.status, r.endDate) > NEW.startDate;
    IF v_conflicts > 0 THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Car is already reserved for the selected period';
    END IF;
    IF OLD.pickupBranchID <> NEW.pickupBranchID THEN
      SELECT isActive INTO v_pick_active FROM branch WHERE branchID = NEW.pickupBranchID;
      IF v_pick_active IS NULL OR v_pick_active = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pick-up branch is not available';
      END IF;
    END IF;
    IF NEW.dropoffLocationID IS NOT NULL
       AND NOT (OLD.dropoffLocationID <=> NEW.dropoffLocationID) THEN
      SELECT (d.isActive AND b.isActive) INTO v_drop_ok
        FROM dropofflocation d JOIN branch b ON b.branchID = d.branchID
       WHERE d.locationID = NEW.dropoffLocationID;
      IF v_drop_ok IS NULL OR v_drop_ok = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Drop-off location is not available';
      END IF;
    END IF;
  END IF;
  
  IF NOT (OLD.startDate <=> NEW.startDate) OR NOT (OLD.endDate <=> NEW.endDate)
     OR OLD.carID <> NEW.carID THEN
    IF OLD.status IN ('Completed','Cancelled') THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Dates and car of a completed or cancelled reservation cannot be changed';
    END IF;
    SET v_msg = fn_driver_check(NEW.clientID, NEW.startDate, NEW.endDate,
                                IF(NEW.status = 'Active', 1, 0));
    IF v_msg IS NOT NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
    END IF;
    SET v_msg = fn_car_check(NEW.carID, NEW.endDate);
    IF v_msg IS NOT NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
    END IF;
    IF NEW.totalPrice <=> OLD.totalPrice THEN      
      SET NEW.totalPrice = fn_calculate_price(NEW.carID, NEW.startDate, NEW.endDate);
      IF NEW.totalPrice IS NULL THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'No daily rate defined for this car for the selected period';
      END IF;
    END IF;
  END IF;
  
  IF NOT (OLD.totalPrice <=> NEW.totalPrice)
     OR NOT (OLD.discountPercent <=> NEW.discountPercent)
     OR NOT (OLD.discountFixed   <=> NEW.discountFixed) THEN
    SET NEW.discountAmount = LEAST(COALESCE(NEW.totalPrice, 0),
          ROUND(COALESCE(NEW.totalPrice, 0) * NEW.discountPercent / 100, 2) + NEW.discountFixed);
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_reservation_au` AFTER UPDATE ON `reservation` FOR EACH ROW BEGIN
  IF NEW.status = 'Completed'
     AND NEW.endMileage IS NOT NULL
     AND (OLD.status <> 'Completed' OR NOT (OLD.endMileage <=> NEW.endMileage)) THEN
    UPDATE car
       SET currentMileage = GREATEST(currentMileage, NEW.endMileage)
     WHERE carID = NEW.carID;
  END IF;
  IF NEW.status = 'Completed' AND OLD.status <> 'Completed' THEN
    UPDATE car
       SET branchID = COALESCE(
             (SELECT d.branchID FROM dropofflocation d
               WHERE d.locationID = NEW.dropoffLocationID),
             NEW.pickupBranchID)
     WHERE carID = NEW.carID;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `reservationcharge`
--

DROP TABLE IF EXISTS `reservationcharge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservationcharge` (
  `chargeID` int NOT NULL AUTO_INCREMENT,
  `reservationID` int NOT NULL,
  `chargeType` enum('OneWay','Extra','LateFee','Damage','Fuel','Cleaning','CancellationFee','Other','Fine','Toll','AdditionalDriver') NOT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT '1.00',
  `unitAmount` decimal(10,2) NOT NULL,
  `amount` decimal(10,2) GENERATED ALWAYS AS (round((`quantity` * `unitAmount`),2)) STORED,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdByUserID` int DEFAULT NULL,
  PRIMARY KEY (`chargeID`),
  KEY `idx_charge_reservation` (`reservationID`),
  KEY `idx_charge_user` (`createdByUserID`),
  CONSTRAINT `fk_charge_reservation` FOREIGN KEY (`reservationID`) REFERENCES `reservation` (`reservationID`),
  CONSTRAINT `fk_charge_user` FOREIGN KEY (`createdByUserID`) REFERENCES `user` (`userID`),
  CONSTRAINT `chk_charge_qty` CHECK ((`quantity` > 0)),
  CONSTRAINT `chk_charge_unit` CHECK ((`unitAmount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservationcharge`
--

LOCK TABLES `reservationcharge` WRITE;
/*!40000 ALTER TABLE `reservationcharge` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservationcharge` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_charge_bi` BEFORE INSERT ON `reservationcharge` FOR EACH ROW BEGIN
  DECLARE v_status VARCHAR(20);
  SELECT status INTO v_status FROM reservation WHERE reservationID = NEW.reservationID;
  IF v_status = 'Cancelled' AND NEW.chargeType <> 'CancellationFee' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Only a cancellation fee can be charged on a cancelled reservation';
  END IF;
  IF NEW.chargeType = 'CancellationFee' AND v_status <> 'Cancelled' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A cancellation fee needs a cancelled reservation';
  END IF;
  SET NEW.createdByUserID = COALESCE(NEW.createdByUserID, @app_user_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_charge_bu` BEFORE UPDATE ON `reservationcharge` FOR EACH ROW BEGIN
  IF EXISTS (SELECT 1 FROM invoice WHERE activeKey = OLD.reservationID) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Charges of an invoiced reservation cannot be edited; void the invoice first';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_charge_bd` BEFORE DELETE ON `reservationcharge` FOR EACH ROW BEGIN
  IF EXISTS (SELECT 1 FROM invoice WHERE activeKey = OLD.reservationID) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Charges of an invoiced reservation cannot be deleted; void the invoice first';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `reservationdriver`
--

DROP TABLE IF EXISTS `reservationdriver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservationdriver` (
  `reservationDriverID` int NOT NULL AUTO_INCREMENT,
  `reservationID` int NOT NULL,
  `clientID` int NOT NULL,
  `feeChargeID` int DEFAULT NULL,
  `addedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `addedByUserID` int DEFAULT NULL,
  PRIMARY KEY (`reservationDriverID`),
  UNIQUE KEY `uq_resdriver` (`reservationID`,`clientID`),
  KEY `idx_resdriver_client` (`clientID`),
  KEY `idx_resdriver_charge` (`feeChargeID`),
  KEY `idx_resdriver_user` (`addedByUserID`),
  CONSTRAINT `fk_resdriver_charge` FOREIGN KEY (`feeChargeID`) REFERENCES `reservationcharge` (`chargeID`),
  CONSTRAINT `fk_resdriver_client` FOREIGN KEY (`clientID`) REFERENCES `client` (`clientID`),
  CONSTRAINT `fk_resdriver_res` FOREIGN KEY (`reservationID`) REFERENCES `reservation` (`reservationID`),
  CONSTRAINT `fk_resdriver_user` FOREIGN KEY (`addedByUserID`) REFERENCES `user` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservationdriver`
--

LOCK TABLES `reservationdriver` WRITE;
/*!40000 ALTER TABLE `reservationdriver` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservationdriver` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_resdriver_bi` BEFORE INSERT ON `reservationdriver` FOR EACH ROW BEGIN
  DECLARE v_status  VARCHAR(20);
  DECLARE v_primary INT;
  DECLARE v_active  TINYINT(1);
  DECLARE v_count   INT;
  SELECT status, clientID INTO v_status, v_primary
    FROM reservation WHERE reservationID = NEW.reservationID FOR UPDATE;
  IF v_status IS NULL OR v_status NOT IN ('Pending','Active') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Drivers can only be added to a Pending or Active reservation';
  END IF;
  IF NEW.clientID = v_primary THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The main driver is already on the reservation';
  END IF;
  SELECT isActive INTO v_active FROM client WHERE clientID = NEW.clientID;
  IF v_active IS NULL OR v_active = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Client account is inactive';
  END IF;
  SELECT COUNT(*) INTO v_count FROM reservationdriver WHERE reservationID = NEW.reservationID;
  IF v_count >= fn_setting('max_additional_drivers', 3) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maximum number of additional drivers reached';
  END IF;
  SET NEW.addedByUserID = COALESCE(NEW.addedByUserID, @app_user_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `roleID` int NOT NULL AUTO_INCREMENT,
  `roleName` varchar(50) NOT NULL,
  PRIMARY KEY (`roleID`),
  UNIQUE KEY `uq_role_name` (`roleName`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'Admin'),(3,'Employee'),(2,'Manager');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolepermission`
--

DROP TABLE IF EXISTS `rolepermission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rolepermission` (
  `roleID` int NOT NULL,
  `permissionID` int NOT NULL,
  PRIMARY KEY (`roleID`,`permissionID`),
  KEY `idx_rp_permission` (`permissionID`),
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permissionID`) REFERENCES `permission` (`permissionID`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`roleID`) REFERENCES `role` (`roleID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolepermission`
--

LOCK TABLES `rolepermission` WRITE;
/*!40000 ALTER TABLE `rolepermission` DISABLE KEYS */;
INSERT INTO `rolepermission` VALUES (1,1),(1,2),(2,2),(1,3),(2,3),(1,4),(2,4),(3,4),(1,5),(2,5),(3,5),(1,6),(2,6),(3,6),(1,7),(2,7),(1,8),(2,8),(3,8),(1,9),(2,9),(1,10),(2,10),(3,10),(1,11),(2,11),(1,12),(2,12);
/*!40000 ALTER TABLE `rolepermission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `setting`
--

DROP TABLE IF EXISTS `setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `setting` (
  `settingKey` varchar(50) NOT NULL,
  `settingValue` decimal(10,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`settingKey`),
  CONSTRAINT `chk_setting_value` CHECK ((`settingValue` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `setting`
--

LOCK TABLES `setting` WRITE;
/*!40000 ALTER TABLE `setting` DISABLE KEYS */;
INSERT INTO `setting` VALUES ('additional_driver_fee_per_day',0.00,'Fee per additional driver per day (0 = free)'),('booking_grace_minutes',60.00,'A booking may start at most this many minutes in the past'),('cancel_fee_days',1.00,'Late cancellation fee = this many days of the daily rate'),('cancel_free_hours',24.00,'Cancelling at least this many hours before pick-up is free'),('cleaning_fee',0.00,'Fee when the car is returned dirty (0 = no fee)'),('fine_admin_fee',0.00,'Administration fee added when a fine is billed to the client'),('fuel_fee_per_percent',0.00,'Fuel fee per missing % of tank (0 = no fuel fee)'),('fuel_tolerance_percent',5.00,'Fuel may be this many % lower than at pick-up without a fee'),('late_fee_multiplier',1.50,'Late fee = daily rate x this multiplier, per started day late'),('late_grace_hours',1.00,'Hours after the end time before a late fee applies'),('lockout_minutes',15.00,'Lock duration after too many failed logins'),('max_additional_drivers',3.00,'Additional drivers allowed per rental'),('max_failed_logins',5.00,'Failed logins before the account is locked'),('min_driver_age',21.00,'Minimum driver age at pick-up date'),('min_licence_years',1.00,'Minimum years the driving licence has been held'),('overrun_block_hours',24.00,'An overdue Active rental blocks the car for this many hours from now'),('require_condition_report',1.00,'1 = pick-up and return condition reports are mandatory');
/*!40000 ALTER TABLE `setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `taxrule`
--

DROP TABLE IF EXISTS `taxrule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `taxrule` (
  `appliesTo` varchar(20) NOT NULL,
  `taxName` varchar(50) NOT NULL DEFAULT 'VAT',
  `ratePercent` decimal(5,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`appliesTo`),
  CONSTRAINT `chk_taxrule_rate` CHECK ((`ratePercent` between 0 and 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taxrule`
--

LOCK TABLES `taxrule` WRITE;
/*!40000 ALTER TABLE `taxrule` DISABLE KEYS */;
INSERT INTO `taxrule` VALUES ('AdditionalDriver','VAT',0.00),('CancellationFee','VAT',0.00),('Cleaning','VAT',0.00),('Damage','VAT',0.00),('Extra','VAT',0.00),('Fine','VAT',0.00),('Fuel','VAT',0.00),('LateFee','VAT',0.00),('OneWay','VAT',0.00),('Other','VAT',0.00),('Rental','VAT',0.00),('Toll','VAT',0.00);
/*!40000 ALTER TABLE `taxrule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trafficfine`
--

DROP TABLE IF EXISTS `trafficfine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trafficfine` (
  `fineID` int NOT NULL AUTO_INCREMENT,
  `carID` int NOT NULL,
  `reservationID` int DEFAULT NULL COMMENT 'Filled automatically from the date when the car was rented',
  `fineType` enum('Speeding','Parking','Toll','Other') NOT NULL,
  `occurredAt` datetime NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `referenceNo` varchar(100) DEFAULT NULL COMMENT 'Number on the fine / toll notice',
  `description` varchar(255) DEFAULT NULL,
  `status` enum('Received','Billed','Paid','Disputed','Void') NOT NULL DEFAULT 'Received',
  `billedChargeID` int DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdByUserID` int DEFAULT NULL,
  PRIMARY KEY (`fineID`),
  UNIQUE KEY `uq_fine_reference` (`referenceNo`),
  UNIQUE KEY `uq_fine_charge` (`billedChargeID`),
  KEY `idx_fine_car` (`carID`,`occurredAt`),
  KEY `idx_fine_res` (`reservationID`),
  KEY `idx_fine_user` (`createdByUserID`),
  CONSTRAINT `fk_fine_car` FOREIGN KEY (`carID`) REFERENCES `car` (`carID`),
  CONSTRAINT `fk_fine_charge` FOREIGN KEY (`billedChargeID`) REFERENCES `reservationcharge` (`chargeID`),
  CONSTRAINT `fk_fine_res` FOREIGN KEY (`reservationID`) REFERENCES `reservation` (`reservationID`),
  CONSTRAINT `fk_fine_user` FOREIGN KEY (`createdByUserID`) REFERENCES `user` (`userID`),
  CONSTRAINT `chk_fine_amount` CHECK ((`amount` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trafficfine`
--

LOCK TABLES `trafficfine` WRITE;
/*!40000 ALTER TABLE `trafficfine` DISABLE KEYS */;
/*!40000 ALTER TABLE `trafficfine` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_fine_bi` BEFORE INSERT ON `trafficfine` FOR EACH ROW BEGIN
  DECLARE v_res    INT;
  DECLARE v_rescar INT;
  IF NEW.status <> 'Received' OR NEW.billedChargeID IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A new fine must start as Received; bill it with sp_bill_fine';
  END IF;
  IF NEW.reservationID IS NOT NULL THEN
    SELECT carID INTO v_rescar FROM reservation WHERE reservationID = NEW.reservationID;
    IF v_rescar IS NULL OR v_rescar <> NEW.carID THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The reservation does not belong to this car';
    END IF;
  ELSE
    SELECT reservationID INTO v_res
      FROM reservation
     WHERE carID = NEW.carID AND status IN ('Active','Completed')
       AND startDate <= NEW.occurredAt
       AND NEW.occurredAt <= COALESCE(returnedAt, fn_effective_end(status, endDate))
     ORDER BY startDate DESC LIMIT 1;
    SET NEW.reservationID = v_res;
  END IF;
  SET NEW.createdByUserID = COALESCE(NEW.createdByUserID, @app_user_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_fine_bu` BEFORE UPDATE ON `trafficfine` FOR EACH ROW BEGIN
  IF NEW.status IN ('Billed','Paid') AND NEW.billedChargeID IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only sp_bill_fine can bill a fine';
  END IF;
  IF OLD.billedChargeID IS NOT NULL AND (NEW.amount <> OLD.amount OR NOT (NEW.reservationID <=> OLD.reservationID)) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A billed fine cannot change amount or reservation';
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `userID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'bcrypt / argon2 hash only, never plaintext',
  `email` varchar(255) NOT NULL,
  `roleID` int NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastLoginAt` datetime DEFAULT NULL,
  `branchID` int DEFAULT NULL COMMENT 'NULL = head office, may work at every branch',
  `failedLoginCount` int NOT NULL DEFAULT '0',
  `lastFailedLoginAt` datetime DEFAULT NULL,
  `lockedUntil` datetime DEFAULT NULL,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `uq_user_username` (`username`),
  UNIQUE KEY `uq_user_email` (`email`),
  KEY `idx_user_role` (`roleID`),
  KEY `idx_user_branch` (`branchID`),
  CONSTRAINT `fk_user_branch` FOREIGN KEY (`branchID`) REFERENCES `branch` (`branchID`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`roleID`) REFERENCES `role` (`roleID`),
  CONSTRAINT `chk_user_email` CHECK (((not(regexp_like(`email`,_utf8mb4'[[:space:]]'))) and regexp_like(`email`,_utf8mb4'^[^@]+@[^@]+[.][^@.]{2,}$'))),
  CONSTRAINT `chk_user_password_hash` CHECK (regexp_like(`password`,_utf8mb4'^[$](2[aby][$][0-9]{2}[$].{53}|argon2(id|i|d)[$].+)$')),
  CONSTRAINT `chk_user_username` CHECK (((char_length(`username`) >= 3) and (not(regexp_like(`username`,_utf8mb4'[[:space:]]')))))
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','$2b$12$qC7LJQlUmpVvX.Bbsx4Ml.M/F/4ynrT.dZdxmjpehNfizeHoKn/Ly','admin@rentacar.local',1,1,'2026-11-24 21:52:23','2026-11-25 02:14:10','2026-11-25 02:14:10',NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehiclecondition`
--

DROP TABLE IF EXISTS `vehiclecondition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehiclecondition` (
  `conditionID` int NOT NULL AUTO_INCREMENT,
  `reservationID` int NOT NULL,
  `stage` enum('Pickup','Return') NOT NULL,
  `recordedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mileage` int NOT NULL,
  `fuelPercent` tinyint unsigned NOT NULL COMMENT '0 = empty, 100 = full',
  `isClean` tinyint(1) NOT NULL DEFAULT '1',
  `existingDamage` text COMMENT 'Damage that is already on the car at this moment',
  `notes` text,
  `recordedByUserID` int DEFAULT NULL,
  PRIMARY KEY (`conditionID`),
  KEY `idx_cond_res` (`reservationID`,`stage`,`conditionID`),
  KEY `idx_cond_user` (`recordedByUserID`),
  CONSTRAINT `fk_cond_res` FOREIGN KEY (`reservationID`) REFERENCES `reservation` (`reservationID`),
  CONSTRAINT `fk_cond_user` FOREIGN KEY (`recordedByUserID`) REFERENCES `user` (`userID`),
  CONSTRAINT `chk_cond_fuel` CHECK ((`fuelPercent` <= 100)),
  CONSTRAINT `chk_cond_mileage` CHECK ((`mileage` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehiclecondition`
--

LOCK TABLES `vehiclecondition` WRITE;
/*!40000 ALTER TABLE `vehiclecondition` DISABLE KEYS */;
/*!40000 ALTER TABLE `vehiclecondition` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_condition_bi` BEFORE INSERT ON `vehiclecondition` FOR EACH ROW BEGIN
  DECLARE v_status   VARCHAR(20);
  DECLARE v_carID    INT;
  DECLARE v_carmil   INT;
  DECLARE v_pickmil  INT;
  SELECT status, carID INTO v_status, v_carID FROM reservation WHERE reservationID = NEW.reservationID;
  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found';
  END IF;
  IF NEW.stage = 'Pickup' AND v_status <> 'Pending' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A pick-up report can only be recorded for a Pending reservation';
  END IF;
  IF NEW.stage = 'Return' AND v_status <> 'Active' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A return report can only be recorded for an Active reservation';
  END IF;
  IF NEW.stage = 'Pickup' THEN
    SELECT currentMileage INTO v_carmil FROM car WHERE carID = v_carID;
    IF NEW.mileage < v_carmil THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Odometer is lower than the last known mileage of the car';
    END IF;
  ELSE
    SELECT startMileage INTO v_pickmil FROM reservation WHERE reservationID = NEW.reservationID;
    IF v_pickmil IS NOT NULL AND NEW.mileage < v_pickmil THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Return mileage cannot be lower than the mileage at pick-up';
    END IF;
  END IF;
  SET NEW.recordedByUserID = COALESCE(NEW.recordedByUserID, @app_user_id);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_condition_bu` BEFORE UPDATE ON `vehiclecondition` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Condition reports cannot be edited; record a new report instead';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_condition_bd` BEFORE DELETE ON `vehiclecondition` FOR EACH ROW BEGIN
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Condition reports cannot be deleted; record a new report instead';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `verification`
--

DROP TABLE IF EXISTS `verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verification` (
  `verificationID` int NOT NULL AUTO_INCREMENT,
  `clientID` int NOT NULL,
  `documentID` varchar(100) NOT NULL,
  `documentCountryID` int NOT NULL,
  `attribute` varchar(100) DEFAULT NULL COMMENT 'Kind of document, e.g. passport, driving licence',
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `documentType` enum('DrivingLicence','Passport','NationalID','Other') NOT NULL DEFAULT 'Other',
  `issueDate` date DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `verifiedAt` datetime DEFAULT NULL,
  `verifiedByUserID` int DEFAULT NULL,
  PRIMARY KEY (`verificationID`),
  UNIQUE KEY `uq_verification_doc` (`documentID`,`documentCountryID`),
  KEY `idx_verification_client` (`clientID`),
  KEY `idx_verification_country` (`documentCountryID`),
  KEY `idx_verification_user` (`verifiedByUserID`),
  CONSTRAINT `fk_verification_client` FOREIGN KEY (`clientID`) REFERENCES `client` (`clientID`),
  CONSTRAINT `fk_verification_country` FOREIGN KEY (`documentCountryID`) REFERENCES `country` (`countryID`),
  CONSTRAINT `fk_verification_user` FOREIGN KEY (`verifiedByUserID`) REFERENCES `user` (`userID`),
  CONSTRAINT `chk_verif_dates` CHECK (((`issueDate` is null) or (`expiryDate` is null) or (`expiryDate` > `issueDate`))),
  CONSTRAINT `chk_verif_licence` CHECK (((`documentType` <> _latin1'DrivingLicence') or ((`issueDate` is not null) and (`expiryDate` is not null))))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification`
--

LOCK TABLES `verification` WRITE;
/*!40000 ALTER TABLE `verification` DISABLE KEYS */;
/*!40000 ALTER TABLE `verification` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_verification_bi` BEFORE INSERT ON `verification` FOR EACH ROW BEGIN
  IF NEW.isVerified = 1 THEN
    SET NEW.verifiedAt = COALESCE(NEW.verifiedAt, NOW());
    SET NEW.verifiedByUserID = COALESCE(NEW.verifiedByUserID, @app_user_id);
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`admin`@`%`*/ /*!50003 TRIGGER `trg_verification_bu` BEFORE UPDATE ON `verification` FOR EACH ROW BEGIN
  IF NEW.isVerified = 1 AND OLD.isVerified = 0 THEN
    SET NEW.verifiedAt = NOW();
    SET NEW.verifiedByUserID = COALESCE(@app_user_id, NEW.verifiedByUserID);
  ELSEIF NEW.isVerified = 0 THEN
    SET NEW.verifiedAt = NULL;
    SET NEW.verifiedByUserID = NULL;
  END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Temporary view structure for view `view_additionaldriver`
--

DROP TABLE IF EXISTS `view_additionaldriver`;
/*!50001 DROP VIEW IF EXISTS `view_additionaldriver`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_additionaldriver` AS SELECT 
 1 AS `reservationID`,
 1 AS `clientID`,
 1 AS `name`,
 1 AS `surname`,
 1 AS `addedAt`,
 1 AS `addedBy`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_address`
--

DROP TABLE IF EXISTS `view_address`;
/*!50001 DROP VIEW IF EXISTS `view_address`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_address` AS SELECT 
 1 AS `addressID`,
 1 AS `street`,
 1 AS `number`,
 1 AS `apt`,
 1 AS `zip`,
 1 AS `cityName`,
 1 AS `countryName`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_availablecars`
--

DROP TABLE IF EXISTS `view_availablecars`;
/*!50001 DROP VIEW IF EXISTS `view_availablecars`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_availablecars` AS SELECT 
 1 AS `carID`,
 1 AS `plate`,
 1 AS `brandName`,
 1 AS `modelName`,
 1 AS `categoryName`,
 1 AS `currentMileage`,
 1 AS `dailyRate`,
 1 AS `branchName`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_branch`
--

DROP TABLE IF EXISTS `view_branch`;
/*!50001 DROP VIEW IF EXISTS `view_branch`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_branch` AS SELECT 
 1 AS `branchID`,
 1 AS `branchName`,
 1 AS `street`,
 1 AS `number`,
 1 AS `zip`,
 1 AS `cityName`,
 1 AS `countryName`,
 1 AS `phone`,
 1 AS `isActive`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_brandrevenue`
--

DROP TABLE IF EXISTS `view_brandrevenue`;
/*!50001 DROP VIEW IF EXISTS `view_brandrevenue`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_brandrevenue` AS SELECT 
 1 AS `brandName`,
 1 AS `totalReservations`,
 1 AS `totalRevenue`,
 1 AS `extraCharges`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_car`
--

DROP TABLE IF EXISTS `view_car`;
/*!50001 DROP VIEW IF EXISTS `view_car`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_car` AS SELECT 
 1 AS `carID`,
 1 AS `manufacturerName`,
 1 AS `brandName`,
 1 AS `modelName`,
 1 AS `plate`,
 1 AS `color`,
 1 AS `fuelType`,
 1 AS `branchName`,
 1 AS `categoryName`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_carcompliance`
--

DROP TABLE IF EXISTS `view_carcompliance`;
/*!50001 DROP VIEW IF EXISTS `view_carcompliance`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_carcompliance` AS SELECT 
 1 AS `carID`,
 1 AS `plate`,
 1 AS `branchName`,
 1 AS `status`,
 1 AS `currentMileage`,
 1 AS `insuranceExpiry`,
 1 AS `registrationExpiry`,
 1 AS `inspectionExpiry`,
 1 AS `nextServiceDate`,
 1 AS `nextServiceMileage`,
 1 AS `issues`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_categoryprice`
--

DROP TABLE IF EXISTS `view_categoryprice`;
/*!50001 DROP VIEW IF EXISTS `view_categoryprice`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_categoryprice` AS SELECT 
 1 AS `priceID`,
 1 AS `categoryName`,
 1 AS `dailyRate`,
 1 AS `priceKind`,
 1 AS `effectiveFrom`,
 1 AS `effectiveTo`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_client`
--

DROP TABLE IF EXISTS `view_client`;
/*!50001 DROP VIEW IF EXISTS `view_client`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_client` AS SELECT 
 1 AS `clientID`,
 1 AS `name`,
 1 AS `surname`,
 1 AS `email`,
 1 AS `phone`,
 1 AS `street`,
 1 AS `number`,
 1 AS `zip`,
 1 AS `cityName`,
 1 AS `countryName`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_clientsummary`
--

DROP TABLE IF EXISTS `view_clientsummary`;
/*!50001 DROP VIEW IF EXISTS `view_clientsummary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_clientsummary` AS SELECT 
 1 AS `clientID`,
 1 AS `name`,
 1 AS `surname`,
 1 AS `totalRentals`,
 1 AS `lifetimeSpend`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_conditioncompare`
--

DROP TABLE IF EXISTS `view_conditioncompare`;
/*!50001 DROP VIEW IF EXISTS `view_conditioncompare`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_conditioncompare` AS SELECT 
 1 AS `reservationID`,
 1 AS `plate`,
 1 AS `pickupAt`,
 1 AS `pickupMileage`,
 1 AS `pickupFuel`,
 1 AS `pickupClean`,
 1 AS `damageAtPickup`,
 1 AS `pickupPhotos`,
 1 AS `returnAt`,
 1 AS `returnMileage`,
 1 AS `returnFuel`,
 1 AS `returnClean`,
 1 AS `damageAtReturn`,
 1 AS `returnNotes`,
 1 AS `returnPhotos`,
 1 AS `distanceDriven`,
 1 AS `fuelUsedPercent`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_damagereport`
--

DROP TABLE IF EXISTS `view_damagereport`;
/*!50001 DROP VIEW IF EXISTS `view_damagereport`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_damagereport` AS SELECT 
 1 AS `damageID`,
 1 AS `carPlate`,
 1 AS `modelName`,
 1 AS `reservationID`,
 1 AS `reportDate`,
 1 AS `description`,
 1 AS `repairCost`,
 1 AS `isRepaired`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_dropofflocation`
--

DROP TABLE IF EXISTS `view_dropofflocation`;
/*!50001 DROP VIEW IF EXISTS `view_dropofflocation`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_dropofflocation` AS SELECT 
 1 AS `locationID`,
 1 AS `locationName`,
 1 AS `street`,
 1 AS `number`,
 1 AS `zip`,
 1 AS `cityName`,
 1 AS `countryName`,
 1 AS `branchName`,
 1 AS `isActive`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_fine`
--

DROP TABLE IF EXISTS `view_fine`;
/*!50001 DROP VIEW IF EXISTS `view_fine`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_fine` AS SELECT 
 1 AS `fineID`,
 1 AS `plate`,
 1 AS `fineType`,
 1 AS `occurredAt`,
 1 AS `amount`,
 1 AS `referenceNo`,
 1 AS `status`,
 1 AS `reservationID`,
 1 AS `clientName`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_invoice`
--

DROP TABLE IF EXISTS `view_invoice`;
/*!50001 DROP VIEW IF EXISTS `view_invoice`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_invoice` AS SELECT 
 1 AS `invoiceID`,
 1 AS `invoiceNumber`,
 1 AS `invoiceType`,
 1 AS `status`,
 1 AS `reservationID`,
 1 AS `issuedAt`,
 1 AS `customerName`,
 1 AS `currencyCode`,
 1 AS `subtotal`,
 1 AS `taxTotal`,
 1 AS `total`,
 1 AS `creditsInvoiceID`,
 1 AS `voidReason`,
 1 AS `issuedBy`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_invoicestatus`
--

DROP TABLE IF EXISTS `view_invoicestatus`;
/*!50001 DROP VIEW IF EXISTS `view_invoicestatus`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_invoicestatus` AS SELECT 
 1 AS `reservationID`,
 1 AS `reservationStatus`,
 1 AS `currentTotal`,
 1 AS `invoiceNumber`,
 1 AS `invoicedTotal`,
 1 AS `invoiceState`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_maintenance`
--

DROP TABLE IF EXISTS `view_maintenance`;
/*!50001 DROP VIEW IF EXISTS `view_maintenance`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_maintenance` AS SELECT 
 1 AS `maintenanceID`,
 1 AS `plate`,
 1 AS `serviceType`,
 1 AS `serviceDate`,
 1 AS `mileage`,
 1 AS `cost`,
 1 AS `description`,
 1 AS `performedBy`,
 1 AS `nextDueDate`,
 1 AS `nextDueMileage`,
 1 AS `loggedBy`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_overduereservations`
--

DROP TABLE IF EXISTS `view_overduereservations`;
/*!50001 DROP VIEW IF EXISTS `view_overduereservations`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_overduereservations` AS SELECT 
 1 AS `reservationID`,
 1 AS `clientName`,
 1 AS `clientSurname`,
 1 AS `clientPhone`,
 1 AS `carPlate`,
 1 AS `endDate`,
 1 AS `hoursOverdue`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_payment`
--

DROP TABLE IF EXISTS `view_payment`;
/*!50001 DROP VIEW IF EXISTS `view_payment`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_payment` AS SELECT 
 1 AS `paymentID`,
 1 AS `receiptNumber`,
 1 AS `reservationID`,
 1 AS `paymentType`,
 1 AS `amount`,
 1 AS `currencyCode`,
 1 AS `exchangeRate`,
 1 AS `amountBase`,
 1 AS `method`,
 1 AS `reference`,
 1 AS `paidAt`,
 1 AS `receivedBy`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_pendingrefunds`
--

DROP TABLE IF EXISTS `view_pendingrefunds`;
/*!50001 DROP VIEW IF EXISTS `view_pendingrefunds`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_pendingrefunds` AS SELECT 
 1 AS `reservationID`,
 1 AS `status`,
 1 AS `clientName`,
 1 AS `overpaymentToRefund`,
 1 AS `depositHeld`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_pricehistory`
--

DROP TABLE IF EXISTS `view_pricehistory`;
/*!50001 DROP VIEW IF EXISTS `view_pricehistory`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_pricehistory` AS SELECT 
 1 AS `priceID`,
 1 AS `plate`,
 1 AS `modelName`,
 1 AS `dailyRate`,
 1 AS `effectiveFrom`,
 1 AS `effectiveTo`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_reservation`
--

DROP TABLE IF EXISTS `view_reservation`;
/*!50001 DROP VIEW IF EXISTS `view_reservation`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_reservation` AS SELECT 
 1 AS `reservationID`,
 1 AS `clientName`,
 1 AS `clientSurname`,
 1 AS `carPlate`,
 1 AS `brandName`,
 1 AS `modelName`,
 1 AS `startDate`,
 1 AS `endDate`,
 1 AS `status`,
 1 AS `totalPrice`,
 1 AS `pickupBranch`,
 1 AS `dropoffPlace`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_reservationbalance`
--

DROP TABLE IF EXISTS `view_reservationbalance`;
/*!50001 DROP VIEW IF EXISTS `view_reservationbalance`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_reservationbalance` AS SELECT 
 1 AS `reservationID`,
 1 AS `status`,
 1 AS `rentalGross`,
 1 AS `discount`,
 1 AS `rentalDue`,
 1 AS `charges`,
 1 AS `tax`,
 1 AS `totalDue`,
 1 AS `paid`,
 1 AS `balance`,
 1 AS `depositRequired`,
 1 AS `depositHeld`,
 1 AS `paymentStatus`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_reservationcharge`
--

DROP TABLE IF EXISTS `view_reservationcharge`;
/*!50001 DROP VIEW IF EXISTS `view_reservationcharge`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_reservationcharge` AS SELECT 
 1 AS `chargeID`,
 1 AS `reservationID`,
 1 AS `chargeType`,
 1 AS `description`,
 1 AS `quantity`,
 1 AS `unitAmount`,
 1 AS `amount`,
 1 AS `createdAt`,
 1 AS `createdBy`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_rolepermission`
--

DROP TABLE IF EXISTS `view_rolepermission`;
/*!50001 DROP VIEW IF EXISTS `view_rolepermission`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_rolepermission` AS SELECT 
 1 AS `roleID`,
 1 AS `roleName`,
 1 AS `permissionID`,
 1 AS `permissionName`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_user`
--

DROP TABLE IF EXISTS `view_user`;
/*!50001 DROP VIEW IF EXISTS `view_user`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_user` AS SELECT 
 1 AS `userID`,
 1 AS `username`,
 1 AS `email`,
 1 AS `roleName`,
 1 AS `isActive`,
 1 AS `branchName`,
 1 AS `failedLoginCount`,
 1 AS `lockedUntil`,
 1 AS `isLocked`,
 1 AS `lastLoginAt`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `view_verification`
--

DROP TABLE IF EXISTS `view_verification`;
/*!50001 DROP VIEW IF EXISTS `view_verification`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `view_verification` AS SELECT 
 1 AS `verificationID`,
 1 AS `clientName`,
 1 AS `clientSurname`,
 1 AS `documentID`,
 1 AS `documentCountry`,
 1 AS `attribute`,
 1 AS `isVerified`*/;
SET character_set_client = @saved_cs_client;

--
-- Dumping events for database 'rentacar'
--
/*!50106 SET @save_time_zone= @@TIME_ZONE */ ;
/*!50106 DROP EVENT IF EXISTS `ev_cancel_stale_pending` */;
DELIMITER ;;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;;
/*!50003 SET character_set_client  = utf8mb4 */ ;;
/*!50003 SET character_set_results = utf8mb4 */ ;;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;;
/*!50003 SET @saved_time_zone      = @@time_zone */ ;;
/*!50003 SET time_zone             = 'SYSTEM' */ ;;
/*!50106 CREATE*/ /*!50117 DEFINER=`admin`@`%`*/ /*!50106 EVENT `ev_cancel_stale_pending` ON SCHEDULE EVERY 1 HOUR STARTS '2026-11-04 09:34:20' ON COMPLETION NOT PRESERVE DISABLE COMMENT 'Cancel Pending reservations that were never picked up' DO UPDATE reservation
     SET status = 'Cancelled'
   WHERE status = 'Pending'
     AND startDate < NOW() - INTERVAL 1 DAY */ ;;
/*!50003 SET time_zone             = @saved_time_zone */ ;;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;;
/*!50003 SET character_set_client  = @saved_cs_client */ ;;
/*!50003 SET character_set_results = @saved_cs_results */ ;;
/*!50003 SET collation_connection  = @saved_col_connection */ ;;
DELIMITER ;
/*!50106 SET TIME_ZONE= @save_time_zone */ ;

--
-- Dumping routines for database 'rentacar'
--
/*!50003 DROP FUNCTION IF EXISTS `fn_base_currency` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `fn_base_currency`() RETURNS char(3) CHARSET utf8mb4
    READS SQL DATA
BEGIN
  DECLARE v CHAR(3);
  SELECT currencyCode INTO v FROM currency WHERE isBase = 1;
  RETURN v;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_branch_access_ok` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `fn_branch_access_ok`(p_branchID INT) RETURNS tinyint(1)
    READS SQL DATA
BEGIN
  DECLARE v_branch INT;
  IF @app_user_id IS NULL THEN
    RETURN 1;
  END IF;
  SELECT branchID INTO v_branch FROM `user` WHERE userID = @app_user_id;
  IF v_branch IS NULL OR v_branch = p_branchID THEN
    RETURN 1;
  END IF;
  RETURN 0;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_calculate_price` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `fn_calculate_price`(p_carID INT, p_start DATETIME, p_end DATETIME) RETURNS decimal(10,2)
    READS SQL DATA
BEGIN
  DECLARE v_days  INT;
  DECLARE v_i     INT DEFAULT 0;
  DECLARE v_total DECIMAL(10,2) DEFAULT 0;
  DECLARE v_rate  DECIMAL(10,2);

  IF p_end <= p_start THEN
    RETURN NULL;
  END IF;

  SET v_days = GREATEST(1, CEIL(TIMESTAMPDIFF(SECOND, p_start, p_end) / 86400));

  WHILE v_i < v_days DO
    SET v_rate = fn_get_daily_rate(p_carID, DATE(DATE_ADD(p_start, INTERVAL v_i DAY)));
    IF v_rate IS NULL THEN
      RETURN NULL;
    END IF;
    SET v_total = v_total + v_rate;
    SET v_i = v_i + 1;
  END WHILE;

  RETURN v_total;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_car_check` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `fn_car_check`(p_carID INT, p_end DATETIME) RETURNS varchar(100) CHARSET utf8mb4
    READS SQL DATA
BEGIN
  DECLARE v_ins  DATE;
  DECLARE v_reg  DATE;
  DECLARE v_insp DATE;
  SELECT insuranceExpiry, registrationExpiry, inspectionExpiry INTO v_ins, v_reg, v_insp
  FROM car WHERE carID = p_carID;
  IF v_ins IS NULL OR v_ins < DATE(p_end) THEN
    RETURN 'Car insurance is missing or expires before the end of the rental';
  END IF;
  IF v_reg IS NULL OR v_reg < DATE(p_end) THEN
    RETURN 'Car registration is missing or expires before the end of the rental';
  END IF;
  IF v_insp IS NULL OR v_insp < DATE(p_end) THEN
    RETURN 'Car inspection is missing or expires before the end of the rental';
  END IF;
  RETURN NULL;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_client_lifetime_spend` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `fn_client_lifetime_spend`(p_clientID INT) RETURNS decimal(12,2)
    READS SQL DATA
BEGIN
  DECLARE v_total DECIMAL(12,2);
  SELECT COALESCE(SUM(r.totalPrice - r.discountAmount + COALESCE(
           (SELECT SUM(ch.amount) FROM reservationcharge ch WHERE ch.reservationID = r.reservationID), 0)), 0)
    INTO v_total
  FROM reservation r
  WHERE r.clientID = p_clientID AND r.status = 'Completed';
  RETURN v_total;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_client_login_state` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `fn_client_login_state`(p_username VARCHAR(100)) RETURNS varchar(10) CHARSET utf8mb4
    READS SQL DATA
BEGIN
  DECLARE v_id     INT;
  DECLARE v_active TINYINT(1);
  DECLARE v_locked DATETIME;
  SELECT clientID, isActive, lockedUntil INTO v_id, v_active, v_locked
    FROM `client` WHERE username = p_username;
  IF v_id IS NULL THEN RETURN 'UNKNOWN'; END IF;
  IF v_active = 0 THEN RETURN 'INACTIVE'; END IF;
  IF v_locked IS NOT NULL AND v_locked > NOW() THEN RETURN 'LOCKED'; END IF;
  RETURN 'OK';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_driver_check` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `fn_driver_check`(p_clientID INT, p_start DATETIME, p_end DATETIME, p_requireLicence TINYINT) RETURNS varchar(100) CHARSET utf8mb4
    READS SQL DATA
BEGIN
  DECLARE v_dob   DATE;
  DECLARE v_issue DATE;
  DECLARE v_exp   DATE;
  SELECT dateOfBirth INTO v_dob FROM client WHERE clientID = p_clientID;
  IF v_dob IS NULL THEN
    RETURN 'Client date of birth is required';
  END IF;
  IF TIMESTAMPDIFF(YEAR, v_dob, DATE(p_start)) < fn_setting('min_driver_age', 21) THEN
    RETURN 'Client is below the minimum driver age';
  END IF;
  IF p_requireLicence = 1 THEN
    SELECT issueDate, expiryDate INTO v_issue, v_exp
    FROM verification
    WHERE clientID = p_clientID AND documentType = 'DrivingLicence' AND isVerified = 1
    ORDER BY expiryDate DESC LIMIT 1;
    IF v_exp IS NULL THEN
      RETURN 'No verified driving licence on file';
    END IF;
    IF v_exp < DATE(p_end) THEN
      RETURN 'Driving licence expires before the end of the rental';
    END IF;
    IF TIMESTAMPDIFF(YEAR, v_issue, DATE(p_start)) < fn_setting('min_licence_years', 1) THEN
      RETURN 'Driving licence has not been held long enough';
    END IF;
  END IF;
  RETURN NULL;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_effective_end` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `fn_effective_end`(p_status VARCHAR(20), p_end DATETIME) RETURNS datetime
    READS SQL DATA
BEGIN
  IF p_status = 'Active' AND p_end < NOW() THEN
    RETURN DATE_ADD(NOW(), INTERVAL CAST(fn_setting('overrun_block_hours', 24) AS SIGNED) HOUR);
  END IF;
  RETURN p_end;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_get_daily_rate` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `fn_get_daily_rate`(p_carID INT, p_date DATE) RETURNS decimal(10,2)
    READS SQL DATA
BEGIN
  DECLARE v_rate DECIMAL(10,2) DEFAULT NULL;
  SELECT dailyRate INTO v_rate
  FROM pricehistory
  WHERE carID = p_carID
    AND effectiveFrom <= p_date
    AND (effectiveTo IS NULL OR effectiveTo >= p_date)
  ORDER BY effectiveFrom DESC, priceID DESC
  LIMIT 1;
  IF v_rate IS NULL THEN
    SELECT cp.dailyRate INTO v_rate
    FROM categoryprice cp JOIN car c ON c.categoryID = cp.categoryID
    WHERE c.carID = p_carID
      AND cp.effectiveFrom <= p_date
      AND (cp.effectiveTo IS NULL OR cp.effectiveTo >= p_date)
    ORDER BY cp.isSeasonal DESC, cp.effectiveFrom DESC, cp.priceID DESC
    LIMIT 1;
  END IF;
  RETURN v_rate;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_is_car_available` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `fn_is_car_available`(p_carID INT, p_start DATETIME, p_end DATETIME, p_exclude INT) RETURNS tinyint(1)
    READS SQL DATA
BEGIN
  IF NOT EXISTS (SELECT 1 FROM car WHERE carID = p_carID AND status = 'Available') THEN
    RETURN 0;
  END IF;
  IF EXISTS (SELECT 1
             FROM reservation r
             WHERE r.carID = p_carID
               AND r.status IN ('Pending','Active')
               AND (p_exclude IS NULL OR r.reservationID <> p_exclude)
               AND r.startDate < p_end
               AND fn_effective_end(r.status, r.endDate) > p_start) THEN
    RETURN 0;
  END IF;
  RETURN 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_login_state` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `fn_login_state`(p_username VARCHAR(100)) RETURNS varchar(10) CHARSET utf8mb4
    READS SQL DATA
BEGIN
  DECLARE v_active TINYINT(1);
  DECLARE v_locked DATETIME;
  DECLARE v_found  INT;
  SELECT userID, isActive, lockedUntil INTO v_found, v_active, v_locked
    FROM `user` WHERE username = p_username;
  IF v_found IS NULL THEN RETURN 'UNKNOWN'; END IF;
  IF v_active = 0    THEN RETURN 'INACTIVE'; END IF;
  IF v_locked IS NOT NULL AND v_locked > NOW() THEN RETURN 'LOCKED'; END IF;
  RETURN 'OK';
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_loyalty_percent` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `fn_loyalty_percent`(p_clientID INT) RETURNS decimal(5,2)
    READS SQL DATA
BEGIN
  DECLARE v_count INT;
  DECLARE v_pct   DECIMAL(5,2);
  SELECT COUNT(*) INTO v_count FROM reservation WHERE clientID = p_clientID AND status = 'Completed';
  SELECT discountPercent INTO v_pct
    FROM loyaltytier
   WHERE isActive = 1 AND minCompletedRentals <= v_count
   ORDER BY minCompletedRentals DESC LIMIT 1;
  RETURN COALESCE(v_pct, 0);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_setting` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` FUNCTION `fn_setting`(p_key VARCHAR(50), p_default DECIMAL(10,2)) RETURNS decimal(10,2)
    READS SQL DATA
BEGIN
  DECLARE v DECIMAL(10,2);
  SELECT settingValue INTO v FROM setting WHERE settingKey = p_key;
  RETURN COALESCE(v, p_default);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_add_charge` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_add_charge`(
  IN  p_reservationID INT,
  IN  p_type          VARCHAR(20),
  IN  p_description   VARCHAR(255),
  IN  p_quantity      DECIMAL(10,2),
  IN  p_unitAmount    DECIMAL(10,2),
  OUT p_chargeID      INT)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  INSERT INTO reservationcharge (reservationID, chargeType, description, quantity, unitAmount)
  VALUES (p_reservationID, p_type, p_description, COALESCE(p_quantity, 1), p_unitAmount);
  SET p_chargeID = LAST_INSERT_ID();
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_add_condition_photo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_add_condition_photo`(
  IN p_conditionID INT, IN p_fileReference VARCHAR(500), IN p_caption VARCHAR(255))
BEGIN
  INSERT INTO conditionphoto (conditionID, fileReference, caption)
  VALUES (p_conditionID, p_fileReference, p_caption);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_add_driver` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_add_driver`(IN p_reservationID INT, IN p_clientID INT)
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_start  DATETIME;
  DECLARE v_end    DATETIME;
  DECLARE v_msg    VARCHAR(128);
  DECLARE v_fee    DECIMAL(10,2);
  DECLARE v_days   INT;
  DECLARE v_charge INT DEFAULT NULL;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT status, startDate, endDate INTO v_status, v_start, v_end
    FROM reservation WHERE reservationID = p_reservationID FOR UPDATE;
  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found';
  END IF;
  SET v_msg = fn_driver_check(p_clientID, v_start, v_end, IF(v_status = 'Active', 1, 0));
  IF v_msg IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
  END IF;
  INSERT INTO reservationdriver (reservationID, clientID) VALUES (p_reservationID, p_clientID);
  SET v_fee  = fn_setting('additional_driver_fee_per_day', 0);
  SET v_days = GREATEST(1, CEIL(TIMESTAMPDIFF(SECOND, v_start, v_end) / 86400));
  IF v_fee > 0 THEN
    INSERT INTO reservationcharge (reservationID, chargeType, description, quantity, unitAmount)
    VALUES (p_reservationID, 'AdditionalDriver',
            CONCAT('Additional driver (client #', p_clientID, ') x ', v_days, ' day(s)'), 1, v_fee * v_days);
    SET v_charge = LAST_INSERT_ID();
    UPDATE reservationdriver SET feeChargeID = v_charge
     WHERE reservationID = p_reservationID AND clientID = p_clientID;
  END IF;
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_add_extra` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_add_extra`(
  IN p_reservationID INT, IN p_extraID INT, IN p_quantity INT)
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_start  DATETIME;
  DECLARE v_end    DATETIME;
  DECLARE v_name   VARCHAR(100);
  DECLARE v_type   VARCHAR(10);
  DECLARE v_price  DECIMAL(10,2);
  DECLARE v_active TINYINT(1);
  DECLARE v_days   INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT status, startDate, endDate INTO v_status, v_start, v_end
    FROM reservation WHERE reservationID = p_reservationID FOR UPDATE;
  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found';
  END IF;
  IF v_status NOT IN ('Pending','Active') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Extras can only be added to a Pending or Active reservation';
  END IF;
  SELECT extraName, pricingType, unitPrice, isActive INTO v_name, v_type, v_price, v_active
    FROM rentalextra WHERE extraID = p_extraID;
  IF v_name IS NULL OR v_active = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Extra not found or inactive';
  END IF;
  IF p_quantity IS NULL OR p_quantity < 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quantity must be at least 1';
  END IF;
  SET v_days = GREATEST(1, CEIL(TIMESTAMPDIFF(SECOND, v_start, v_end) / 86400));
  IF v_type = 'PerDay' THEN
    INSERT INTO reservationcharge (reservationID, chargeType, description, quantity, unitAmount)
    VALUES (p_reservationID, 'Extra', CONCAT(v_name, ' x ', v_days, ' day(s)'), p_quantity, v_price * v_days);
  ELSE
    INSERT INTO reservationcharge (reservationID, chargeType, description, quantity, unitAmount)
    VALUES (p_reservationID, 'Extra', v_name, p_quantity, v_price);
  END IF;
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_apply_promo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_apply_promo`(IN p_reservationID INT, IN p_code VARCHAR(30))
BEGIN
  DECLARE v_status   VARCHAR(20);
  DECLARE v_clientID INT;
  DECLARE v_carID    INT;
  DECLARE v_total    DECIMAL(10,2);
  DECLARE v_start    DATETIME;
  DECLARE v_end      DATETIME;
  DECLARE v_cur      INT;
  DECLARE v_pid      INT;
  DECLARE v_type     VARCHAR(10);
  DECLARE v_val      DECIMAL(10,2);
  DECLARE v_from     DATE;
  DECLARE v_to       DATE;
  DECLARE v_mindays  INT;
  DECLARE v_max      INT;
  DECLARE v_cat      INT;
  DECLARE v_active   TINYINT(1);
  DECLARE v_carcat   INT;
  DECLARE v_uses     INT;
  DECLARE v_days     INT;
  DECLARE v_loy      DECIMAL(5,2);
  DECLARE v_loyamt   DECIMAL(10,2);
  DECLARE v_promoamt DECIMAL(10,2);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT status, clientID, carID, totalPrice, startDate, endDate, promoCodeID
    INTO v_status, v_clientID, v_carID, v_total, v_start, v_end, v_cur
    FROM reservation WHERE reservationID = p_reservationID FOR UPDATE;
  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found';
  END IF;
  IF v_status <> 'Pending' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A promo code can only be applied to a Pending reservation';
  END IF;
  SELECT promoCodeID, discountType, discountValue, validFrom, validTo, minDays, maxUses, categoryID, isActive
    INTO v_pid, v_type, v_val, v_from, v_to, v_mindays, v_max, v_cat, v_active
    FROM promocode WHERE code = p_code FOR UPDATE;
  IF v_pid IS NULL OR v_active = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Promo code not found or inactive';
  END IF;
  IF CURDATE() < v_from OR CURDATE() > v_to THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Promo code is not valid today';
  END IF;
  SET v_days = GREATEST(1, CEIL(TIMESTAMPDIFF(SECOND, v_start, v_end) / 86400));
  IF v_days < v_mindays THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The rental is shorter than the minimum for this promo code';
  END IF;
  IF v_cat IS NOT NULL THEN
    SELECT categoryID INTO v_carcat FROM car WHERE carID = v_carID;
    IF v_carcat <> v_cat THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This promo code does not apply to the car category';
    END IF;
  END IF;
  IF v_max IS NOT NULL THEN
    SELECT COUNT(*) INTO v_uses FROM reservation
     WHERE promoCodeID = v_pid AND status <> 'Cancelled' AND reservationID <> p_reservationID;
    IF v_uses >= v_max THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This promo code has reached its usage limit';
    END IF;
  END IF;
  IF v_cur = v_pid THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This promo code is already applied';
  END IF;
  SET v_loy = fn_loyalty_percent(v_clientID);
  SET v_loyamt = ROUND(v_total * v_loy / 100, 2);
  IF v_type = 'Percent' THEN
    SET v_promoamt = ROUND(v_total * v_val / 100, 2);
  ELSE
    SET v_promoamt = LEAST(v_val, v_total);
  END IF;
  IF v_promoamt <= v_loyamt THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The client loyalty discount is already as good or better';
  END IF;
  IF v_type = 'Percent' THEN
    UPDATE reservation SET discountPercent = v_val, discountFixed = 0, promoCodeID = v_pid
     WHERE reservationID = p_reservationID;
  ELSE
    UPDATE reservation SET discountPercent = 0, discountFixed = v_promoamt, promoCodeID = v_pid
     WHERE reservationID = p_reservationID;
  END IF;
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_bill_damage` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_bill_damage`(IN p_damageID INT, IN p_amount DECIMAL(10,2))
BEGIN
  DECLARE v_res    INT;
  DECLARE v_cost   DECIMAL(10,2);
  DECLARE v_billed INT;
  DECLARE v_found  INT;
  DECLARE v_desc   VARCHAR(100);
  DECLARE v_amount DECIMAL(10,2);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT damageID, reservationID, repairCost, billedChargeID, LEFT(description, 100)
    INTO v_found, v_res, v_cost, v_billed, v_desc
  FROM damagereport WHERE damageID = p_damageID FOR UPDATE;
  IF v_found IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Damage report not found';
  END IF;
  IF v_res IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Damage is not linked to a reservation';
  END IF;
  IF v_billed IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Damage has already been billed';
  END IF;
  SET v_amount = COALESCE(p_amount, v_cost);
  IF v_amount IS NULL OR v_amount <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No amount to bill';
  END IF;
  INSERT INTO reservationcharge (reservationID, chargeType, description, quantity, unitAmount)
  VALUES (v_res, 'Damage', CONCAT('Damage #', p_damageID, ': ', v_desc), 1, v_amount);
  UPDATE damagereport SET billedChargeID = LAST_INSERT_ID() WHERE damageID = p_damageID;
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_bill_fine` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_bill_fine`(IN p_fineID INT)
BEGIN
  DECLARE v_status VARCHAR(10);
  DECLARE v_res    INT;
  DECLARE v_amount DECIMAL(10,2);
  DECLARE v_type   VARCHAR(10);
  DECLARE v_ref    VARCHAR(100);
  DECLARE v_admin  DECIMAL(10,2);
  DECLARE v_charge INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT status, reservationID, amount, fineType, referenceNo
    INTO v_status, v_res, v_amount, v_type, v_ref
    FROM trafficfine WHERE fineID = p_fineID FOR UPDATE;
  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Fine not found';
  END IF;
  IF v_status <> 'Received' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only a Received fine can be billed';
  END IF;
  IF v_res IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No rental matches this fine; link it to a reservation first';
  END IF;
  INSERT INTO reservationcharge (reservationID, chargeType, description, quantity, unitAmount)
  VALUES (v_res, IF(v_type = 'Toll', 'Toll', 'Fine'),
          CONCAT(v_type, ' #', p_fineID, IF(v_ref IS NULL, '', CONCAT(' ref ', v_ref))), 1, v_amount);
  SET v_charge = LAST_INSERT_ID();
  SET v_admin = fn_setting('fine_admin_fee', 0);
  IF v_admin > 0 THEN
    INSERT INTO reservationcharge (reservationID, chargeType, description, quantity, unitAmount)
    VALUES (v_res, 'Other', CONCAT('Administration fee for ', v_type, ' #', p_fineID), 1, v_admin);
  END IF;
  UPDATE trafficfine SET status = 'Billed', billedChargeID = v_charge WHERE fineID = p_fineID;
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_cancel_reservation` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_cancel_reservation`(IN p_reservationID INT, IN p_reason VARCHAR(255))
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_carID  INT;
  DECLARE v_start  DATETIME;
  DECLARE v_rate   DECIMAL(10,2);
  DECLARE v_days   DECIMAL(10,2);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT status, carID, startDate INTO v_status, v_carID, v_start
  FROM reservation WHERE reservationID = p_reservationID FOR UPDATE;
  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found';
  END IF;
  IF v_status <> 'Pending' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only a Pending reservation can be cancelled';
  END IF;
  UPDATE reservation
     SET status = 'Cancelled', cancellationReason = p_reason
   WHERE reservationID = p_reservationID;
  
  SET v_days = fn_setting('cancel_fee_days', 1);
  IF TIMESTAMPDIFF(MINUTE, NOW(), v_start) / 60 < fn_setting('cancel_free_hours', 24) AND v_days > 0 THEN
    SET v_rate = fn_get_daily_rate(v_carID, DATE(v_start));
    IF v_rate IS NOT NULL THEN
      INSERT INTO reservationcharge (reservationID, chargeType, description, quantity, unitAmount)
      VALUES (p_reservationID, 'CancellationFee', 'Late cancellation fee', v_days, v_rate);
    END IF;
  END IF;
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_client_login_failed` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_client_login_failed`(IN p_username VARCHAR(100))
BEGIN
  DECLARE v_max  INT DEFAULT 5;
  DECLARE v_mins INT DEFAULT 15;
  SET v_max  = CAST(fn_setting('max_failed_logins', 5) AS SIGNED);
  SET v_mins = CAST(fn_setting('lockout_minutes', 15) AS SIGNED);
  UPDATE `client`
     SET failedLoginCount  = IF(lockedUntil IS NOT NULL AND lockedUntil <= NOW(), 1, failedLoginCount + 1),
         lastFailedLoginAt = NOW(),
         lockedUntil       = IF(failedLoginCount >= v_max, DATE_ADD(NOW(), INTERVAL v_mins MINUTE), NULL)
   WHERE username = p_username
     AND (lockedUntil IS NULL OR lockedUntil <= NOW());
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_client_login_succeeded` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_client_login_succeeded`(IN p_username VARCHAR(100), OUT p_clientID INT)
BEGIN
  IF fn_client_login_state(p_username) <> 'OK' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Account is locked, inactive or unknown';
  END IF;
  SELECT clientID INTO p_clientID FROM `client` WHERE username = p_username;
  UPDATE `client` SET failedLoginCount = 0, lockedUntil = NULL, lastLoginAt = NOW()
   WHERE clientID = p_clientID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_client_set_credentials` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_client_set_credentials`(IN p_clientID INT, IN p_username VARCHAR(100), IN p_passwordHash VARCHAR(255))
BEGIN
  IF NOT EXISTS (SELECT 1 FROM `client` WHERE clientID = p_clientID) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Client not found';
  END IF;
  UPDATE `client` SET username = p_username, password = p_passwordHash,
         failedLoginCount = 0, lockedUntil = NULL
   WHERE clientID = p_clientID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_complete_rental` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_complete_rental`(
  IN p_reservationID INT, IN p_endMileage INT, IN p_returnedAt DATETIME)
BEGIN
  DECLARE v_status       VARCHAR(20);
  DECLARE v_startMileage INT;
  DECLARE v_carID        INT;
  DECLARE v_start        DATETIME;
  DECLARE v_end          DATETIME;
  DECLARE v_ret          DATETIME;
  DECLARE v_pickup       INT;
  DECLARE v_dropLoc      INT;
  DECLARE v_recv         INT;
  DECLARE v_hours_late   DECIMAL(10,2);
  DECLARE v_days         INT;
  DECLARE v_rate         DECIMAL(10,2);
  DECLARE v_endmil       INT;
  DECLARE v_retmil       INT;
  DECLARE v_retfuel      INT;
  DECLARE v_retclean     TINYINT(1);
  DECLARE v_pufuel       INT;
  DECLARE v_puclean      TINYINT(1);
  DECLARE v_fuelfee      DECIMAL(10,2);
  DECLARE v_missing      INT;
  DECLARE v_cleanfee     DECIMAL(10,2);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT status, startMileage, carID, startDate, endDate, pickupBranchID, dropoffLocationID
    INTO v_status, v_startMileage, v_carID, v_start, v_end, v_pickup, v_dropLoc
  FROM reservation WHERE reservationID = p_reservationID FOR UPDATE;
  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found';
  END IF;
  IF v_status <> 'Active' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only an Active reservation can be completed';
  END IF;
  SET v_recv = COALESCE((SELECT branchID FROM dropofflocation WHERE locationID = v_dropLoc), v_pickup);
  IF fn_branch_access_ok(v_recv) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Your account is restricted to another branch';
  END IF;
  SELECT mileage, fuelPercent, isClean INTO v_retmil, v_retfuel, v_retclean
    FROM vehiclecondition WHERE reservationID = p_reservationID AND stage = 'Return'
   ORDER BY conditionID DESC LIMIT 1;
  IF v_retmil IS NULL AND fn_setting('require_condition_report', 1) = 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Record the return condition report before completing the rental';
  END IF;
  SET v_endmil = COALESCE(p_endMileage, v_retmil);
  IF v_endmil IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'End mileage is required';
  END IF;
  IF v_retmil IS NOT NULL AND p_endMileage IS NOT NULL AND p_endMileage <> v_retmil THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'End mileage does not match the return condition report';
  END IF;
  IF v_startMileage IS NOT NULL AND v_endmil < v_startMileage THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'End mileage cannot be lower than start mileage';
  END IF;
  SET v_ret = COALESCE(p_returnedAt, NOW());
  IF v_ret < v_start THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Return time cannot be before the rental start';
  END IF;
  UPDATE reservation
     SET status = 'Completed', endMileage = v_endmil, returnedAt = v_ret
   WHERE reservationID = p_reservationID;
  
  SET v_hours_late = TIMESTAMPDIFF(MINUTE, v_end, v_ret) / 60;
  IF v_hours_late > fn_setting('late_grace_hours', 1) THEN
    SET v_days = CEIL(v_hours_late / 24);
    SET v_rate = fn_get_daily_rate(v_carID, DATE(v_end));
    IF v_rate IS NOT NULL THEN
      INSERT INTO reservationcharge (reservationID, chargeType, description, quantity, unitAmount)
      VALUES (p_reservationID, 'LateFee',
              CONCAT('Late return: ', v_days, ' day(s) late'),
              v_days, ROUND(v_rate * fn_setting('late_fee_multiplier', 1.5), 2));
    END IF;
  END IF;
  
  SELECT fuelPercent, isClean INTO v_pufuel, v_puclean
    FROM vehiclecondition WHERE reservationID = p_reservationID AND stage = 'Pickup'
   ORDER BY conditionID DESC LIMIT 1;
  SET v_fuelfee = fn_setting('fuel_fee_per_percent', 0);
  IF v_fuelfee > 0 AND v_pufuel IS NOT NULL AND v_retfuel IS NOT NULL THEN
    SET v_missing = v_pufuel - v_retfuel;
    IF v_missing > fn_setting('fuel_tolerance_percent', 5) THEN
      INSERT INTO reservationcharge (reservationID, chargeType, description, quantity, unitAmount)
      VALUES (p_reservationID, 'Fuel',
              CONCAT('Fuel: returned ', v_retfuel, '% instead of ', v_pufuel, '%'),
              v_missing, v_fuelfee);
    END IF;
  END IF;
  SET v_cleanfee = fn_setting('cleaning_fee', 0);
  IF v_cleanfee > 0 AND v_retclean = 0 AND COALESCE(v_puclean, 1) = 1 THEN
    INSERT INTO reservationcharge (reservationID, chargeType, description, quantity, unitAmount)
    VALUES (p_reservationID, 'Cleaning', 'Car returned dirty', 1, v_cleanfee);
  END IF;
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_create_reservation` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_create_reservation`(
  IN  p_clientID          INT,
  IN  p_carID             INT,
  IN  p_start             DATETIME,
  IN  p_end               DATETIME,
  IN  p_pickupBranchID    INT,
  IN  p_dropoffLocationID INT,
  OUT p_reservationID     INT)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  IF p_start >= p_end THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'End date must be after start date';
  END IF;
  START TRANSACTION;
  INSERT INTO reservation (clientID, carID, startDate, endDate, status,
                           pickupBranchID, dropoffLocationID)
  VALUES (p_clientID, p_carID, p_start, p_end, 'Pending',
          p_pickupBranchID, p_dropoffLocationID);
  SET p_reservationID = LAST_INSERT_ID();
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_get_available_cars` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_get_available_cars`(
  IN p_start DATETIME, IN p_end DATETIME, IN p_branchID INT)
BEGIN
  SELECT c.carID, c.plate, br.branchID, br.branchName, cc.categoryName,
         b.brandName, mo.modelName, c.fuelType, c.color, c.currentMileage,
         fn_get_daily_rate(c.carID, DATE(p_start)) AS dailyRate,
         fn_calculate_price(c.carID, p_start, p_end) AS estimatedTotal,
         cc.depositAmount
  FROM car c
  JOIN branch br      ON c.branchID = br.branchID AND br.isActive = 1
  JOIN carcategory cc ON c.categoryID = cc.categoryID
  JOIN model mo       ON c.modelID = mo.modelID
  JOIN brand b        ON mo.brandID = b.brandID
  WHERE (p_branchID IS NULL OR c.branchID = p_branchID)
    AND fn_is_car_available(c.carID, p_start, p_end, NULL) = 1
    AND fn_car_check(c.carID, p_end) IS NULL
    AND fn_calculate_price(c.carID, p_start, p_end) IS NOT NULL
  ORDER BY br.branchName, cc.categoryName, b.brandName, mo.modelName, c.plate;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_issue_invoice` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_issue_invoice`(IN p_reservationID INT, OUT p_invoiceID INT)
BEGIN
  DECLARE v_status   VARCHAR(20);
  DECLARE v_client   INT;
  DECLARE v_carID    INT;
  DECLARE v_start    DATETIME;
  DECLARE v_end      DATETIME;
  DECLARE v_gross    DECIMAL(10,2);
  DECLARE v_disc     DECIMAL(10,2);
  DECLARE v_promo    INT;
  DECLARE v_plate    VARCHAR(30);
  DECLARE v_name     VARCHAR(200);
  DECLARE v_email    VARCHAR(255);
  DECLARE v_addr     VARCHAR(400);
  DECLARE v_num      VARCHAR(30);
  DECLARE v_rate     DECIMAL(5,2);
  DECLARE v_line     INT DEFAULT 0;
  DECLARE v_total    DECIMAL(12,2);
  DECLARE v_charges  INT;
  DECLARE v_code     VARCHAR(30);
  
  DECLARE EXIT HANDLER FOR 1062
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'An invoice is already issued; void it first to re-issue';
  END;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT status, clientID, carID, startDate, endDate, COALESCE(totalPrice,0), discountAmount, promoCodeID
    INTO v_status, v_client, v_carID, v_start, v_end, v_gross, v_disc, v_promo
    FROM reservation WHERE reservationID = p_reservationID FOR UPDATE;
  
  
  CALL sp_next_doc_number('INV', v_num);
  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found';
  END IF;
  IF v_status NOT IN ('Completed','Cancelled') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only a Completed or Cancelled reservation can be invoiced';
  END IF;
  SELECT COUNT(*) INTO v_charges FROM reservationcharge WHERE reservationID = p_reservationID;
  IF v_status = 'Cancelled' AND v_charges = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nothing to invoice for this cancelled reservation';
  END IF;
  SELECT CONCAT(cl.name, ' ', cl.surname), cl.email,
         CONCAT_WS(', ', CONCAT_WS(' ', a.street, a.number), a.zip, ci.cityName, co.countryName)
    INTO v_name, v_email, v_addr
    FROM client cl
    LEFT JOIN address a  ON cl.addressID = a.addressID
    LEFT JOIN city ci    ON a.cityID = ci.cityID
    LEFT JOIN country co ON ci.countryID = co.countryID
   WHERE cl.clientID = v_client;
  SELECT plate INTO v_plate FROM car WHERE carID = v_carID;
  SELECT COALESCE((SELECT ratePercent FROM taxrule WHERE appliesTo = 'Rental'), 0) INTO v_rate;
  INSERT INTO invoice (invoiceNumber, invoiceType, reservationID, issuedByUserID, currencyCode,
                       customerName, customerEmail, customerAddress)
  VALUES (v_num, 'Invoice', p_reservationID, @app_user_id, fn_base_currency(), v_name, v_email, v_addr);
  SET p_invoiceID = LAST_INSERT_ID();
  IF v_status = 'Completed' THEN
    SET v_line = v_line + 1;
    INSERT INTO invoiceline (invoiceID, lineNo, description, quantity, unitAmount, amount, taxRatePercent, taxAmount)
    VALUES (p_invoiceID, v_line,
            CONCAT('Car rental ', v_plate, ' (', DATE_FORMAT(v_start, '%Y-%m-%d'), ' to ', DATE_FORMAT(v_end, '%Y-%m-%d'), ')'),
            1, v_gross, v_gross, v_rate, ROUND(v_gross * v_rate / 100, 2));
    IF v_disc > 0 THEN
      SET v_line = v_line + 1;
      SELECT code INTO v_code FROM promocode WHERE promoCodeID = v_promo;
      INSERT INTO invoiceline (invoiceID, lineNo, description, quantity, unitAmount, amount, taxRatePercent, taxAmount)
      VALUES (p_invoiceID, v_line,
              IF(v_code IS NULL, 'Discount (loyalty)', CONCAT('Discount (promo ', v_code, ')')),
              1, -v_disc, -v_disc, v_rate, ROUND(-v_disc * v_rate / 100, 2));
    END IF;
  END IF;
  INSERT INTO invoiceline (invoiceID, lineNo, description, quantity, unitAmount, amount, taxRatePercent, taxAmount)
  SELECT p_invoiceID, v_line + ROW_NUMBER() OVER (ORDER BY ch.chargeID),
         ch.description, ch.quantity, ch.unitAmount, ch.amount,
         COALESCE(tr.ratePercent, 0), ROUND(ch.amount * COALESCE(tr.ratePercent, 0) / 100, 2)
    FROM reservationcharge ch
    LEFT JOIN taxrule tr ON tr.appliesTo = ch.chargeType
   WHERE ch.reservationID = p_reservationID
   ORDER BY ch.chargeID;
  UPDATE invoice i
    JOIN (SELECT SUM(amount) a, SUM(taxAmount) t FROM invoiceline WHERE invoiceID = p_invoiceID) s
     SET i.subtotal = s.a, i.taxTotal = s.t, i.total = s.a + s.t,
         i.discount = IF(v_status = 'Completed', v_disc, 0), i.isFinal = 1
   WHERE i.invoiceID = p_invoiceID;
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_login_failed` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_login_failed`(IN p_username VARCHAR(100))
BEGIN
  DECLARE v_max  INT DEFAULT 5;
  DECLARE v_mins INT DEFAULT 15;
  SET v_max  = CAST(fn_setting('max_failed_logins', 5) AS SIGNED);
  SET v_mins = CAST(fn_setting('lockout_minutes', 15) AS SIGNED);
  UPDATE `user`
     SET failedLoginCount  = IF(lockedUntil IS NOT NULL AND lockedUntil <= NOW(), 1, failedLoginCount + 1),
         lastFailedLoginAt = NOW(),
         lockedUntil       = IF(failedLoginCount >= v_max, DATE_ADD(NOW(), INTERVAL v_mins MINUTE), NULL)
   WHERE username = p_username
     AND (lockedUntil IS NULL OR lockedUntil <= NOW());
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_login_succeeded` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_login_succeeded`(IN p_username VARCHAR(100), OUT p_userID INT)
BEGIN
  IF fn_login_state(p_username) <> 'OK' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Account is locked, inactive or unknown';
  END IF;
  SELECT userID INTO p_userID FROM `user` WHERE username = p_username;
  UPDATE `user` SET failedLoginCount = 0, lockedUntil = NULL, lastLoginAt = NOW()
   WHERE userID = p_userID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_mark_damage_repaired` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_mark_damage_repaired`(IN p_damageID INT, IN p_repairCost DECIMAL(10,2))
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  IF NOT EXISTS (SELECT 1 FROM damagereport WHERE damageID = p_damageID) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Damage report not found';
  END IF;

  UPDATE damagereport
     SET isRepaired = 1,
         repairCost = COALESCE(p_repairCost, repairCost)
   WHERE damageID = p_damageID;

  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_next_doc_number` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_next_doc_number`(IN p_type VARCHAR(10), OUT p_number VARCHAR(30))
BEGIN
  DECLARE v_year INT DEFAULT YEAR(CURDATE());
  DECLARE v_n    INT;
  UPDATE documentcounter SET lastNumber = lastNumber + 1 WHERE docType = p_type AND docYear = v_year;
  IF ROW_COUNT() = 0 THEN
    INSERT IGNORE INTO documentcounter (docType, docYear, lastNumber) VALUES (p_type, v_year, 0);
    UPDATE documentcounter SET lastNumber = lastNumber + 1 WHERE docType = p_type AND docYear = v_year;
  END IF;
  SELECT lastNumber INTO v_n FROM documentcounter WHERE docType = p_type AND docYear = v_year;
  SET p_number = CONCAT(p_type, '-', v_year, '-', LPAD(v_n, 6, '0'));
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_record_condition` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_record_condition`(
  IN  p_reservationID INT,
  IN  p_stage         VARCHAR(10),
  IN  p_mileage       INT,
  IN  p_fuelPercent   INT,
  IN  p_isClean       TINYINT,
  IN  p_existingDamage TEXT,
  IN  p_notes         TEXT,
  OUT p_conditionID   INT)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  INSERT INTO vehiclecondition (reservationID, stage, mileage, fuelPercent, isClean, existingDamage, notes)
  VALUES (p_reservationID, p_stage, p_mileage, p_fuelPercent, COALESCE(p_isClean, 1), p_existingDamage, p_notes);
  SET p_conditionID = LAST_INSERT_ID();
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_record_payment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_record_payment`(
  IN  p_reservationID INT,
  IN  p_type          VARCHAR(20),
  IN  p_amount        DECIMAL(10,2),
  IN  p_method        VARCHAR(20),
  IN  p_reference     VARCHAR(100),
  OUT p_paymentID     INT)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  INSERT INTO payment (reservationID, paymentType, amount, method, reference)
  VALUES (p_reservationID, p_type, p_amount, p_method, p_reference);
  SET p_paymentID = LAST_INSERT_ID();
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_record_payment_ccy` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_record_payment_ccy`(
  IN  p_reservationID INT,
  IN  p_type          VARCHAR(20),
  IN  p_amount        DECIMAL(10,2),
  IN  p_currency      CHAR(3),
  IN  p_method        VARCHAR(20),
  IN  p_reference     VARCHAR(100),
  OUT p_paymentID     INT)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  INSERT INTO payment (reservationID, paymentType, amount, currencyCode, method, reference)
  VALUES (p_reservationID, p_type, p_amount, p_currency, p_method, p_reference);
  SET p_paymentID = LAST_INSERT_ID();
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_refund_overpayment` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_refund_overpayment`(IN p_reservationID INT, IN p_method VARCHAR(20))
BEGIN
  DECLARE v_status  VARCHAR(20);
  DECLARE v_balance DECIMAL(12,2);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT status INTO v_status FROM reservation WHERE reservationID = p_reservationID FOR UPDATE;
  IF v_status IS NULL OR v_status NOT IN ('Completed','Cancelled') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Overpayments are refunded on a Completed or Cancelled reservation';
  END IF;
  SELECT balance INTO v_balance FROM view_reservationbalance WHERE reservationID = p_reservationID;
  IF v_balance >= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nothing to refund: the client has not overpaid';
  END IF;
  INSERT INTO payment (reservationID, paymentType, amount, method, reference)
  VALUES (p_reservationID, 'Refund', -v_balance, p_method, 'Overpayment refund');
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_remove_driver` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_remove_driver`(IN p_reservationID INT, IN p_clientID INT)
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_charge INT;
  DECLARE v_found  INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT status INTO v_status FROM reservation WHERE reservationID = p_reservationID FOR UPDATE;
  IF v_status IS NULL OR v_status <> 'Pending' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A driver can only be removed from a Pending reservation';
  END IF;
  SELECT reservationDriverID, feeChargeID INTO v_found, v_charge
    FROM reservationdriver WHERE reservationID = p_reservationID AND clientID = p_clientID;
  IF v_found IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'That driver is not on the reservation';
  END IF;
  DELETE FROM reservationdriver WHERE reservationDriverID = v_found;
  IF v_charge IS NOT NULL THEN
    DELETE FROM reservationcharge WHERE chargeID = v_charge;
  END IF;
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_remove_promo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_remove_promo`(IN p_reservationID INT)
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_client INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT status, clientID INTO v_status, v_client FROM reservation WHERE reservationID = p_reservationID FOR UPDATE;
  IF v_status IS NULL OR v_status <> 'Pending' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A promo code can only be removed from a Pending reservation';
  END IF;
  UPDATE reservation
     SET discountPercent = fn_loyalty_percent(v_client), discountFixed = 0, promoCodeID = NULL
   WHERE reservationID = p_reservationID;
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_report_damage` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_report_damage`(
  IN  p_carID         INT,
  IN  p_reservationID INT,
  IN  p_description   TEXT,
  IN  p_repairCost    DECIMAL(10,2),
  OUT p_damageID      INT)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  IF p_reservationID IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM reservation
                     WHERE reservationID = p_reservationID AND carID = p_carID) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Reservation does not belong to this car';
  END IF;

  START TRANSACTION;
  INSERT INTO damagereport (carID, reservationID, description, repairCost)
  VALUES (p_carID, p_reservationID, p_description, p_repairCost);
  SET p_damageID = LAST_INSERT_ID();
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_revenue_report` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_revenue_report`(IN p_from DATE, IN p_to DATE)
BEGIN
  SELECT b.brandName,
         COUNT(r.reservationID)                       AS totalReservations,
         COALESCE(SUM(r.totalPrice), 0)               AS grossRental,
         COALESCE(SUM(r.discountAmount), 0)           AS discounts,
         COALESCE(SUM(r.totalPrice - r.discountAmount), 0) AS totalRevenue,
         COALESCE(SUM((SELECT COALESCE(SUM(ch.amount), 0) FROM reservationcharge ch
                        WHERE ch.reservationID = r.reservationID)), 0) AS extraCharges
  FROM brand b
  JOIN model mo      ON mo.brandID = b.brandID
  JOIN car c         ON c.modelID = mo.modelID
  JOIN reservation r ON r.carID = c.carID
  WHERE r.status = 'Completed'
    AND r.startDate >= p_from
    AND r.startDate <  DATE_ADD(p_to, INTERVAL 1 DAY)
  GROUP BY b.brandName
  ORDER BY totalRevenue DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_settle_deposit` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_settle_deposit`(IN p_reservationID INT, IN p_method VARCHAR(20))
BEGIN
  DECLARE v_status  VARCHAR(20);
  DECLARE v_held    DECIMAL(12,2);
  DECLARE v_balance DECIMAL(12,2);
  DECLARE v_apply   DECIMAL(12,2);
  DECLARE v_rest    DECIMAL(12,2);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT status INTO v_status FROM reservation WHERE reservationID = p_reservationID FOR UPDATE;
  IF v_status IS NULL OR v_status NOT IN ('Completed','Cancelled') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The deposit can only be settled on a Completed or Cancelled reservation';
  END IF;
  SELECT depositHeld, balance INTO v_held, v_balance
    FROM view_reservationbalance WHERE reservationID = p_reservationID;
  IF v_held <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No deposit is held for this reservation';
  END IF;
  SET v_apply = LEAST(v_held, GREATEST(v_balance, 0));
  SET v_rest  = v_held - v_apply;
  IF v_apply > 0 THEN
    INSERT INTO payment (reservationID, paymentType, amount, method, reference)
    VALUES (p_reservationID, 'DepositRefund', v_apply, 'Other', 'Deposit applied to balance');
    INSERT INTO payment (reservationID, paymentType, amount, method, reference)
    VALUES (p_reservationID, 'Payment', v_apply, 'Other', 'Paid from deposit');
  END IF;
  IF v_rest > 0 THEN
    INSERT INTO payment (reservationID, paymentType, amount, method, reference)
    VALUES (p_reservationID, 'DepositRefund', v_rest, p_method, 'Deposit returned');
  END IF;
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_set_car_price` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_set_car_price`(IN p_carID INT, IN p_rate DECIMAL(10,2), IN p_from DATE)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  IF p_rate IS NULL OR p_rate <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Daily rate must be greater than zero';
  END IF;

  START TRANSACTION;

  IF EXISTS (SELECT 1 FROM pricehistory WHERE carID = p_carID AND effectiveFrom >= p_from) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'A price starting on or after this date already exists for this car';
  END IF;

  UPDATE pricehistory
     SET effectiveTo = DATE_SUB(p_from, INTERVAL 1 DAY)
   WHERE carID = p_carID
     AND effectiveFrom < p_from
     AND (effectiveTo IS NULL OR effectiveTo >= p_from);

  INSERT INTO pricehistory (carID, dailyRate, effectiveFrom, effectiveTo)
  VALUES (p_carID, p_rate, p_from, NULL);

  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_set_category_price` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_set_category_price`(IN p_categoryID INT, IN p_rate DECIMAL(10,2), IN p_from DATE)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  IF p_rate IS NULL OR p_rate <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Daily rate must be greater than zero';
  END IF;
  START TRANSACTION;
  IF EXISTS (SELECT 1 FROM categoryprice
              WHERE categoryID = p_categoryID AND isSeasonal = 0 AND effectiveFrom >= p_from) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'A base price starting on or after this date already exists for this category';
  END IF;
  UPDATE categoryprice
     SET effectiveTo = DATE_SUB(p_from, INTERVAL 1 DAY)
   WHERE categoryID = p_categoryID AND isSeasonal = 0
     AND effectiveFrom < p_from AND (effectiveTo IS NULL OR effectiveTo >= p_from);
  INSERT INTO categoryprice (categoryID, dailyRate, isSeasonal, effectiveFrom, effectiveTo)
  VALUES (p_categoryID, p_rate, 0, p_from, NULL);
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_set_category_season` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_set_category_season`(
  IN p_categoryID INT, IN p_rate DECIMAL(10,2), IN p_from DATE, IN p_to DATE, IN p_season VARCHAR(50))
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  IF p_rate IS NULL OR p_rate <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Daily rate must be greater than zero';
  END IF;
  IF p_to IS NULL OR p_to < p_from OR p_season IS NULL OR p_season = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A season needs a name and an end date on or after the start date';
  END IF;
  START TRANSACTION;
  INSERT INTO categoryprice (categoryID, dailyRate, isSeasonal, seasonName, effectiveFrom, effectiveTo)
  VALUES (p_categoryID, p_rate, 1, p_season, p_from, p_to);
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_set_fine_status` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_set_fine_status`(IN p_fineID INT, IN p_status VARCHAR(10))
BEGIN
  DECLARE v_old VARCHAR(10);
  SELECT status INTO v_old FROM trafficfine WHERE fineID = p_fineID;
  IF v_old IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Fine not found';
  END IF;
  IF (v_old = 'Billed'  AND p_status IN ('Paid','Disputed'))
  OR (v_old IN ('Received','Disputed') AND p_status IN ('Received','Disputed','Void')) THEN
    UPDATE trafficfine SET status = p_status WHERE fineID = p_fineID;
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'That status change is not allowed';
  END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_start_rental` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_start_rental`(IN p_reservationID INT)
BEGIN
  DECLARE v_status    VARCHAR(20);
  DECLARE v_carID     INT;
  DECLARE v_clientID  INT;
  DECLARE v_start     DATETIME;
  DECLARE v_end       DATETIME;
  DECLARE v_deposit   DECIMAL(10,2);
  DECLARE v_held      DECIMAL(12,2);
  DECLARE v_mileage   INT;
  DECLARE v_carstatus VARCHAR(20);
  DECLARE v_pickup    INT;
  DECLARE v_msg       VARCHAR(200);
  DECLARE v_bad       INT;
  DECLARE v_condmil   INT;
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  START TRANSACTION;
  SELECT status, carID, clientID, startDate, endDate, COALESCE(depositAmount, 0), pickupBranchID
    INTO v_status, v_carID, v_clientID, v_start, v_end, v_deposit, v_pickup
  FROM reservation WHERE reservationID = p_reservationID FOR UPDATE;
  IF v_status IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reservation not found';
  END IF;
  IF v_status <> 'Pending' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only a Pending reservation can be started';
  END IF;
  IF fn_branch_access_ok(v_pickup) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Your account is restricted to another branch';
  END IF;
  SET v_msg = fn_driver_check(v_clientID, v_start, v_end, 1);
  IF v_msg IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
  END IF;
  SELECT d.clientID, fn_driver_check(d.clientID, v_start, v_end, 1)
    INTO v_bad, v_msg
    FROM reservationdriver d
   WHERE d.reservationID = p_reservationID
     AND fn_driver_check(d.clientID, v_start, v_end, 1) IS NOT NULL
   LIMIT 1;
  IF v_bad IS NOT NULL THEN
    SET v_msg = LEFT(CONCAT('Additional driver #', v_bad, ': ', v_msg), 128);
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
  END IF;
  SET v_msg = fn_car_check(v_carID, v_end);
  IF v_msg IS NOT NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_msg;
  END IF;
  SELECT currentMileage, status INTO v_mileage, v_carstatus FROM car WHERE carID = v_carID FOR UPDATE;
  IF v_carstatus <> 'Available' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Car is not available (maintenance or inactive)';
  END IF;
  SELECT COALESCE(SUM(IF(paymentType = 'Deposit', amountBase, -amountBase)), 0) INTO v_held
    FROM payment
   WHERE reservationID = p_reservationID AND paymentType IN ('Deposit','DepositRefund');
  IF v_held < v_deposit THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Required deposit has not been paid';
  END IF;
  SELECT mileage INTO v_condmil FROM vehiclecondition
   WHERE reservationID = p_reservationID AND stage = 'Pickup'
   ORDER BY conditionID DESC LIMIT 1;
  IF v_condmil IS NULL AND fn_setting('require_condition_report', 1) = 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Record the pick-up condition report before handing over the car';
  END IF;
  UPDATE reservation
     SET status = 'Active', startMileage = COALESCE(v_condmil, v_mileage)
   WHERE reservationID = p_reservationID;
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_void_invoice` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = latin1 */ ;
/*!50003 SET character_set_results = latin1 */ ;
/*!50003 SET collation_connection  = latin1_swedish_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`admin`@`%` PROCEDURE `sp_void_invoice`(IN p_invoiceID INT, IN p_reason VARCHAR(255), OUT p_creditNoteID INT)
BEGIN
  DECLARE v_type   VARCHAR(12);
  DECLARE v_status VARCHAR(10);
  DECLARE v_res    INT;
  DECLARE v_num    VARCHAR(30);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  IF p_reason IS NULL OR p_reason = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A reason is required to void an invoice';
  END IF;
  START TRANSACTION;
  SELECT invoiceType, status, reservationID INTO v_type, v_status, v_res
    FROM invoice WHERE invoiceID = p_invoiceID FOR UPDATE;
  IF v_type IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invoice not found';
  END IF;
  IF v_type <> 'Invoice' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A credit note cannot be voided';
  END IF;
  IF v_status <> 'Issued' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'This invoice is already voided';
  END IF;
  CALL sp_next_doc_number('CRN', v_num);
  INSERT INTO invoice (invoiceNumber, invoiceType, reservationID, creditsInvoiceID, issuedByUserID,
                       currencyCode, customerName, customerEmail, customerAddress, voidReason)
  SELECT v_num, 'CreditNote', reservationID, invoiceID, @app_user_id,
         currencyCode, customerName, customerEmail, customerAddress, p_reason
    FROM invoice WHERE invoiceID = p_invoiceID;
  SET p_creditNoteID = LAST_INSERT_ID();
  INSERT INTO invoiceline (invoiceID, lineNo, description, quantity, unitAmount, amount, taxRatePercent, taxAmount)
  SELECT p_creditNoteID, lineNo, description, quantity, -unitAmount, -amount, taxRatePercent, -taxAmount
    FROM invoiceline WHERE invoiceID = p_invoiceID;
  UPDATE invoice c JOIN invoice o ON o.invoiceID = p_invoiceID
     SET c.subtotal = -o.subtotal, c.taxTotal = -o.taxTotal, c.total = -o.total,
         c.discount = -o.discount, c.isFinal = 1
   WHERE c.invoiceID = p_creditNoteID;
  UPDATE invoice SET status = 'Voided', voidReason = p_reason WHERE invoiceID = p_invoiceID;
  COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `view_additionaldriver`
--

/*!50001 DROP VIEW IF EXISTS `view_additionaldriver`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_additionaldriver` AS select `d`.`reservationID` AS `reservationID`,`d`.`clientID` AS `clientID`,`cl`.`name` AS `name`,`cl`.`surname` AS `surname`,`d`.`addedAt` AS `addedAt`,`u`.`username` AS `addedBy` from ((`reservationdriver` `d` join `client` `cl` on((`cl`.`clientID` = `d`.`clientID`))) left join `user` `u` on((`u`.`userID` = `d`.`addedByUserID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_address`
--

/*!50001 DROP VIEW IF EXISTS `view_address`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY INVOKER */
/*!50001 VIEW `view_address` AS select `a`.`addressID` AS `addressID`,`a`.`street` AS `street`,`a`.`number` AS `number`,`a`.`apt` AS `apt`,`a`.`zip` AS `zip`,`c`.`cityName` AS `cityName`,`co`.`countryName` AS `countryName` from ((`address` `a` join `city` `c` on((`a`.`cityID` = `c`.`cityID`))) join `country` `co` on((`c`.`countryID` = `co`.`countryID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_availablecars`
--

/*!50001 DROP VIEW IF EXISTS `view_availablecars`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_availablecars` AS select `c`.`carID` AS `carID`,`c`.`plate` AS `plate`,`b`.`brandName` AS `brandName`,`mo`.`modelName` AS `modelName`,`cc`.`categoryName` AS `categoryName`,`c`.`currentMileage` AS `currentMileage`,`fn_get_daily_rate`(`c`.`carID`,curdate()) AS `dailyRate`,`br`.`branchName` AS `branchName` from ((((`car` `c` join `model` `mo` on((`c`.`modelID` = `mo`.`modelID`))) join `brand` `b` on((`mo`.`brandID` = `b`.`brandID`))) join `carcategory` `cc` on((`c`.`categoryID` = `cc`.`categoryID`))) join `branch` `br` on(((`c`.`branchID` = `br`.`branchID`) and (`br`.`isActive` = 1)))) where ((`c`.`status` = 'Available') and (`fn_get_daily_rate`(`c`.`carID`,curdate()) is not null) and (`fn_car_check`(`c`.`carID`,curdate()) is null) and exists(select 1 from `reservation` `r` where ((`r`.`carID` = `c`.`carID`) and (`r`.`status` in ('Pending','Active')) and ((curdate() between cast(`r`.`startDate` as date) and cast(`r`.`endDate` as date)) or ((`r`.`status` = 'Active') and (`r`.`endDate` < now()))))) is false) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_branch`
--

/*!50001 DROP VIEW IF EXISTS `view_branch`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_branch` AS select `br`.`branchID` AS `branchID`,`br`.`branchName` AS `branchName`,`a`.`street` AS `street`,`a`.`number` AS `number`,`a`.`zip` AS `zip`,`c`.`cityName` AS `cityName`,`co`.`countryName` AS `countryName`,`br`.`phone` AS `phone`,`br`.`isActive` AS `isActive` from (((`branch` `br` join `address` `a` on((`br`.`addressID` = `a`.`addressID`))) join `city` `c` on((`a`.`cityID` = `c`.`cityID`))) join `country` `co` on((`c`.`countryID` = `co`.`countryID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_brandrevenue`
--

/*!50001 DROP VIEW IF EXISTS `view_brandrevenue`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_brandrevenue` AS select `b`.`brandName` AS `brandName`,count(`r`.`reservationID`) AS `totalReservations`,sum((`r`.`totalPrice` - `r`.`discountAmount`)) AS `totalRevenue`,sum(coalesce((select sum(`ch`.`amount`) from `reservationcharge` `ch` where (`ch`.`reservationID` = `r`.`reservationID`)),0)) AS `extraCharges` from (((`brand` `b` join `model` `mo` on((`b`.`brandID` = `mo`.`brandID`))) join `car` `c` on((`mo`.`modelID` = `c`.`modelID`))) join `reservation` `r` on((`c`.`carID` = `r`.`carID`))) where (`r`.`status` = 'Completed') group by `b`.`brandName` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_car`
--

/*!50001 DROP VIEW IF EXISTS `view_car`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_car` AS select `c`.`carID` AS `carID`,`m`.`name` AS `manufacturerName`,`b`.`brandName` AS `brandName`,`mo`.`modelName` AS `modelName`,`c`.`plate` AS `plate`,`c`.`color` AS `color`,`c`.`fuelType` AS `fuelType`,`br`.`branchName` AS `branchName`,`cc`.`categoryName` AS `categoryName` from (((((`car` `c` join `model` `mo` on((`c`.`modelID` = `mo`.`modelID`))) join `brand` `b` on((`mo`.`brandID` = `b`.`brandID`))) join `manufacturer` `m` on((`b`.`manufacturerID` = `m`.`manufacturerID`))) join `branch` `br` on((`c`.`branchID` = `br`.`branchID`))) join `carcategory` `cc` on((`c`.`categoryID` = `cc`.`categoryID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_carcompliance`
--

/*!50001 DROP VIEW IF EXISTS `view_carcompliance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_carcompliance` AS select `c`.`carID` AS `carID`,`c`.`plate` AS `plate`,`br`.`branchName` AS `branchName`,`c`.`status` AS `status`,`c`.`currentMileage` AS `currentMileage`,`c`.`insuranceExpiry` AS `insuranceExpiry`,`c`.`registrationExpiry` AS `registrationExpiry`,`c`.`inspectionExpiry` AS `inspectionExpiry`,`c`.`nextServiceDate` AS `nextServiceDate`,`c`.`nextServiceMileage` AS `nextServiceMileage`,concat_ws(', ',if((`c`.`insuranceExpiry` is null),'insurance missing',if((`c`.`insuranceExpiry` < curdate()),'insurance expired',if((`c`.`insuranceExpiry` < (curdate() + interval 30 day)),'insurance expires soon',NULL))),if((`c`.`registrationExpiry` is null),'registration missing',if((`c`.`registrationExpiry` < curdate()),'registration expired',if((`c`.`registrationExpiry` < (curdate() + interval 30 day)),'registration expires soon',NULL))),if((`c`.`inspectionExpiry` is null),'inspection missing',if((`c`.`inspectionExpiry` < curdate()),'inspection expired',if((`c`.`inspectionExpiry` < (curdate() + interval 30 day)),'inspection expires soon',NULL))),if(((`c`.`nextServiceDate` is not null) and (`c`.`nextServiceDate` <= (curdate() + interval 30 day))),'service due (date)',NULL),if(((`c`.`nextServiceMileage` is not null) and (`c`.`currentMileage` >= (`c`.`nextServiceMileage` - 1000))),'service due (mileage)',NULL)) AS `issues` from (`car` `c` join `branch` `br` on((`c`.`branchID` = `br`.`branchID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_categoryprice`
--

/*!50001 DROP VIEW IF EXISTS `view_categoryprice`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_categoryprice` AS select `cp`.`priceID` AS `priceID`,`cc`.`categoryName` AS `categoryName`,`cp`.`dailyRate` AS `dailyRate`,if((`cp`.`isSeasonal` = 1),`cp`.`seasonName`,'Base') AS `priceKind`,`cp`.`effectiveFrom` AS `effectiveFrom`,`cp`.`effectiveTo` AS `effectiveTo` from (`categoryprice` `cp` join `carcategory` `cc` on((`cp`.`categoryID` = `cc`.`categoryID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_client`
--

/*!50001 DROP VIEW IF EXISTS `view_client`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY INVOKER */
/*!50001 VIEW `view_client` AS select `cl`.`clientID` AS `clientID`,`cl`.`name` AS `name`,`cl`.`surname` AS `surname`,`cl`.`email` AS `email`,`cl`.`phone` AS `phone`,`a`.`street` AS `street`,`a`.`number` AS `number`,`a`.`zip` AS `zip`,`c`.`cityName` AS `cityName`,`co`.`countryName` AS `countryName` from (((`client` `cl` left join `address` `a` on((`cl`.`addressID` = `a`.`addressID`))) left join `city` `c` on((`a`.`cityID` = `c`.`cityID`))) left join `country` `co` on((`c`.`countryID` = `co`.`countryID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_clientsummary`
--

/*!50001 DROP VIEW IF EXISTS `view_clientsummary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_clientsummary` AS select `cl`.`clientID` AS `clientID`,`cl`.`name` AS `name`,`cl`.`surname` AS `surname`,count(`r`.`reservationID`) AS `totalRentals`,coalesce(sum(((`r`.`totalPrice` - `r`.`discountAmount`) + coalesce((select sum(`ch`.`amount`) from `reservationcharge` `ch` where (`ch`.`reservationID` = `r`.`reservationID`)),0))),0) AS `lifetimeSpend` from (`client` `cl` left join `reservation` `r` on(((`cl`.`clientID` = `r`.`clientID`) and (`r`.`status` = 'Completed')))) group by `cl`.`clientID`,`cl`.`name`,`cl`.`surname` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_conditioncompare`
--

/*!50001 DROP VIEW IF EXISTS `view_conditioncompare`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_conditioncompare` AS select `r`.`reservationID` AS `reservationID`,`c`.`plate` AS `plate`,`pu`.`recordedAt` AS `pickupAt`,`pu`.`mileage` AS `pickupMileage`,`pu`.`fuelPercent` AS `pickupFuel`,`pu`.`isClean` AS `pickupClean`,`pu`.`existingDamage` AS `damageAtPickup`,(select count(0) from `conditionphoto` `ph` where (`ph`.`conditionID` = `pu`.`conditionID`)) AS `pickupPhotos`,`rt`.`recordedAt` AS `returnAt`,`rt`.`mileage` AS `returnMileage`,`rt`.`fuelPercent` AS `returnFuel`,`rt`.`isClean` AS `returnClean`,`rt`.`existingDamage` AS `damageAtReturn`,`rt`.`notes` AS `returnNotes`,(select count(0) from `conditionphoto` `ph` where (`ph`.`conditionID` = `rt`.`conditionID`)) AS `returnPhotos`,(`rt`.`mileage` - `pu`.`mileage`) AS `distanceDriven`,(`pu`.`fuelPercent` - `rt`.`fuelPercent`) AS `fuelUsedPercent` from (((`reservation` `r` join `car` `c` on((`c`.`carID` = `r`.`carID`))) left join `vehiclecondition` `pu` on((`pu`.`conditionID` = (select max(`v`.`conditionID`) from `vehiclecondition` `v` where ((`v`.`reservationID` = `r`.`reservationID`) and (`v`.`stage` = 'Pickup')))))) left join `vehiclecondition` `rt` on((`rt`.`conditionID` = (select max(`v`.`conditionID`) from `vehiclecondition` `v` where ((`v`.`reservationID` = `r`.`reservationID`) and (`v`.`stage` = 'Return')))))) where ((`pu`.`conditionID` is not null) or (`rt`.`conditionID` is not null)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_damagereport`
--

/*!50001 DROP VIEW IF EXISTS `view_damagereport`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY INVOKER */
/*!50001 VIEW `view_damagereport` AS select `d`.`damageID` AS `damageID`,`c`.`plate` AS `carPlate`,`mo`.`modelName` AS `modelName`,`d`.`reservationID` AS `reservationID`,`d`.`reportDate` AS `reportDate`,`d`.`description` AS `description`,`d`.`repairCost` AS `repairCost`,`d`.`isRepaired` AS `isRepaired` from ((`damagereport` `d` join `car` `c` on((`d`.`carID` = `c`.`carID`))) join `model` `mo` on((`c`.`modelID` = `mo`.`modelID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_dropofflocation`
--

/*!50001 DROP VIEW IF EXISTS `view_dropofflocation`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_dropofflocation` AS select `d`.`locationID` AS `locationID`,`d`.`locationName` AS `locationName`,`a`.`street` AS `street`,`a`.`number` AS `number`,`a`.`zip` AS `zip`,`c`.`cityName` AS `cityName`,`co`.`countryName` AS `countryName`,`br`.`branchName` AS `branchName`,`d`.`isActive` AS `isActive` from ((((`dropofflocation` `d` join `address` `a` on((`d`.`addressID` = `a`.`addressID`))) join `city` `c` on((`a`.`cityID` = `c`.`cityID`))) join `country` `co` on((`c`.`countryID` = `co`.`countryID`))) join `branch` `br` on((`d`.`branchID` = `br`.`branchID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_fine`
--

/*!50001 DROP VIEW IF EXISTS `view_fine`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_fine` AS select `f`.`fineID` AS `fineID`,`c`.`plate` AS `plate`,`f`.`fineType` AS `fineType`,`f`.`occurredAt` AS `occurredAt`,`f`.`amount` AS `amount`,`f`.`referenceNo` AS `referenceNo`,`f`.`status` AS `status`,`f`.`reservationID` AS `reservationID`,concat(`cl`.`name`,' ',`cl`.`surname`) AS `clientName` from (((`trafficfine` `f` join `car` `c` on((`c`.`carID` = `f`.`carID`))) left join `reservation` `r` on((`r`.`reservationID` = `f`.`reservationID`))) left join `client` `cl` on((`cl`.`clientID` = `r`.`clientID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_invoice`
--

/*!50001 DROP VIEW IF EXISTS `view_invoice`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_invoice` AS select `i`.`invoiceID` AS `invoiceID`,`i`.`invoiceNumber` AS `invoiceNumber`,`i`.`invoiceType` AS `invoiceType`,`i`.`status` AS `status`,`i`.`reservationID` AS `reservationID`,`i`.`issuedAt` AS `issuedAt`,`i`.`customerName` AS `customerName`,`i`.`currencyCode` AS `currencyCode`,`i`.`subtotal` AS `subtotal`,`i`.`taxTotal` AS `taxTotal`,`i`.`total` AS `total`,`i`.`creditsInvoiceID` AS `creditsInvoiceID`,`i`.`voidReason` AS `voidReason`,`u`.`username` AS `issuedBy` from (`invoice` `i` left join `user` `u` on((`u`.`userID` = `i`.`issuedByUserID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_invoicestatus`
--

/*!50001 DROP VIEW IF EXISTS `view_invoicestatus`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_invoicestatus` AS select `b`.`reservationID` AS `reservationID`,`b`.`status` AS `reservationStatus`,`b`.`totalDue` AS `currentTotal`,`i`.`invoiceNumber` AS `invoiceNumber`,`i`.`total` AS `invoicedTotal`,(case when (`i`.`invoiceID` is null) then 'NotInvoiced' when (`i`.`total` <> `b`.`totalDue`) then 'Outdated' else 'UpToDate' end) AS `invoiceState` from (`view_reservationbalance` `b` left join `invoice` `i` on((`i`.`activeKey` = `b`.`reservationID`))) where ((`b`.`status` in ('Completed','Cancelled')) and ((`i`.`invoiceID` is not null) or (`b`.`totalDue` <> 0))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_maintenance`
--

/*!50001 DROP VIEW IF EXISTS `view_maintenance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_maintenance` AS select `m`.`maintenanceID` AS `maintenanceID`,`c`.`plate` AS `plate`,`m`.`serviceType` AS `serviceType`,`m`.`serviceDate` AS `serviceDate`,`m`.`mileage` AS `mileage`,`m`.`cost` AS `cost`,`m`.`description` AS `description`,`m`.`performedBy` AS `performedBy`,`m`.`nextDueDate` AS `nextDueDate`,`m`.`nextDueMileage` AS `nextDueMileage`,`u`.`username` AS `loggedBy` from ((`maintenancerecord` `m` join `car` `c` on((`m`.`carID` = `c`.`carID`))) left join `user` `u` on((`m`.`createdByUserID` = `u`.`userID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_overduereservations`
--

/*!50001 DROP VIEW IF EXISTS `view_overduereservations`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY INVOKER */
/*!50001 VIEW `view_overduereservations` AS select `r`.`reservationID` AS `reservationID`,`cl`.`name` AS `clientName`,`cl`.`surname` AS `clientSurname`,`cl`.`phone` AS `clientPhone`,`c`.`plate` AS `carPlate`,`r`.`endDate` AS `endDate`,timestampdiff(HOUR,`r`.`endDate`,now()) AS `hoursOverdue` from ((`reservation` `r` join `client` `cl` on((`r`.`clientID` = `cl`.`clientID`))) join `car` `c` on((`r`.`carID` = `c`.`carID`))) where ((`r`.`status` = 'Active') and (`r`.`endDate` < now())) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_payment`
--

/*!50001 DROP VIEW IF EXISTS `view_payment`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_payment` AS select `p`.`paymentID` AS `paymentID`,`p`.`receiptNumber` AS `receiptNumber`,`p`.`reservationID` AS `reservationID`,`p`.`paymentType` AS `paymentType`,`p`.`amount` AS `amount`,`p`.`currencyCode` AS `currencyCode`,`p`.`exchangeRate` AS `exchangeRate`,`p`.`amountBase` AS `amountBase`,`p`.`method` AS `method`,`p`.`reference` AS `reference`,`p`.`paidAt` AS `paidAt`,`u`.`username` AS `receivedBy` from (`payment` `p` left join `user` `u` on((`p`.`receivedByUserID` = `u`.`userID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_pendingrefunds`
--

/*!50001 DROP VIEW IF EXISTS `view_pendingrefunds`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_pendingrefunds` AS select `b`.`reservationID` AS `reservationID`,`b`.`status` AS `status`,concat(`cl`.`name`,' ',`cl`.`surname`) AS `clientName`,if((`b`.`balance` < 0),-(`b`.`balance`),0) AS `overpaymentToRefund`,`b`.`depositHeld` AS `depositHeld` from ((`view_reservationbalance` `b` join `reservation` `r` on((`r`.`reservationID` = `b`.`reservationID`))) join `client` `cl` on((`cl`.`clientID` = `r`.`clientID`))) where ((`b`.`status` in ('Completed','Cancelled')) and ((`b`.`balance` < 0) or (`b`.`depositHeld` > 0))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_pricehistory`
--

/*!50001 DROP VIEW IF EXISTS `view_pricehistory`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY INVOKER */
/*!50001 VIEW `view_pricehistory` AS select `ph`.`priceID` AS `priceID`,`c`.`plate` AS `plate`,`mo`.`modelName` AS `modelName`,`ph`.`dailyRate` AS `dailyRate`,`ph`.`effectiveFrom` AS `effectiveFrom`,`ph`.`effectiveTo` AS `effectiveTo` from ((`pricehistory` `ph` join `car` `c` on((`ph`.`carID` = `c`.`carID`))) join `model` `mo` on((`c`.`modelID` = `mo`.`modelID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_reservation`
--

/*!50001 DROP VIEW IF EXISTS `view_reservation`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_reservation` AS select `r`.`reservationID` AS `reservationID`,`cl`.`name` AS `clientName`,`cl`.`surname` AS `clientSurname`,`c`.`plate` AS `carPlate`,`b`.`brandName` AS `brandName`,`mo`.`modelName` AS `modelName`,`r`.`startDate` AS `startDate`,`r`.`endDate` AS `endDate`,`r`.`status` AS `status`,`r`.`totalPrice` AS `totalPrice`,`pb`.`branchName` AS `pickupBranch`,coalesce(`d`.`locationName`,`pb`.`branchName`) AS `dropoffPlace` from ((((((`reservation` `r` join `client` `cl` on((`r`.`clientID` = `cl`.`clientID`))) join `car` `c` on((`r`.`carID` = `c`.`carID`))) join `model` `mo` on((`c`.`modelID` = `mo`.`modelID`))) join `brand` `b` on((`mo`.`brandID` = `b`.`brandID`))) join `branch` `pb` on((`r`.`pickupBranchID` = `pb`.`branchID`))) left join `dropofflocation` `d` on((`r`.`dropoffLocationID` = `d`.`locationID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_reservationbalance`
--

/*!50001 DROP VIEW IF EXISTS `view_reservationbalance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_reservationbalance` AS select `x`.`reservationID` AS `reservationID`,`x`.`status` AS `status`,`x`.`rentalGross` AS `rentalGross`,`x`.`discount` AS `discount`,(`x`.`rentalGross` - `x`.`discount`) AS `rentalDue`,`x`.`charges` AS `charges`,`x`.`tax` AS `tax`,(((`x`.`rentalGross` - `x`.`discount`) + `x`.`charges`) + `x`.`tax`) AS `totalDue`,`x`.`paid` AS `paid`,((((`x`.`rentalGross` - `x`.`discount`) + `x`.`charges`) + `x`.`tax`) - `x`.`paid`) AS `balance`,`x`.`depositRequired` AS `depositRequired`,`x`.`depositHeld` AS `depositHeld`,(case when (((((`x`.`rentalGross` - `x`.`discount`) + `x`.`charges`) + `x`.`tax`) = 0) and (`x`.`paid` = 0)) then 'NoCharge' when (`x`.`paid` <= 0) then 'Unpaid' when (`x`.`paid` < (((`x`.`rentalGross` - `x`.`discount`) + `x`.`charges`) + `x`.`tax`)) then 'Partial' when (`x`.`paid` = (((`x`.`rentalGross` - `x`.`discount`) + `x`.`charges`) + `x`.`tax`)) then 'Paid' else 'Overpaid' end) AS `paymentStatus` from (select `r`.`reservationID` AS `reservationID`,`r`.`status` AS `status`,if((`r`.`status` = 'Cancelled'),0,coalesce(`r`.`totalPrice`,0)) AS `rentalGross`,if((`r`.`status` = 'Cancelled'),0,`r`.`discountAmount`) AS `discount`,coalesce((select sum(`ch`.`amount`) from `reservationcharge` `ch` where (`ch`.`reservationID` = `r`.`reservationID`)),0) AS `charges`,(if((`r`.`status` = 'Cancelled'),0,(round(((coalesce(`r`.`totalPrice`,0) * coalesce((select `t`.`ratePercent` from `taxrule` `t` where (`t`.`appliesTo` = 'Rental')),0)) / 100),2) - round(((`r`.`discountAmount` * coalesce((select `t`.`ratePercent` from `taxrule` `t` where (`t`.`appliesTo` = 'Rental')),0)) / 100),2))) + coalesce((select sum(round(((`ch`.`amount` * coalesce(`tr`.`ratePercent`,0)) / 100),2)) from (`reservationcharge` `ch` left join `taxrule` `tr` on((`tr`.`appliesTo` = `ch`.`chargeType`))) where (`ch`.`reservationID` = `r`.`reservationID`)),0)) AS `tax`,coalesce((select sum(if((`p`.`paymentType` = 'Payment'),`p`.`amountBase`,-(`p`.`amountBase`))) from `payment` `p` where ((`p`.`reservationID` = `r`.`reservationID`) and (`p`.`paymentType` in ('Payment','Refund')))),0) AS `paid`,coalesce(`r`.`depositAmount`,0) AS `depositRequired`,coalesce((select sum(if((`p`.`paymentType` = 'Deposit'),`p`.`amountBase`,-(`p`.`amountBase`))) from `payment` `p` where ((`p`.`reservationID` = `r`.`reservationID`) and (`p`.`paymentType` in ('Deposit','DepositRefund')))),0) AS `depositHeld` from `reservation` `r`) `x` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_reservationcharge`
--

/*!50001 DROP VIEW IF EXISTS `view_reservationcharge`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_reservationcharge` AS select `ch`.`chargeID` AS `chargeID`,`ch`.`reservationID` AS `reservationID`,`ch`.`chargeType` AS `chargeType`,`ch`.`description` AS `description`,`ch`.`quantity` AS `quantity`,`ch`.`unitAmount` AS `unitAmount`,`ch`.`amount` AS `amount`,`ch`.`createdAt` AS `createdAt`,`u`.`username` AS `createdBy` from (`reservationcharge` `ch` left join `user` `u` on((`ch`.`createdByUserID` = `u`.`userID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_rolepermission`
--

/*!50001 DROP VIEW IF EXISTS `view_rolepermission`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY INVOKER */
/*!50001 VIEW `view_rolepermission` AS select `rp`.`roleID` AS `roleID`,`r`.`roleName` AS `roleName`,`rp`.`permissionID` AS `permissionID`,`p`.`permissionName` AS `permissionName` from ((`rolepermission` `rp` join `role` `r` on((`rp`.`roleID` = `r`.`roleID`))) join `permission` `p` on((`rp`.`permissionID` = `p`.`permissionID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_user`
--

/*!50001 DROP VIEW IF EXISTS `view_user`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `view_user` AS select `u`.`userID` AS `userID`,`u`.`username` AS `username`,`u`.`email` AS `email`,`r`.`roleName` AS `roleName`,`u`.`isActive` AS `isActive`,`br`.`branchName` AS `branchName`,`u`.`failedLoginCount` AS `failedLoginCount`,`u`.`lockedUntil` AS `lockedUntil`,((`u`.`lockedUntil` is not null) and (`u`.`lockedUntil` > now())) AS `isLocked`,`u`.`lastLoginAt` AS `lastLoginAt` from ((`user` `u` join `role` `r` on((`u`.`roleID` = `r`.`roleID`))) left join `branch` `br` on((`u`.`branchID` = `br`.`branchID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `view_verification`
--

/*!50001 DROP VIEW IF EXISTS `view_verification`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`admin`@`%` SQL SECURITY INVOKER */
/*!50001 VIEW `view_verification` AS select `v`.`verificationID` AS `verificationID`,`cl`.`name` AS `clientName`,`cl`.`surname` AS `clientSurname`,`v`.`documentID` AS `documentID`,`co`.`countryName` AS `documentCountry`,`v`.`attribute` AS `attribute`,`v`.`isVerified` AS `isVerified` from ((`verification` `v` join `client` `cl` on((`v`.`clientID` = `cl`.`clientID`))) left join `country` `co` on((`v`.`documentCountryID` = `co`.`countryID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-25  4:05:00
