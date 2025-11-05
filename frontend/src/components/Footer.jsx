import React, { useMemo } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Box,
  Typography,
  Link as MuiLink,
  IconButton,
  Container,
  Grid,
  Stack,
} from "@mui/material";
import {
  Facebook as FacebookIcon,
  YouTube as YouTubeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";

const Footer = React.memo(function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const socialLinks = useMemo(
    () => [
      {
        label: "Facebook của Julie Academy",
        href: "https://facebook.com",
        icon: FacebookIcon,
      },
      {
        label: "Kênh YouTube của Julie Academy",
        href: "https://youtube.com",
        icon: YouTubeIcon,
      },
    ],
    []
  );

  const footerSections = useMemo(
    () => [
      {
        title: "Khám phá",
        links: [
          { label: "Giới thiệu", href: "/aboutus" },
          { label: "Liên hệ", href: "/contact" },
        ],
      },
      {
        title: "Pháp lý",
        links: [
          { label: "Chính sách bảo mật", href: "#" },
          { label: "Điều khoản", href: "#" },
        ],
      },
      {
        title: "Thông tin liên hệ",
        links: [
          {
            label: "julieacademy@gmail.com",
            href: "mailto:julieacademy@gmail.com",
            icon: EmailIcon,
          },
          { label: "0365 032 629", href: "tel:0365 032 629", icon: PhoneIcon },
        ],
      },
    ],
    []
  );

  const iconButtonSx = {
    color: "text.secondary",
    bgcolor: isDark ? "grey.800" : "grey.200",
    transition: theme.transitions.create(["background-color", "color"], {
      duration: theme.transitions.duration.shorter,
    }),
    "&:hover": {
      bgcolor: "primary.main",
      color: "primary.contrastText",
      transform: "translateY(-0.5px)",
    },
  };

  const linkSx = {
    display: "flex",
    alignItems: "center",
    gap: 0.8,
    color: "text.secondary",
    textDecoration: "none",
    transition: theme.transitions.create("color", {
      duration: theme.transitions.duration.shorter,
    }),
    "&:hover": { color: "primary.main" },
  };

  return (
    <Box
      component="footer"
      aria-label="Footer"
      sx={{
        width: "100%",
        mt: "auto",
        backgroundColor: isDark
          ? theme.palette.background.paper
          : alpha(theme.palette.secondary.light, 0.25),
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          pt: { xs: 2, md: 2 },
          pb: { xs: 1, md: 1 },
        }}
      >
        <Grid
          container
          spacing={{ xs: 3, md: 4 }}
          justifyContent="space-between"
        >
          {/* Cột giới thiệu */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <Typography
                variant="h5"
                component="p"
                sx={{ fontWeight: "bold", color: "text.primary" }}
              >
                Julie Academy
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ pr: { md: 2 } }}
            >
              Hệ thống giúp bạn chinh phục mọi thử thách
              học tập.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <IconButton
                  key={label}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener"
                  aria-label={label}
                  size="small"
                  sx={iconButtonSx}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          {/* SỬA DÒNG NÀY: Dùng `xs: 12` thay vì `xs: 11` */}
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <Grid container spacing={2}>
              {footerSections.map(({ title, links }) => (
                <Grid size={{ xs: 6, sm: 3 }} key={title}>
                  <Typography
                    variant="overline"
                    gutterBottom
                    sx={{
                      color: "text.primary",
                      fontWeight: "bold",
                      fontSize: "0.95rem",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {title}
                  </Typography>
                  <Stack spacing={0.8}>
                    {links.map(({ label, href, icon: Icon }) => (
                      <MuiLink
                        key={label}
                        href={href}
                        variant="caption"
                        sx={linkSx}
                      >
                        {Icon && <Icon sx={{ fontSize: "1rem" }} />}
                        {label}
                      </MuiLink>
                    ))}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
      
      {/* ... (Phần Box bản quyền ở dưới giữ nguyên) ... */}
      <Box
        component="section"
        sx={{
          py: 0.5,
          textAlign: "center",
          backgroundColor: isDark
            ? alpha(theme.palette.grey[900], 0.4)
            : alpha(theme.palette.grey[200], 0.4),
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "0.75rem" }}
        >
          © {new Date().getFullYear()} Julie Academy. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
});

export default Footer;