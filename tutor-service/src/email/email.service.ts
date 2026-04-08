import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EmailConfigDto } from "./dto/email.dto";

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

    return this.prisma.emailConfig.create({
      data: {
        ...data,
        class_id,
      },
    });
  }

  async getAllEmailChainsOfClass(tutor_id: string, class_id: string) {
    const verifyClass = await this.prisma.class.findFirst({
      where: {
        class_id,
        tutor_id,
      },
    });

    if (!verifyClass) {
      throw new ForbiddenException('You do not have permission to view email configuration for this class.');
    }

    return this.prisma.emailConfig.findMany({
      where: {
        class_id,
      },
    });
  }

  async getEmailChainById(tutor_id: string, class_id: string, config_id: string) {
    const verifyClass = await this.prisma.class.findFirst({
      where: {
        class_id,
        tutor_id,
      },
    });

    if (!verifyClass) {
      throw new ForbiddenException('You do not have permission to view email configuration for this class.');
    }

    const emailConfig = await this.prisma.emailConfig.findFirst({
      where: {
        class_id,
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