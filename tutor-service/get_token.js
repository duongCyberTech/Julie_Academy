const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const opn = require('open'); // Sử dụng để mở trình duyệt tự động

// 1. CẤU HÌNH CỦA BẠN
const CLIENT_ID = '838025556290-7222kmut9heh92nh3u3296ue2ptgvjvd.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:4000/oauth2callback'; // Phải khớp với giá trị đã đăng ký
const SCOPES = ['https://www.googleapis.com/auth/drive.file']; // Phạm vi truy cập Drive

// 2. KHỞI TẠO CLIENT
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

// Tạo URL ủy quyền
const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', // Yêu cầu Refresh Token (rất quan trọng!)
    prompt: 'consent',
    scope: SCOPES,
});

/**
 * 3. Chạy Server và Lắng nghe Mã Ủy quyền
 * Server này chỉ chạy tạm thời để nhận mã ủy quyền từ Google.
 */
function runServer() {
    console.log('--- BƯỚC 1: TẠO URL XÁC THỰC ---');
    console.log(`Mở trình duyệt: ${authUrl}`);
    
    // Tự động mở trình duyệt (Tùy chọn)
    opn(authUrl).catch(err => console.error("Không thể tự động mở trình duyệt:", err));
    
    // Bắt đầu lắng nghe tại cổng đã đăng ký
    const server = http.createServer(async (req, res) => {
        const reqUrl = url.parse(req.url, true);
        
        // Kiểm tra xem đây có phải là request chuyển hướng từ Google không
        if (reqUrl.pathname === '/oauth2callback') {
            const code = reqUrl.query.code;

            console.log("CODE: ", code)
            
            if (code) {
                console.log('\n--- BƯỚC 2: ĐỔI MÃ ỦY QUYỀN THÀNH TOKEN ---');
                
                // Đổi mã ủy quyền thành Access Token và Refresh Token
                const { tokens } = await oAuth2Client.getToken(code);
                
                // Gửi phản hồi đơn giản và đóng server
                res.end('Authentication successful! You can close this window.');
                server.close();

                // 4. HIỂN THỊ REFRESH TOKEN
                console.log('\n--- BƯỚC 3: KẾT QUẢ ---');
                console.log('Access Token (Dùng tạm):', tokens.access_token);
                console.log('------------------------------------------------');
                console.log('✅ REFRESH TOKEN CỦA BẠN:');
                console.log(tokens.refresh_token);
                console.log('------------------------------------------------');
                console.log('LƯU TOKEN NÀY VÀ DÙNG TRONG GoogleDriveService!');

            } else {
                res.end('Authentication failed: No code received.');
                server.close();
            }
        }
    });

    server.listen(4000, () => {
        console.log('Server đang lắng nghe tại http://localhost:3000/');
    });
}

runServer();