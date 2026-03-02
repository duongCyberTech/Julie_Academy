import React from "react";
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
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

const socialLinks = [
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
];

const footerSections = [
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
      { label: "Chính sách bảo mật", href: "/policy" },
      { label: "Điều khoản", href: "/term" },
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
      { label: "0365 032 629", href: "tel:0365032629", icon: PhoneIcon },
    ],
  },
];

const Footer = React.memo(function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const iconButtonSx = {
    color: "text.secondary",
    bgcolor: isDark ? "grey.800" : "grey.200",
    transition: theme.transitions.create(["background-color", "color"], {
      duration: theme.transitions.duration.shorter,
    }),
    "&:hover": {
      bgcolor: "primary.main",
      color: "primary.contrastText",
      transform: "translateY(-2px)",
    },
  };

  const linkSx = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    color: "text.secondary",
    textDecoration: "none",
    transition: "color 0.2s ease",
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
          : alpha(theme.palette.secondary.light, 0.15),
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 5 }, pb: { xs: 3, md: 3 } }}>
        <Grid container spacing={{ xs: 3, md: 3 }} justifyContent="space-between">
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Typography
                variant="h5"
                component="p"
                sx={{ fontWeight: 700, color: "text.primary" }}
              >
                Julie Academy
              </Typography>
            </Stack>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ pr: { md: 2 }, mb: 2, lineHeight: 1.6 }}
            >
              Hệ thống giúp bạn chinh phục mọi thử thách học tập.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <IconButton
                  key={label}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener"
                  aria-label={label}
                  size="medium"
                  sx={iconButtonSx}
                >
                  <Icon fontSize="small" />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={3}>
              {footerSections.map(({ title, links }) => (
                <Grid size={{ xs: 12, sm: 4 }} key={title}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{
                      color: "text.primary",
                      fontWeight: 600,
                      mb: 1.5,
                    }}
                  >
                    {title}
                  </Typography>
                  <Stack spacing={1}>
                    {links.map(({ label, href, icon: Icon }) => (
                      <MuiLink
                        key={label}
                        href={href}
                        variant="body2"
                        sx={linkSx}
                      >
                        {Icon && <Icon sx={{ fontSize: "1.2rem" }} />}
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

      <Box
        component="section"
        sx={{
          py: 1.5,
          textAlign: "center",
          backgroundColor: isDark
            ? alpha(theme.palette.common.black, 0.2)
            : alpha(theme.palette.common.white, 0.5),
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          © {new Date().getFullYear()} Julie Academy. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
});

export default Footer;