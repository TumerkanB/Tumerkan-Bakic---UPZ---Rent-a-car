
CREATE TABLE manufacturer (
    manufacturerID INT PRIMARY KEY,
    manufacturerName VARCHAR(100)
);

CREATE TABLE Permisions (
    permisionID INT PRIMARY KEY,
    permissionName VARCHAR(100)
);

CREATE TABLE Roles (
    roleID INT PRIMARY KEY,
    roleName VARCHAR(100)
);


CREATE TABLE role_permissions (
    roleID INT,
    permisionID INT,
    PRIMARY KEY (roleID, permisionID),
    FOREIGN KEY (roleID) REFERENCES Roles(roleID),
    FOREIGN KEY (permisionID) REFERENCES Permisions(permisionID)
);


CREATE TABLE brands (
    brandID INT PRIMARY KEY,
    brandName VARCHAR(100),
    manufacturerID INT,
    FOREIGN KEY (manufacturerID) REFERENCES manufacturer(manufacturerID)
);

CREATE TABLE Users (
    userID INT PRIMARY KEY,
    userName VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    isActive BOOLEAN,
    roleID INT,
    FOREIGN KEY (roleID) REFERENCES Roles(roleID)
);


CREATE TABLE models (
    modelID INT PRIMARY KEY,
    modelName VARCHAR(100),
    brandID INT,
    FOREIGN KEY (brandID) REFERENCES brands(brandID)
);

CREATE TABLE clients (
    clientID INT PRIMARY KEY,
    ssn VARCHAR(50),
    name VARCHAR(100),
    middleName VARCHAR(100),
    surname VARCHAR(100),
    dateOfBirth DATE,
    gender VARCHAR(20),
    userID INT,
    FOREIGN KEY (userID) REFERENCES Users(userID)
);


CREATE TABLE cars (
    carID INT PRIMARY KEY,
    vin VARCHAR(50),
    licencePlate VARCHAR(50),
    color VARCHAR(50),
    power INT,
    current_Mileage INT,
    price DECIMAL(10, 2),
    fuel VARCHAR(20) CHECK (fuel IN ('Gas', 'Diesel', 'Electric', 'Hybrid')),
    modelID INT,
    FOREIGN KEY (modelID) REFERENCES models(modelID)
);

CREATE TABLE verification (
    verificationID INT PRIMARY KEY,
    documentID VARCHAR(100),
    Country VARCHAR(100),
    Attribute VARCHAR(100),
    clientID INT,
    FOREIGN KEY (clientID) REFERENCES clients(clientID)
);


CREATE TABLE priceHistory (
    priceID INT PRIMARY KEY,
    dailyRate DECIMAL(10, 2),
    effectiveFrom DATE,
    effectiveTo DATE,
    carID INT,
    FOREIGN KEY (carID) REFERENCES cars(carID)
);

CREATE TABLE reservation (
    reservationID INT PRIMARY KEY,
    startDate DATETIME,
    endDate DATETIME,
    startFuel DECIMAL(5, 2),
    endFuel DECIMAL(5, 2),
    startMileage INT,
    endMileage INT,
    totalPrice DECIMAL(10, 2),
    status VARCHAR(50),
    clientID INT,
    carID INT,
    FOREIGN KEY (clientID) REFERENCES clients(clientID),
    FOREIGN KEY (carID) REFERENCES cars(carID)
);

CREATE TABLE country (
    country_ID INT PRIMARY KEY,
    countryName VARCHAR(100)
);

CREATE TABLE city (
    cityID INT PRIMARY KEY,
    cityName VARCHAR(100),
    countryID INT,
    FOREIGN KEY (countryID) REFERENCES country(country_ID)
);