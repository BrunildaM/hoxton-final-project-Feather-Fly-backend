-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "price" INTEGER NOT NULL,
    "seat" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'one-way',
    "status" TEXT NOT NULL DEFAULT 'available',
    "baggage" TEXT NOT NULL,
    "bookingId" INTEGER,
    "flightId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    CONSTRAINT "Ticket_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ticket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Ticket_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "Flight" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Ticket" ("baggage", "bookingId", "classId", "flightId", "id", "price", "seat", "status", "type") SELECT "baggage", "bookingId", "classId", "flightId", "id", "price", "seat", "status", "type" FROM "Ticket";
DROP TABLE "Ticket";
ALTER TABLE "new_Ticket" RENAME TO "Ticket";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
