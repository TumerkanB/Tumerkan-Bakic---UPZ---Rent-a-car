DELIMITER //
CREATE PROCEDURE sp_CreateReservation(
    IN p_clientID INT,
    IN p_carID INT,
    IN p_startDate DATETIME,
    IN p_endDate DATETIME,
    IN p_status VARCHAR(50),
    IN p_totalPrice DECIMAL(10,2)
)
BEGIN
    INSERT INTO Reservation (clientID, carID, startDate, endDate, status, totalPrice)
    VALUES (p_clientID, p_carID, p_startDate, p_endDate, p_status, p_totalPrice);
END //

CREATE PROCEDURE sp_GetReservation(
    IN p_reservationID INT
)
BEGIN
    SELECT * FROM Reservation WHERE reservationID = p_reservationID;
END //

CREATE PROCEDURE sp_UpdateReservation(
    IN p_reservationID INT,
    IN p_clientID INT,
    IN p_carID INT,
    IN p_startDate DATETIME,
    IN p_endDate DATETIME,
    IN p_status VARCHAR(50),
    IN p_totalPrice DECIMAL(10,2)
)
BEGIN
    UPDATE Reservation 
    SET clientID = p_clientID, 
        carID = p_carID, 
        startDate = p_startDate, 
        endDate = p_endDate, 
        status = p_status, 
        totalPrice = p_totalPrice
    WHERE reservationID = p_reservationID;
END //

CREATE PROCEDURE sp_DeleteReservation(
    IN p_reservationID INT
)
BEGIN
    DELETE FROM Reservation WHERE reservationID = p_reservationID;
END //

DELIMITER ;