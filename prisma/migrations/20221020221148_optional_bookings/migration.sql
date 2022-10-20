-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Passanger" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "bookingId" INTEGER,
    CONSTRAINT "Passanger_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Passanger" ("age", "bookingId", "firstName", "gender", "id", "lastName") SELECT "age", "bookingId", "firstName", "gender", "id", "lastName" FROM "Passanger";
DROP TABLE "Passanger";
ALTER TABLE "new_Passanger" RENAME TO "Passanger";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
