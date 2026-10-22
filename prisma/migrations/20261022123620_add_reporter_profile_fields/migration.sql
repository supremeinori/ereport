-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "license_date" DATE,
ADD COLUMN     "license_number" VARCHAR(100),
ADD COLUMN     "pic_name" VARCHAR(255),
ADD COLUMN     "pic_phone" VARCHAR(30),
ALTER COLUMN "email" DROP NOT NULL;
