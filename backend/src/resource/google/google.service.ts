import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { google } from "googleapis";
import * as path from 'path'
import { Buffer } from 'buffer';
import { Readable } from 'stream';
require('dotenv').config()

import { FileResult } from "../dto/google.dto";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT = process.env.GOOGLE_REDIRECT_URI;
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT
);
const REFRESH_TOKEN = process.env.REFRESH_TOKEN
console.log(REFRESH_TOKEN)
const KEYFILEPATH = process.env.GG_DRIVE;
const SCOPES = ['https://www.googleapis.com/auth/drive.file']; 
const FOLDER_ID = process.env.STORAGE;

@Injectable()
export class GoogleDriveService {
    private drive: any;
    private oAuth2Client: any;
    constructor(){
        this.authorize()
    }

    private authorize() {
        // 1. Initialize OAuth2 Client
        this.oAuth2Client = new google.auth.OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            REDIRECT
        );

        // 2. Set the Refresh Token for automatic Access Token renewal
        this.oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
        
        // 3. Create the Drive object
        this.drive = google.drive({ version: 'v3', auth: this.oAuth2Client });

        console.log('Google Drive OAuth2 Client Authorized.');
    }

  async uploadFile(fileName: string, mimeType: string, fileBuffer: Buffer): Promise<FileResult> {
    try {
        // Tạo một Readable Stream từ Buffer
        const readableStream = Readable.from(fileBuffer); // <-- Tạo Stream từ Buffer

        const fileMetadata = {
            name: fileName,
            parents: [FOLDER_ID]
        };

        const media = {
            mimeType: mimeType,
            body: readableStream // <-- Truyền Stream đã tạo vào body
        };

        const response = await this.drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink'
        })

        const uploadedFile = response.data;

        return {
            id: uploadedFile.id,
            url: uploadedFile.webViewLink
        }
    } catch (error) {
        console.error("Google Drive Upload Error:", error.message);
        // Lỗi này có thể là do network hoặc lỗi API khác, kiểm tra console log để biết chi tiết
        throw new InternalServerErrorException('File upload failed.');
    }
  }
}