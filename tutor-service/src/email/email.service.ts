import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmailConfigDto } from "./dto/email.dto";
import { EmailTemplateType } from "@prisma/client";

@Injectable()
export class EmailService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createEmailConfig(tutor_id: string, class_id: string, data: EmailConfigDto) {
    const verifyClass = await this.prisma.class.findFirst({
      where: {
        class_id,
        tutor_uid: tutor_id,
      },
    });

    if (!verifyClass) {
      throw new ForbiddenException('You do not have permission to create email configuration for this class.');
    }

    return this.prisma.$transaction(async (tx) => {
      const { create_as_template, ...emailConfigData } = data;

      if (create_as_template) {
        const emailTemplate = await tx.emailTemplate.create({
          data: {
            type: EmailTemplateType.custom,
            body: data.body,
          },
        });

        emailConfigData.template_id = emailTemplate.template_id;
      }

      if (data.use_template && data.template_id) {
        const template = await tx.emailTemplate.findUnique({
          where: {
            template_id: data.template_id,
          },
        });

        if (!template) {
          throw new BadRequestException('The specified template does not exist.');
        }

        emailConfigData.body = template.body;
        emailConfigData.use_template = true;
        emailConfigData.template_id = template.template_id;
      }

      return tx.emailConfig.create({
        data: {
          ...emailConfigData,
          class_id,
        },
      });
    })
  }

  async getAllEmailChainsOfClass(tutor_id: string, class_id: string) {
    return this.prisma.emailConfig.findMany({
      where: {
        class: {tutor_uid: tutor_id, class_id},
      },
    });
  }

  async getEmailChainById(tutor_id: string, config_id: string) {
    const emailConfig = await this.prisma.emailConfig.findFirst({
      where: {
        class: {tutor_uid: tutor_id},
        config_id,
      },
    });

    return emailConfig;
  }

  async updateEmailChainById(tutor_id: string, config_id: string, data: Partial<EmailConfigDto>) {
    const emailConfig = await this.prisma.emailConfig.findFirst({
      where: {
        class: {tutor_uid: tutor_id},
        config_id,
      },
    });

    if (!emailConfig) {
      throw new ForbiddenException('Email configuration not found for this class.');
    }

    return this.prisma.emailConfig.update({
      where: {
        config_id,
      },
      data: {
        ...data,
      },
    });
  }

  async deleteEmailChainById(tutor_id: string, config_id: string) {
    const emailConfig = await this.prisma.emailConfig.findFirst({
      where: {
        class: {tutor_uid: tutor_id},
        config_id,
      },
    });

    if (!emailConfig) {
      throw new ForbiddenException('Email configuration not found for this class.');
    }

    return this.prisma.emailConfig.delete({
      where: {
        config_id,
      },
    });
  }
}