import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmailConfigDto, EmailTemplateCreateDto } from "./dto/email.dto";
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
      const { create_as_template, receiver_ids, ...emailConfigData } = data;

      if (create_as_template) {
        const emailTemplate = await tx.emailTemplate.create({
          data: {
            type: EmailTemplateType.custom,
            body: data.body,
            creator: {connect: {uid: tutor_id}}
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

      const email_config = await tx.emailConfig.create({
        data: {
          ...emailConfigData,
          class_id,
        },
      });

      await tx.receivers.createMany({
        data: receiver_ids.map(id => ({
          receiver_id: id,
          config_id: email_config.config_id
        }))
      })

      return email_config
    })
  }

  async createEmailTemplate(user_id: string, data: EmailTemplateCreateDto) {
    try {
      return this.prisma.emailTemplate.create({
        data: {
          ...data,
          creator: {connect: {uid: user_id}}
        }
      })
    } catch (error) {
      throw new InternalServerErrorException("Failed to create Template!")
    }
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

    return this.prisma.$transaction(async(tx) => {
      const { create_as_template, receiver_ids, ...emailConfigData } = data;
      const config = await tx.emailConfig.update({
        where: {
          config_id,
        },
        data: {
          ...data,
        },
      });

      if (receiver_ids) {
        await tx.receivers.deleteMany({
          where: {
            config_id,
            receiver_id: { notIn: receiver_ids }
          }
        })

        await tx.receivers.createMany({
          data: receiver_ids.map(id => ({
            receiver_id: id,
            config_id
          })),
          skipDuplicates: true
        })
      }

      return config
    })
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

  async sendEmailNow(tutor_id: string, config_id: string) {
    
  }
}