import React, { memo } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Link,
} from "@mui/material";
import {
  EmailOutlined,
  PhoneOutlined,
  LocationOnOutlined,
  SendOutlined,
} from "@mui/icons-material";

const ContactPage = memo(() => {
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, md: 3 } }}>
      <Paper
        elevation={3}
        sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, overflow: "hidden" }}
      >
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h4"
            component="h1" 
            gutterBottom
            fontWeight={600}
            color="primary.main"
          >
            Liên hệ với chúng tôi
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Chúng tôi luôn sẵn lòng lắng nghe bạn.
          </Typography>
        </Box>

        {/* 4. TỐI ƯU MUI V6: Sử dụng Grid 'size' */}
        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography
              variant="h5"
              component="h2" 
              gutterBottom
              fontWeight={500}
            >
              Thông tin liên hệ
            </Typography>
            <List sx={{ width: "100%" }}>
              <ListItem disablePadding>
                <ListItemIcon>
                  <EmailOutlined color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={
                    <Link
                      href="mailto:julieacademy@gmail.com"
                      color="text.primary"
                      underline="hover"
                    >
                      julieacademy@gmail.com
                    </Link>
                  }
                />
              </ListItem>
              {/* --- Điện thoại (SEO: Dùng tel:) --- */}
              <ListItem disablePadding sx={{ mt: 2 }}>
                <ListItemIcon>
                  <PhoneOutlined color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Điện thoại"
                  secondary={
                    <Link
                      href="tel:0365032629"
                      color="text.primary"
                      underline="hover"
                    >
                      0365 032 629
                    </Link>
                  }
                />
              </ListItem>
              {/* --- Địa chỉ --- */}
              <ListItem disablePadding sx={{ mt: 2 }}>
                <ListItemIcon>
                  <LocationOnOutlined color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Trụ sở"
                  secondary="Trường ĐH Bách khoa, 268 Lý Thường Kiệt, P. 14, Q. 10, TP. HCM"
                />
              </ListItem>
            </List>
            
            {/* --- Google Maps --- */}
            <Box
              sx={{
                mt: 4,
                height: 280,
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${theme.palette.divider}`,
                width: "100%",
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.494668100654!2d106.65843081533264!3d10.773374262180414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ec3c161a3fb%3A0xef77cd47a1cc691e!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBCw6FjaCBraG9hIC0gxJBIUUctVFAuSENN!5e0!3m2!1svi!2s!4v1678888888888!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bản đồ Google Maps của ĐH Bách Khoa TPHCM" 
              ></iframe>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Typography
              variant="h5"
              component="h2" 
              gutterBottom
              fontWeight={500}
            >
              Gửi tin nhắn cho chúng tôi
            </Typography>
            <Box
              component="form"
              noValidate
              autoComplete="off"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
                mt: 0.5,
                width: "100%", 
              }}
            >
              <TextField
                label="Họ và tên của bạn"
                variant="outlined"
                required
                fullWidth
              />
              <TextField
                label="Email của bạn"
                type="email"
                variant="outlined"
                required
                fullWidth
              />
              <TextField
                label="Tiêu đề"
                variant="outlined"
                fullWidth
              />
              <TextField
                label="Nội dung tin nhắn"
                variant="outlined"
                multiline
                rows={5}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                endIcon={<SendOutlined />}
                sx={{ alignSelf: "flex-start", px: 4, py: 1.5 }}
              >
                Gửi tin nhắn
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
});

export default ContactPage;