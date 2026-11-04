
CREATE VIEW View_Address AS
SELECT 
    a.addressID, 
    a.street, 
    a.number, 
    a.apt, 
    a.zip, 
    c.cityName, 
    co.countryName
FROM Address a
JOIN City c ON a.cityID = c.cityID
JOIN Country co ON c.countryID = co.countryID;


CREATE VIEW View_User AS
SELECT 
    u.userID, 
    u.username, 
    u.email, 
    r.roleName
FROM User u
JOIN Role r ON u.roleID = r.roleID;


CREATE VIEW View_RolePermission AS
SELECT 
    rp.roleID, 
    r.roleName, 
    rp.permissionID, 
    p.permissionName
FROM RolePermission rp
JOIN Role r ON rp.roleID = r.roleID
JOIN Permission p ON rp.permissionID = p.permissionID;

CREATE VIEW View_Client AS
SELECT 
    cl.clientID, 
    cl.name, 
    cl.surname, 
    cl.email, 
    cl.phone, 
    a.street, 
    a.number, 
    a.zip, 
    c.cityName, 
    co.countryName
FROM Client cl
LEFT JOIN Address a ON cl.addressID = a.addressID
LEFT JOIN City c ON a.cityID = c.cityID
LEFT JOIN Country co ON c.countryID = co.countryID;


CREATE VIEW View_Verification AS
SELECT 
    v.verificationID, 
    cl.name AS clientName, 
    cl.surname AS clientSurname, 
    v.documentID, 
    co.countryName AS documentCountry, 
    v.attribute, 
    v.isVerified
FROM Verification v
JOIN Client cl ON v.clientID = cl.clientID
LEFT JOIN Country co ON v.documentCountryID = co.countryID;


CREATE VIEW View_Car AS
SELECT 
    c.carID, 
    m.name AS manufacturerName, 
    b.brandName, 
    mo.modelName, 
    c.plate, 
    c.color, 
    c.fuelType
FROM Car c
JOIN Model mo ON c.modelID = mo.modelID
JOIN Brand b ON mo.brandID = b.brandID
JOIN Manufacturer m ON b.manufacturerID = m.manufacturerID;


CREATE VIEW View_PriceHistory AS
SELECT 
    ph.priceID, 
    c.plate, 
    mo.modelName, 
    ph.dailyRate, 
    ph.effectiveFrom, 
    ph.effectiveTo
FROM PriceHistory ph
JOIN Car c ON ph.carID = c.carID
JOIN Model mo ON c.modelID = mo.modelID;


CREATE VIEW View_Reservation AS
SELECT 
    r.reservationID, 
    cl.name AS clientName, 
    cl.surname AS clientSurname, 
    c.plate AS carPlate, 
    b.brandName, 
    mo.modelName,
    r.startDate, 
    r.endDate, 
    r.status, 
    r.totalPrice
FROM Reservation r
JOIN Client cl ON r.clientID = cl.clientID
JOIN Car c ON r.carID = c.carID
JOIN Model mo ON c.modelID = mo.modelID
JOIN Brand b ON mo.brandID = b.brandID;