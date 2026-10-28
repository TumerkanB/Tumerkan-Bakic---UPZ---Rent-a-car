INSERT INTO country (country_ID, countryName) VALUES 
(1, 'Albania'),
(2, 'Andorra'),
(3, 'Austria'),
(4, 'Belarus'),
(5, 'Belgium'),
(6, 'Bosnia and Herzegovina'),
(7, 'Bulgaria'),
(8, 'Croatia'),
(9, 'Cyprus'),
(10, 'Czechia'),
(11, 'Denmark'),
(12, 'Estonia'),
(13, 'Finland'),
(14, 'France'),
(15, 'Germany'),
(16, 'Greece'),
(17, 'Hungary'),
(18, 'Iceland'),
(19, 'Ireland'),
(20, 'Italy'),
(21, 'Kosovo'),
(22, 'Latvia'),
(23, 'Liechtenstein'),
(24, 'Lithuania'),
(25, 'Luxembourg'),
(26, 'Malta'),
(27, 'Moldova'),
(28, 'Monaco'),
(29, 'Montenegro'),
(30, 'Netherlands'),
(31, 'North Macedonia'),
(32, 'Norway'),
(33, 'Poland'),
(34, 'Portugal'),
(35, 'Romania'),
(36, 'Russia'),
(37, 'San Marino'),
(38, 'Serbia'),
(39, 'Slovakia'),
(40, 'Slovenia'),
(41, 'Spain'),
(42, 'Sweden'),
(43, 'Switzerland'),
(44, 'Ukraine'),
(45, 'United Kingdom');

INSERT INTO city (cityID, cityName, countryID) VALUES 
-- 1. Albania
(1, 'Tirana', 1), (2, 'Durrës', 1), (3, 'Vlorë', 1), (4, 'Elbasan', 1), (5, 'Shkodër', 1), (6, 'Korçë', 1), (7, 'Fier', 1), (8, 'Berat', 1), (9, 'Lushnjë', 1), (10, 'Kavajë', 1),
-- 2. Andorra (Includes parishes and towns)
(11, 'Andorra la Vella', 2), (12, 'Escaldes-Engordany', 2), (13, 'Encamp', 2), (14, 'Sant Julià de Lòria', 2), (15, 'La Massana', 2), (16, 'Santa Coloma', 2), (17, 'Ordino', 2), (18, 'Canillo', 2), (19, 'Arinsal', 2), (20, 'El Pas de la Casa', 2),
-- 3. Austria
(21, 'Vienna', 3), (22, 'Graz', 3), (23, 'Linz', 3), (24, 'Salzburg', 3), (25, 'Innsbruck', 3), (26, 'Klagenfurt', 3), (27, 'Villach', 3), (28, 'Wels', 3), (29, 'Sankt Pölten', 3), (30, 'Dornbirn', 3),
-- 4. Belarus
(31, 'Minsk', 4), (32, 'Gomel', 4), (33, 'Vitebsk', 4), (34, 'Mogilev', 4), (35, 'Hrodna', 4), (36, 'Brest', 4), (37, 'Babruysk', 4), (38, 'Baranovichi', 4), (39, 'Pinsk', 4), (40, 'Orsha', 4),
-- 5. Belgium
(41, 'Brussels', 5), (42, 'Antwerp', 5), (43, 'Ghent', 5), (44, 'Charleroi', 5), (45, 'Liège', 5), (46, 'Bruges', 5), (47, 'Namur', 5), (48, 'Leuven', 5), (49, 'Mons', 5), (50, 'Aalst', 5),
-- 6. Bosnia and Herzegovina
(51, 'Sarajevo', 6), (52, 'Banja Luka', 6), (53, 'Tuzla', 6), (54, 'Zenica', 6), (55, 'Mostar', 6), (56, 'Bijeljina', 6), (57, 'Brčko', 6), (58, 'Bihać', 6), (59, 'Prijedor', 6), (60, 'Doboj', 6),
-- 7. Bulgaria
(61, 'Sofia', 7), (62, 'Plovdiv', 7), (63, 'Varna', 7), (64, 'Burgas', 7), (65, 'Ruse', 7), (66, 'Stara Zagora', 7), (67, 'Pleven', 7), (68, 'Sliven', 7), (69, 'Dobrich', 7), (70, 'Shumen', 7),
-- 8. Croatia
(71, 'Zagreb', 8), (72, 'Split', 8), (73, 'Rijeka', 8), (74, 'Osijek', 8), (75, 'Zadar', 8), (76, 'Velika Gorica', 8), (77, 'Slavonski Brod', 8), (78, 'Pula', 8), (79, 'Karlovac', 8), (80, 'Sisak', 8),
-- 9. Cyprus
(81, 'Nicosia', 9), (82, 'Limassol', 9), (83, 'Larnaca', 9), (84, 'Paphos', 9), (85, 'Famagusta', 9), (86, 'Kyrenia', 9), (87, 'Protaras', 9), (88, 'Ayia Napa', 9), (89, 'Paralimni', 9), (90, 'Morphou', 9),
-- 10. Czechia
(91, 'Prague', 10), (92, 'Brno', 10), (93, 'Ostrava', 10), (94, 'Plzeň', 10), (95, 'Liberec', 10), (96, 'Olomouc', 10), (97, 'České Budějovice', 10), (98, 'Hradec Králové', 10), (99, 'Pardubice', 10), (100, 'Ústí nad Labem', 10),
-- 11. Denmark
(101, 'Copenhagen', 11), (102, 'Aarhus', 11), (103, 'Odense', 11), (104, 'Aalborg', 11), (105, 'Esbjerg', 11), (106, 'Randers', 11), (107, 'Kolding', 11), (108, 'Horsens', 11), (109, 'Vejle', 11), (110, 'Roskilde', 11),
-- 12. Estonia
(111, 'Tallinn', 12), (112, 'Tartu', 12), (113, 'Narva', 12), (114, 'Pärnu', 12), (115, 'Kohtla-Järve', 12), (116, 'Viljandi', 12), (117, 'Rakvere', 12), (118, 'Maardu', 12), (119, 'Sillamäe', 12), (120, 'Kuressaare', 12),
-- 13. Finland
(121, 'Helsinki', 13), (122, 'Espoo', 13), (123, 'Tampere', 13), (124, 'Vantaa', 13), (125, 'Oulu', 13), (126, 'Turku', 13), (127, 'Jyväskylä', 13), (128, 'Lahti', 13), (129, 'Kuopio', 13), (130, 'Pori', 13),
-- 14. France
(131, 'Paris', 14), (132, 'Marseille', 14), (133, 'Lyon', 14), (134, 'Toulouse', 14), (135, 'Nice', 14), (136, 'Nantes', 14), (137, 'Montpellier', 14), (138, 'Strasbourg', 14), (139, 'Bordeaux', 14), (140, 'Lille', 14),
-- 15. Germany
(141, 'Berlin', 15), (142, 'Hamburg', 15), (143, 'Munich', 15), (144, 'Cologne', 15), (145, 'Frankfurt', 15), (146, 'Stuttgart', 15), (147, 'Düsseldorf', 15), (148, 'Leipzig', 15), (149, 'Dortmund', 15), (150, 'Essen', 15),
-- 16. Greece
(151, 'Athens', 16), (152, 'Thessaloniki', 16), (153, 'Patras', 16), (154, 'Heraklion', 16), (155, 'Ioannina', 16), (156, 'Larissa', 16), (157, 'Volos', 16), (158, 'Chania', 16), (159, 'Rhodes', 16), (160, 'Kalamata', 16),
-- 17. Hungary
(161, 'Budapest', 17), (162, 'Debrecen', 17), (163, 'Szeged', 17), (164, 'Miskolc', 17), (165, 'Pécs', 17), (166, 'Győr', 17), (167, 'Nyíregyháza', 17), (168, 'Kecskemét', 17), (169, 'Székesfehérvár', 17), (170, 'Szombathely', 17),
-- 18. Iceland
(171, 'Reykjavík', 18), (172, 'Kópavogur', 18), (173, 'Hafnarfjörður', 18), (174, 'Akureyri', 18), (175, 'Keflavík', 18), (176, 'Garðabær', 18), (177, 'Mosfellsbær', 18), (178, 'Akranes', 18), (179, 'Selfoss', 18), (180, 'Seltjarnarnes', 18),
-- 19. Ireland
(181, 'Dublin', 19), (182, 'Cork', 19), (183, 'Limerick', 19), (184, 'Galway', 19), (185, 'Waterford', 19), (186, 'Drogheda', 19), (187, 'Swords', 19), (188, 'Dundalk', 19), (189, 'Bray', 19), (190, 'Navan', 19),
-- 20. Italy
(191, 'Rome', 20), (192, 'Milan', 20), (193, 'Naples', 20), (194, 'Turin', 20), (195, 'Palermo', 20), (196, 'Genoa', 20), (197, 'Bologina', 20), (198, 'Florence', 20), (199, 'Bari', 20), (200, 'Catania', 20),
-- 21. Kosovo
(201, 'Pristina', 21), (202, 'Prizren', 21), (203, 'Ferizaj', 21), (204, 'Peja', 21), (205, 'Gjakova', 21), (206, 'Gjilan', 21), (207, 'Mitrovica', 21), (208, 'Vushtrri', 21), (209, 'Podujevë', 21), (210, 'Drenas', 21),
-- 22. Latvia
(211, 'Riga', 22), (212, 'Daugavpils', 22), (213, 'Liepāja', 22), (214, 'Jelgava', 22), (215, 'Jūrmala', 22), (216, 'Ventspils', 22), (217, 'Rēzekne', 22), (218, 'Valmiera', 22), (219, 'Ogre', 22), (220, 'Jēkabpils', 22),
-- 23. Liechtenstein (Includes municipalities)
(221, 'Vaduz', 23), (222, 'Schaan', 23), (223, 'Triesen', 23), (224, 'Balzers', 23), (225, 'Eschen', 23), (226, 'Mauren', 23), (227, 'Triesenberg', 23), (228, 'Ruggell', 23), (229, 'Gamprin', 23), (230, 'Schellenberg', 23),
-- 24. Lithuania
(231, 'Vilnius', 24), (232, 'Kaunas', 24), (233, 'Klaipėda', 24), (234, 'Šiauliai', 24), (235, 'Panevėžys', 24), (236, 'Alytus', 24), (237, 'Marijampolė', 24), (238, 'Mažeikiai', 24), (239, 'Jonava', 24), (240, 'Utena', 24),
-- 25. Luxembourg
(241, 'Luxembourg City', 25), (242, 'Esch-sur-Alzette', 25), (243, 'Differdange', 25), (244, 'Dudelange', 25), (245, 'Ettelbruck', 25), (246, 'Diekirch', 25), (247, 'Wiltz', 25), (248, 'Rumelange', 25), (249, 'Echternach', 25), (250, 'Grevenmacher', 25),
-- 26. Malta
(251, 'Valletta', 26), (252, 'Birkirkara', 26), (253, 'Mosta', 26), (254, 'San Ġwann', 26), (255, 'Sliema', 26), (256, 'Qormi', 26), (257, 'Żabbar', 26), (258, 'Naxxar', 26), (259, 'Żebbuġ', 26), (260, 'Fgura', 26),
-- 27. Moldova
(261, 'Chișinău', 27), (262, 'Tiraspol', 27), (263, 'Bălți', 27), (264, 'Bender', 27), (265, 'Rîbnița', 27), (266, 'Cahul', 27), (267, 'Ungheni', 27), (268, 'Soroca', 27), (269, 'Orhei', 27), (270, 'Comrat', 27),
-- 28. Monaco (Includes wards)
(271, 'Monaco-Ville', 28), (272, 'Monte Carlo', 28), (273, 'La Condamine', 28), (274, 'Fontvieille', 28), (275, 'Moneghetti', 28), (276, 'Les Révoires', 28), (277, 'La Rousse', 28), (278, 'Saint Roman', 28), (279, 'Larvotto', 28), (280, 'Jardin Exotique', 28),
-- 29. Montenegro
(281, 'Podgorica', 29), (282, 'Nikšić', 29), (283, 'Pljevlja', 29), (284, 'Bijelo Polje', 29), (285, 'Cetinje', 29), (286, 'Bar', 29), (287, 'Herceg Novi', 29), (288, 'Berane', 29), (289, 'Budva', 29), (290, 'Kotor', 29),
-- 30. Netherlands
(291, 'Amsterdam', 30), (292, 'Rotterdam', 30), (293, 'The Hague', 30), (294, 'Utrecht', 30), (295, 'Eindhoven', 30), (296, 'Tilburg', 30), (297, 'Groningen', 30), (298, 'Almere', 30), (299, 'Breda', 30), (300, 'Nijmegen', 30),
-- 31. North Macedonia
(301, 'Skopje', 31), (302, 'Bitola', 31), (303, 'Kumanovo', 31), (304, 'Prilep', 31), (305, 'Tetovo', 31), (306, 'Veles', 31), (307, 'Štip', 31), (308, 'Ohrid', 31), (309, 'Gostivar', 31), (310, 'Strumica', 31),
-- 32. Norway
(311, 'Oslo', 32), (312, 'Bergen', 32), (313, 'Trondheim', 32), (314, 'Stavanger', 32), (315, 'Bærum', 32), (316, 'Kristiansand', 32), (317, 'Fredrikstad', 32), (318, 'Tromsø', 32), (319, 'Sandnes', 32), (320, 'Drammen', 32),
-- 33. Poland
(321, 'Warsaw', 33), (322, 'Kraków', 33), (323, 'Łódź', 33), (324, 'Wrocław', 33), (325, 'Poznań', 33), (326, 'Gdańsk', 33), (327, 'Szczecin', 33), (328, 'Bydgoszcz', 33), (329, 'Lublin', 33), (330, 'Białystok', 33),
-- 34. Portugal
(331, 'Lisbon', 34), (332, 'Porto', 34), (333, 'Vila Nova de Gaia', 34), (334, 'Amadora', 34), (335, 'Braga', 34), (336, 'Funchal', 34), (337, 'Coimbra', 34), (338, 'Setúbal', 34), (339, 'Almada', 34), (340, 'Agualva-Cacém', 34),
-- 35. Romania
(341, 'Bucharest', 35), (342, 'Cluj-Napoca', 35), (343, 'Timișoara', 35), (344, 'Iași', 35), (345, 'Constanța', 35), (346, 'Craiova', 35), (347, 'Brașov', 35), (348, 'Galați', 35), (349, 'Ploiești', 35), (350, 'Oradea', 35),
-- 36. Russia (European portion priority)
(351, 'Moscow', 36), (352, 'Saint Petersburg', 36), (353, 'Novosibirsk', 36), (354, 'Yekaterinburg', 36), (355, 'Kazan', 36), (356, 'Nizhny Novgorod', 36), (357, 'Chelyabinsk', 36), (358, 'Samara', 36), (359, 'Omsk', 36), (360, 'Rostov-on-Don', 36),
-- 37. San Marino (Includes municipalities/castelli)
(361, 'San Marino', 37), (362, 'Serravalle', 37), (363, 'Borgo Maggiore', 37), (364, 'Domagnano', 37), (365, 'Fiorentino', 37), (366, 'Acquaviva', 37), (367, 'Faetano', 37), (368, 'Chiesanuova', 37), (369, 'Montegiardino', 37), (370, 'Dogana', 37),
-- 38. Serbia
(371, 'Belgrade', 38), (372, 'Novi Sad', 38), (373, 'Niš', 38), (374, 'Kragujevac', 38), (375, 'Subotica', 38), (376, 'Zrenjanin', 38), (377, 'Pančevo', 38), (378, 'Čačak', 38), (379, 'Kruševac', 38), (380, 'Kraljevo', 38),
-- 39. Slovakia
(381, 'Bratislava', 39), (382, 'Košice', 39), (383, 'Prešov', 39), (384, 'Žilina', 39), (385, 'Nitra', 39), (386, 'Banská Bystrica', 39), (387, 'Trnava', 39), (388, 'Martin', 39), (389, 'Trenčín', 39), (390, 'Poprad', 39),
-- 40. Slovenia
(391, 'Ljubljana', 40), (392, 'Maribor', 40), (393, 'Kranj', 40), (394, 'Celje', 40), (395, 'Koper', 40), (396, 'Novo Mesto', 40), (397, 'Velenje', 40), (398, 'Nova Gorica', 40), (399, 'Kamnik', 40), (400, 'Ptuj', 40),
-- 41. Spain
(401, 'Madrid', 41), (402, 'Barcelona', 41), (403, 'Valencia', 41), (404, 'Seville', 41), (405, 'Zaragoza', 41), (406, 'Málaga', 41), (407, 'Murcia', 41), (408, 'Palma', 41), (409, 'Las Palmas', 41), (410, 'Bilbao', 41),
-- 42. Sweden
(411, 'Stockholm', 42), (412, 'Gothenburg', 42), (413, 'Malmö', 42), (414, 'Uppsala', 42), (415, 'Västerås', 42), (416, 'Örebro', 42), (417, 'Linköping', 42), (418, 'Helsingborg', 42), (419, 'Jönköping', 42), (420, 'Norrköping', 42),
-- 43. Switzerland
(421, 'Zurich', 43), (422, 'Geneva', 43), (423, 'Basel', 43), (424, 'Lausanne', 43), (425, 'Bern', 43), (426, 'Winterthur', 43), (427, 'Lucerne', 43), (428, 'St. Gallen', 43), (429, 'Lugano', 43), (430, 'Biel/Bienne', 43),
-- 44. Ukraine
(431, 'Kyiv', 44), (432, 'Kharkiv', 44), (433, 'Odesa', 44), (434, 'Dnipro', 44), (435, 'Donetsk', 44), (436, 'Zaporizhzhia', 44), (437, 'Lviv', 44), (438, 'Kryvyi Rih', 44), (439, 'Mykolaiv', 44), (440, 'Mariupol', 44),
-- 45. United Kingdom
(441, 'London', 45), (442, 'Birmingham', 45), (443, 'Glasgow', 45), (444, 'Liverpool', 45), (445, 'Bristol', 45), (446, 'Manchester', 45), (447, 'Sheffield', 45), (448, 'Leeds', 45), (449, 'Edinburgh', 45), (450, 'Leicester', 45);