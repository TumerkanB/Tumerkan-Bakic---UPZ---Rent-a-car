
CREATE TABLE Country (
    countryID INT AUTO_INCREMENT PRIMARY KEY,
    countryName VARCHAR(100) NOT NULL
);

CREATE TABLE City (
    cityID INT AUTO_INCREMENT PRIMARY KEY,
    cityName VARCHAR(100) NOT NULL,
    countryID INT,
    FOREIGN KEY (countryID) REFERENCES Country(countryID)
);

CREATE TABLE Address (
    addressID INT AUTO_INCREMENT PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20) NOT NULL,
    apt VARCHAR(20),
    zip VARCHAR(20) NOT NULL,
    cityID INT,
    FOREIGN KEY (cityID) REFERENCES City(cityID)
);


CREATE TABLE Role (
    roleID INT AUTO_INCREMENT PRIMARY KEY,
    roleName VARCHAR(50) NOT NULL
);
DD
CREATE TABLE Permission (
    permissionID INT AUTO_INCREMENT PRIMARY KEY,
    permissionName VARCHAR(50) NOT NULL
);

CREATE TABLE RolePermission (
    roleID INT,
    permissionID INT,
    PRIMARY KEY (roleID, permissionID),
    FOREIGN KEY (roleID) REFERENCES Role(roleID),
    FOREIGN KEY (permissionID) REFERENCES Permission(permissionID)
);

CREATE TABLE User (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    roleID INT,
    FOREIGN KEY (roleID) REFERENCES Role(roleID)
);


CREATE TABLE Client (
    clientID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    addressID INT,
    FOREIGN KEY (addressID) REFERENCES Address(addressID)
);

CREATE TABLE Verification (
    verificationID INT AUTO_INCREMENT PRIMARY KEY,
    clientID INT,
    documentID VARCHAR(100) NOT NULL,
    documentCountryID INT,
    attribute VARCHAR(100),
    isVerified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (clientID) REFERENCES Client(clientID),
    FOREIGN KEY (documentCountryID) REFERENCES Country(countryID)
);


CREATE TABLE Manufacturer (
    manufacturerID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Brand (
    brandID INT AUTO_INCREMENT PRIMARY KEY,
    brandName VARCHAR(100) NOT NULL,
    manufacturerID INT,
    FOREIGN KEY (manufacturerID) REFERENCES Manufacturer(manufacturerID)
);

CREATE TABLE Model (
    modelID INT AUTO_INCREMENT PRIMARY KEY,
    modelName VARCHAR(100) NOT NULL,
    brandID INT,
    FOREIGN KEY (brandID) REFERENCES Brand(brandID)
);

CREATE TABLE Car (
    carID INT AUTO_INCREMENT PRIMARY KEY,
    modelID INT,
    plate VARCHAR(20) UNIQUE NOT NULL,
    color VARCHAR(50),
    fuelType ENUM('Gas', 'Diesel', 'Electric', 'Hybrid') NOT NULL,
    FOREIGN KEY (modelID) REFERENCES Model(modelID)
);

CREATE TABLE PriceHistory (
    priceID INT AUTO_INCREMENT PRIMARY KEY,
    carID INT,
    dailyRate DECIMAL(10,2) NOT NULL,
    effectiveFrom DATE NOT NULL,
    effectiveTo DATE,
    FOREIGN KEY (carID) REFERENCES Car(carID)
);


CREATE TABLE Reservation (
    reservationID INT AUTO_INCREMENT PRIMARY KEY,
    clientID INT,
    carID INT,
    startDate DATETIME NOT NULL,
    endDate DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    totalPrice DECIMAL(10,2),
    FOREIGN KEY (clientID) REFERENCES Client(clientID),
    FOREIGN KEY (carID) REFERENCES Car(carID)
);