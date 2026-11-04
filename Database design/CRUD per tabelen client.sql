DELIMITER //

CREATE PROCEDURE sp_CreateClient(
    IN p_name VARCHAR(100),
    IN p_surname VARCHAR(100),
    IN p_email VARCHAR(255),
    IN p_phone VARCHAR(50),
    IN p_addressID INT
)
BEGIN
    INSERT INTO Client (name, surname, email, phone, addressID)
    VALUES (p_name, p_surname, p_email, p_phone, p_addressID);
END //

CREATE PROCEDURE sp_GetClient(
    IN p_clientID INT
)
BEGIN
    SELECT * FROM Client WHERE clientID = p_clientID;
END //

CREATE PROCEDURE sp_UpdateClient(
    IN p_clientID INT,
    IN p_name VARCHAR(100),
    IN p_surname VARCHAR(100),
    IN p_email VARCHAR(255),
    IN p_phone VARCHAR(50),
    IN p_addressID INT
)
BEGIN
    UPDATE Client 
    SET name = p_name, 
        surname = p_surname, 
        email = p_email, 
        phone = p_phone, 
        addressID = p_addressID
    WHERE clientID = p_clientID;
END //

CREATE PROCEDURE sp_DeleteClient(
    IN p_clientID INT
)
BEGIN
    DELETE FROM Client WHERE clientID = p_clientID;
END //