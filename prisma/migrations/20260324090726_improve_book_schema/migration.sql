/*
  Warnings:

  - You are about to drop the column `extension` on the `Book` table. All the data in the column will be lost.
  - The `language` column on the `Book` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `size` column on the `Book` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'VIETNAMESE', 'OTHER');

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "extension",
DROP COLUMN "language",
ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'VIETNAMESE',
DROP COLUMN "size",
ADD COLUMN     "size" INTEGER,
ALTER COLUMN "coverImage" DROP NOT NULL,
ALTER COLUMN "pdfPath" DROP NOT NULL;
