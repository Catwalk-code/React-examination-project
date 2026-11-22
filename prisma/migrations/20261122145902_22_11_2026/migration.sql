-- AlterTable
ALTER TABLE "users" ADD COLUMN     "name" VARCHAR(255);

-- CreateTable
CREATE TABLE "invites" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "resume_id" INTEGER NOT NULL,
    "invitee_user_id" INTEGER NOT NULL,
    "status" "ResponseStatus" NOT NULL DEFAULT 'interview',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invites_company_id_resume_id_key" ON "invites"("company_id", "resume_id");

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_invitee_user_id_fkey" FOREIGN KEY ("invitee_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
