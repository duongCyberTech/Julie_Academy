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
  Shield,
  DataUsage,
  LockPerson,
  Share,
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

const PolicyHero = React.memo(() => {
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
                <Shield sx={{ fontSize: 36 }} />
              </Avatar>
            </Box>
          </motion.div>
          <motion.div variants={MOTION_VARIANTS.fadeInUp}>
            <Typography component="h1" variant="h2" fontWeight={700} color="text.primary" gutterBottom>
              Chính sách bảo mật
            </Typography>
          </motion.div>
          <motion.div variants={MOTION_VARIANTS.fadeInUp}>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", maxWidth: 600, mx: "auto" }}>
              Bảo vệ thông tin cá nhân của bạn là ưu tiên hàng đầu tại Julie Academy. Vui lòng đọc kỹ các chính sách dưới đây.
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

const PolicyContent = React.memo(({ sections }) => {
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
                Bạn có câu hỏi về chính sách?
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Đừng ngần ngại liên hệ với đội ngũ hỗ trợ của chúng tôi để được giải đáp chi tiết.
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" color="primary.main">
                <MailOutline fontSize="small" />
                <Typography variant="body2" fontWeight={700}>
                  support@julieacademy.vn
                </Typography>
              </Stack>
            </Box>
          </DocumentPaper>
        </motion.div>
      </Container>
    </StyledSectionWrapper>
  );
});

function PolicyPage({ mode, toggleMode }) {
  const POLICY_SECTIONS = useMemo(
    () => [
      {
        icon: <DataUsage fontSize="small" />,
        title: "1. Thu thập thông tin",
        content: "Khi bạn đăng ký tài khoản hoặc sử dụng các dịch vụ trên nền tảng Julie Academy, chúng tôi có thể thu thập các thông tin cá nhân cơ bản như họ tên, địa chỉ email, số điện thoại và dữ liệu liên quan đến quá trình học tập của bạn. Mục đích duy nhất là để cá nhân hóa lộ trình và nâng cao trải nghiệm của bạn.",
      },
      {
        icon: <LockPerson fontSize="small" />,
        title: "2. Bảo vệ dữ liệu",
        content: "Toàn bộ dữ liệu của bạn được mã hóa và lưu trữ trên các máy chủ bảo mật cao. Chúng tôi áp dụng các tiêu chuẩn an ninh mạng tiên tiến nhất để ngăn chặn truy cập trái phép, đánh cắp hoặc sửa đổi dữ liệu cá nhân của người dùng.",
      },
      {
        icon: <Share fontSize="small" />,
        title: "3. Chia sẻ thông tin",
        content: "Julie Academy cam kết KHÔNG bán, cho thuê hoặc trao đổi thông tin cá nhân của bạn với bất kỳ bên thứ ba nào vì mục đích thương mại. Thông tin chỉ được chia sẻ trong nội bộ hệ thống giữa học viên và gia sư được chỉ định để phục vụ cho việc giảng dạy.",
      },
      {
        icon: <Shield fontSize="small" />,
        title: "4. Quyền lợi của bạn",
        content: "Bạn có toàn quyền truy cập, chỉnh sửa hoặc yêu cầu xóa bỏ hoàn toàn dữ liệu cá nhân của mình khỏi hệ thống của chúng tôi bất cứ lúc nào thông qua phần Cài đặt tài khoản. Mọi thay đổi về chính sách sẽ được thông báo trước qua email.",
      },
    ],
    []
  );

  return (
    <Background>
      <Helmet>
        <title>Chính sách bảo mật - Julie Academy</title>
        <meta name="description" content="Chính sách bảo mật thông tin người dùng của Julie Academy." />
      </Helmet>

      <Header mode={mode} toggleMode={toggleMode} />

      <Box component="main" sx={{ flexGrow: 1, position: "relative" }}>
        <PolicyHero />
        <PolicyContent sections={POLICY_SECTIONS} />
      </Box>

      <Footer />
    </Background>
  );
}

export default PolicyPage;