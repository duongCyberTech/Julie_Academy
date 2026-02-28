import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Container,
  Typography,
  Box,
  Paper,
  useTheme,
  alpha,
  styled,
  Avatar,
  Stack,
  Divider,
} from "@mui/material";
import {
  Article,
  Handshake,
  AccountCircle,
  Balance,
  Copyright,
  MailOutline,
} from "@mui/icons-material";

import { Background } from "../../components/Background";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const MOTION_VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  },
};

const StyledSectionWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  paddingBlock: theme.spacing(8),
  [theme.breakpoints.down("md")]: { paddingBlock: theme.spacing(5) },
}));

const DocumentPaper = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  return {
    padding: theme.spacing(6),
    borderRadius: theme.shape.borderRadius * 2,
    background: isDark
      ? alpha(theme.palette.background.paper, 0.8)
      : alpha(theme.palette.background.paper, 0.95),
    border: isDark
      ? `1px solid ${alpha(theme.palette.common.white, 0.08)}`
      : `1px solid ${alpha(theme.palette.primary.light, 0.2)}`,
    boxShadow: isDark ? "none" : theme.shadows[3],
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(4),
    },
  };
});

const TermsHero = React.memo(() => {
  const theme = useTheme();
  return (
    <Box sx={{ pt: { xs: 12, md: 16 }, pb: { xs: 4, md: 6 }, textAlign: "center" }}>
      <Container maxWidth="md">
        <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.15 } } }}>
          <motion.div variants={MOTION_VARIANTS.fadeInUp}>
            <Box mb={3} display="flex" justifyContent="center">
              <Avatar
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  width: 72,
                  height: 72,
                }}
              >
                <Article sx={{ fontSize: 36 }} />
              </Avatar>
            </Box>
          </motion.div>
          <motion.div variants={MOTION_VARIANTS.fadeInUp}>
            <Typography component="h1" variant="h2" fontWeight={700} color="text.primary" gutterBottom>
              Điều khoản sử dụng
            </Typography>
          </motion.div>
          <motion.div variants={MOTION_VARIANTS.fadeInUp}>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", maxWidth: 650, mx: "auto" }}>
              Những quy định và điều kiện cơ bản khi bạn truy cập và sử dụng nền tảng học tập trực tuyến Julie Academy.
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 2, fontWeight: 600 }}>
              Cập nhật lần cuối: 28/02/2026
            </Typography>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
});

const TermsContent = React.memo(({ sections }) => {
  const theme = useTheme();

  return (
    <StyledSectionWrapper sx={{ pt: 0 }}>
      <Container maxWidth="md">
        <motion.div initial="initial" animate="animate" variants={MOTION_VARIANTS.fadeInUp}>
          <DocumentPaper elevation={0}>
            {sections.map((section, index) => (
              <Box key={index} sx={{ mb: index !== sections.length - 1 ? 6 : 0 }}>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.secondary.main, 0.15),
                      color: "secondary.main",
                      width: 40,
                      height: 40,
                    }}
                  >
                    {section.icon}
                  </Avatar>
                  <Typography variant="h4" component="h2" fontWeight={700} color="text.primary">
                    {section.title}
                  </Typography>
                </Stack>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.8,
                    fontSize: "1.05rem",
                    pl: { xs: 0, sm: 7 },
                  }}
                >
                  {section.content}
                </Typography>
                
                {index !== sections.length - 1 && (
                  <Divider sx={{ mt: 5, ml: { xs: 0, sm: 7 }, borderColor: alpha(theme.palette.divider, 0.5) }} />
                )}
              </Box>
            ))}

            <Box sx={{ mt: 6, p: 4, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`, textAlign: "center" }}>
              <Typography variant="h6" fontWeight={700} color="text.primary" gutterBottom>
                Cần hỗ trợ về pháp lý?
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Nếu bạn có bất kỳ thắc mắc nào về các điều khoản này, vui lòng liên hệ với chúng tôi.
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" color="primary.main">
                <MailOutline fontSize="small" />
                <Typography variant="body2" fontWeight={700}>
                  legal@julieacademy.vn
                </Typography>
              </Stack>
            </Box>
          </DocumentPaper>
        </motion.div>
      </Container>
    </StyledSectionWrapper>
  );
});

function TermsOfServicePage({ mode, toggleMode }) {
  const TERMS_SECTIONS = useMemo(
    () => [
      {
        icon: <Handshake fontSize="small" />,
        title: "1. Chấp thuận điều khoản",
        content: "Bằng việc truy cập, đăng ký tài khoản và sử dụng các dịch vụ của Julie Academy, bạn đồng ý tuân thủ và bị ràng buộc bởi các Điều khoản sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, vui lòng ngừng sử dụng nền tảng.",
      },
      {
        icon: <AccountCircle fontSize="small" />,
        title: "2. Tài khoản người dùng",
        content: "Bạn phải cung cấp thông tin chính xác, đầy đủ khi đăng ký. Bạn chịu trách nhiệm bảo mật mật khẩu của mình và cho tất cả các hoạt động diễn ra dưới tài khoản của bạn. Vui lòng thông báo ngay cho chúng tôi nếu phát hiện bất kỳ hành vi sử dụng trái phép nào.",
      },
      {
        icon: <Balance fontSize="small" />,
        title: "3. Quyền và Trách nhiệm",
        content: "Bạn cam kết sử dụng nền tảng vào mục đích học tập hợp pháp. Không tải lên nội dung độc hại, vi phạm pháp luật, xúc phạm người khác hoặc có hành vi phá hoại hệ thống (spam, hack). Chúng tôi có quyền đình chỉ hoặc xóa tài khoản nếu phát hiện vi phạm.",
      },
      {
        icon: <Copyright fontSize="small" />,
        title: "4. Sở hữu trí tuệ",
        content: "Toàn bộ nội dung khóa học, tài liệu, video, thiết kế giao diện và logo trên Julie Academy đều thuộc quyền sở hữu của chúng tôi và các đối tác. Bạn không được phép sao chép, phát tán, hoặc sử dụng cho mục đích thương mại khi chưa có sự cho phép bằng văn bản.",
      },
    ],
    []
  );

  return (
    <Background>
      <Helmet>
        <title>Điều khoản sử dụng - Julie Academy</title>
        <meta name="description" content="Điều khoản và quy định sử dụng dịch vụ tại nền tảng học tập Julie Academy." />
      </Helmet>

      <Header mode={mode} toggleMode={toggleMode} />

      <Box component="main" sx={{ flexGrow: 1, position: "relative" }}>
        <TermsHero />
        <TermsContent sections={TERMS_SECTIONS} />
      </Box>

      <Footer />
    </Background>
  );
}

export default TermsOfServicePage;