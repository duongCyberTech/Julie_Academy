import { Injectable, InternalServerErrorException, Logger, UseGuards } from "@nestjs/common";
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { SystemConfigValidatorDto } from "./dto/system.dto";

@Injectable()
export class SystemConfigService {
  // Define the path to your config file
  private readonly configPath = join(__dirname, 'system.config.json');
  private readonly logger = new Logger(SystemConfigService.name);

  /**
   * Reads the current config from the file system.
   */
  getConfig() {
    try {
      if (!existsSync(this.configPath)) {
        this.logger.error('Không tìm thấy file config!');
        throw new Error('File not found');
      }

      const fileContent = readFileSync(this.configPath, 'utf-8');

      return JSON.parse(fileContent);
    } catch (error) {
      this.logger.error(`Lỗi Parse JSON: ${(error as Error).message}`);
      throw new Error('Failed to parse config file');
    }
  }

  validateConfig(validator: SystemConfigValidatorDto) {
    const config = this.getConfig();
    console.log('Current Config:', config);
    console.log('Validator:', validator);

    if (!Object.hasOwn(config, validator.key)) return true;
    console.log(`Config value for ${validator.key}:`, config[validator.key]);
    console.log(`Comparing config value (${config[validator.key].enabled}) with validator value (${validator.value})`);
    console.log(`Validation result:`, config[validator.key].enabled === validator.value);

    return config[validator.key].enabled === validator.value;
  }

  /**
   * Updates the config file with new values.
   */
  updateConfig(newConfig: Record<string, any>) {
    try {
      // 1. Get existing config
      const currentConfig = this.getConfig();

      // 2. Merge changes
      const updatedConfig = { ...currentConfig, ...newConfig };

      // 3. Write back to the JSON file (beautified with 2-space indentation)
      writeFileSync(
        this.configPath, 
        JSON.stringify(updatedConfig, null, 2), 
        'utf-8'
      );

      return updatedConfig;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update configuration file.');
    }
  }
}