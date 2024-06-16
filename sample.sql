INSERT INTO public."Event" (id, name, type, "mailTemplate", "directusId", data, "eventStartTime", "eventEndTime", "staffingStartTime", "staffingEndTime", "staffingTimeSlotSize", "staffingType") VALUES ('ae5874a1-ae85-4445-a791-75eb10219448', 'Hello World 5', 'HELLO_WORLD', 'You registration for Hello World 5:  <image id="qr" />', '', '{}', '2024-10-11 15:00:00', '2024-10-11 19:00:00', '{"2024-10-09 13:00:00","2024-10-11 09:00:00"}', '{"2024-10-09 15:00:00","2024-10-11 23:00:00"}', 30, '{Bar,Stand,Check-in}');

INSERT INTO public."Registration" (id, "isStaff", "checkedIn", data, "eventId", name, surname, email) VALUES ('5573a53c-bbee-4f91-9cd4-8c7da1d2ddb2', false, false, '{"team": null}', 'ae5874a1-ae85-4445-a791-75eb10219448', 'Ludovic', 'Mermod', 'ludovic.mermod@epfl.ch');
INSERT INTO public."Registration" (id, "isStaff", "checkedIn", data, "eventId", name, surname, email) VALUES ('21fddc87-6a9c-4b7b-8c2f-2a2bb9cbf72e', false, false, '{"team": "Assaucisson"}', 'ae5874a1-ae85-4445-a791-75eb10219448', 'Sidonie', 'Bouthors', 'sidonie.bouthors@epfl.ch');
INSERT INTO public."Registration" (id, "isStaff", "checkedIn", data, "eventId", name, surname, email) VALUES ('fef2991f-f5a4-4f4b-bbf2-0bd154cd5f52', false, true, '{"team": "Assaucisson"}', 'ae5874a1-ae85-4445-a791-75eb10219448', 'Lorenzo', 'Padrini', 'lorenzo.padrini@epfl.ch');
INSERT INTO public."Registration" (id, "isStaff", "checkedIn", data, "eventId", name, surname, email) VALUES ('1f3a0713-86b3-4123-b248-affb6ce0e917', true, false, '{"types": [0, 2], "availability": [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true]}', 'ae5874a1-ae85-4445-a791-75eb10219448', 'Anas', 'Sidi Mohamed', 'anas.sidimohamed@epfl.ch');