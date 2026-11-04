DELIMITER //
CREATE PROCEDURE sp_CreateCar(
    IN p_modelID INT,
    IN p_plate VARCHAR(20),
    IN p_color VARCHAR(50),
    IN p_fuelType ENUM('Gas', 'Diesel', 'Electric', 'Hybrid')
)
BEGIN
    INSERT INTO Car (modelID, plate, color, fuelType)
    VALUES (p_modelID, p_plate, p_color, p_fuelType);
END //

CREATE PROCEDURE sp_GetCar(
    IN p_carID INT
)
BEGIN
    SELECT * FROM Car WHERE carID = p_carID;
END //

CREATE PROCEDURE sp_UpdateCar(
    IN p_carID INT,
    IN p_modelID INT,
    IN p_plate VARCHAR(20),
    IN p_color VARCHAR(50),
    IN p_fuelType ENUM('Gas', 'Diesel', 'Electric', 'Hybrid')
)
BEGIN
    UPDATE Car 
    SET modelID = p_modelID, 
        plate = p_plate, 
        color = p_color, 
        fuelType = p_fuelType
    WHERE carID = p_carID;
END //

CREATE PROCEDURE sp_DeleteCar(
    IN p_carID INT
)
BEGIN
    DELETE FROM Car WHERE carID = p_carID;
END //