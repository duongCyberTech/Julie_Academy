-- AddForeignKey
ALTER TABLE "EmailConfig" ADD CONSTRAINT "EmailConfig_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "EmailTemplate"("template_id") ON DELETE SET NULL ON UPDATE CASCADE;
