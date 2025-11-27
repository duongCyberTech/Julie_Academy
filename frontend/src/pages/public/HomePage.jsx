import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  useTheme,
  alpha,
  styled,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import Card from "../../components/Card";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Background from "../../components/Background";
import homepage1 from "../../assets/images/homepage1.webp";
import homepage2 from "../../assets/images/homepage2.webp";
import homepage3 from "../../assets/images/homepage3.webp";

const MOTION_VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  },
};

const StyledSectionWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "hasDivider",
})(({ theme, hasDivider }) => ({
  width: "100%",
  paddingBlock: theme.spacing(4),
  overflow: "hidden",
  ...(hasDivider && { borderTop: `1px solid ${theme.palette.divider}` }),
  [theme.breakpoints.down("md")]: { paddingBlock: theme.spacing(5) },
}));

const ContentDisplayCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  return {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius * 2,
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
    background: isDark
      ? alpha(theme.palette.background.paper, 0.8)
      : theme.palette.background.paper,
    border: isDark ? `1px solid ${alpha(theme.palette.common.white, 0.08)}` : "none",
    boxShadow: isDark ? "none" : theme.shadows[3],
    "&:hover": {
      transform: isDark ? "none" : "translateY(-5px)",
      border: isDark ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}` : "none",
      boxShadow: isDark ? "none" : theme.shadows[10],
    },
  };
});

const StyledImageBox = React.memo(({ src, alt, isFirst }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: theme.shape.borderRadius * 2.5,
        background: isDark
          ? `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.1)})`
          : `linear-gradient(145deg, ${alpha(theme.palette.primary.light, 0.3)}, ${alpha(theme.palette.secondary.light, 0.25)})`,
        border: isDark ? `1px solid ${alpha(theme.palette.primary.light, 0.1)}` : "none",
        boxShadow: isDark
          ? `0 0 20px ${alpha(theme.palette.primary.main, 0.1)}`
          : theme.shadows[4],
        transition: "all 0.3s ease",
      }}
    >
      <Box
        component="img"
        src={src}
        alt={alt}
        loading={isFirst ? "eager" : "lazy"}
        decoding="async"
        sx={{
          width: "100%",
          height: "auto",
          objectFit: "cover",
          borderRadius: theme.shape.borderRadius * 2,
          display: "block",
          filter: isDark ? "brightness(0.9)" : "none",
        }}
      />
    </Box>
  );
});

const HeroSection = React.memo(() => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <StyledSectionWrapper
      sx={{
        pt: { xs: 6, md: 12 },
        pb: { xs: 4, md: 4 },
        background: isDark
          ? theme.palette.background.default
          : `linear-gradient(180deg, #fff 0%, ${alpha(theme.palette.primary.light, 0.07)} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container
        maxWidth="md"
        sx={{ textAlign: "center", position: "relative", zIndex: 1 }}
      >
        <motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.div variants={MOTION_VARIANTS.fadeInUp}>
            <Typography
              component="h1"
              variant="h1"
              fontWeight={900}
              sx={{
                mb: 1,
                background: isDark
                  ? `linear-gradient(90deg, #FFFFFF 0%, ${theme.palette.primary.light} 100%)`
                  : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.accent.main} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-1px",
                transition: "all 0.5s ease",
              }}
            >
              Julie Academy
            </Typography>
          </motion.div>

          <motion.div variants={MOTION_VARIANTS.fadeInUp}>
            <Typography
              component="h2"
              variant="h4"
              fontWeight={700}
              sx={{
                mb: 3,
                background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.accent.main, 0.8)} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                opacity: 0.95,
              }}
            >
              Kiến tạo tri thức – Dẫn lối tương lai
            </Typography>
          </motion.div>

          <motion.div variants={MOTION_VARIANTS.fadeInUp}>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 800,
                mx: "auto",
                lineHeight: 1.9,
                color: isDark
                  ? alpha(theme.palette.text.primary, 0.85)
                  : alpha(theme.palette.text.secondary, 0.95),
                fontSize: "1.1rem",
              }}
            >
              Mỗi học sinh đều xứng đáng được học tập, phát triển và tỏa sáng
            </Typography>
          </motion.div>
        </motion.div>
      </Container>
    </StyledSectionWrapper>
  );
});

const FeatureSection = React.memo(() => {
  const FEATURES = useMemo(
    () => [
      {
        icon: TrendingUpIcon,
        title: "Cá nhân hóa việc học",
        description: "Phân tích điểm mạnh, điểm yếu, tạo ra lộ trình học tập tối ưu và hiệu quả nhất dành riêng cho bạn.",
        variant: "primary",
      },
      {
        icon: MenuBookIcon,
        title: "Nội dung đáng tin cậy",
        description: "Hệ thống kiến thức chuẩn hóa từ nhiều bộ sách giáo khoa, được biên soạn và kiểm duyệt bởi các chuyên gia.",
        variant: "success",
      },
      {
        icon: VolunteerActivismIcon,
        title: "Công cụ hỗ trợ giáo viên",
        description: "Cung cấp công cụ mạnh mẽ giúp giáo viên và gia sư đổi mới phương pháp giảng dạy trong kỷ nguyên số.",
        variant: "warning",
      },
    ],
    []
  );

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: { xs: 3, md: 4 },
        }}
      >
        {FEATURES.map((feature) => (
          <Card
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            iconColor={feature.variant}
          />
        ))}
      </Box>
    </Container>
  );
});

const ContentSection = React.memo(
  ({ isFirstImage, imgSrc, imgAlt, title, content, showButton, direction }) => {
    const navigate = useNavigate();

    return (
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            alignItems: "center",
            gap: { xs: 5, md: 8 },
          }}
        >
          <Box sx={{ order: { xs: 2, md: direction === "row" ? 1 : 2 } }}>
            <ContentDisplayCard>
              <Typography component="h2" variant="h4" fontWeight={700} mb={2}>
                {title}
              </Typography>
              <Typography
                variant="body1"
                sx={{ flexGrow: 1, lineHeight: 1.8, color: "text.secondary" }}
              >
                {content}
              </Typography>
              {showButton && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate("/login")}
                  sx={{ mt: 3, alignSelf: "center" }}
                >
                  Bắt đầu học ngay
                </Button>
              )}
            </ContentDisplayCard>
          </Box>

          <Box
            sx={{
              order: { xs: 1, md: direction === "row" ? 2 : 1 },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box sx={{ maxWidth: "420px", width: "100%" }}>
              <StyledImageBox
                src={imgSrc}
                alt={imgAlt}
                isFirst={isFirstImage}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    );
  }
);

function HomePage({ mode, toggleMode }) {
  const PAGE_SECTIONS = useMemo(
    () => [
      {
        type: "content",
        imgSrc: homepage1,
        imgAlt: "Học sinh sử dụng công nghệ học tập hiện đại",
        title: "CÙNG CHÚNG TÔI TẠO NÊN SỰ KHÁC BIỆT",
        content: "Nền tảng học tập trực tuyến giúp chuẩn hóa kiến thức từ nhiều bộ sách, hỗ trợ gia sư cập nhật phương pháp giảng dạy mới, đồng thời nâng cao hiệu quả tự học và tự kiểm tra cho học sinh.",
        showButton: true,
        direction: "row",
      },
      { type: "features" },
      {
        type: "content",
        imgSrc: homepage2,
        imgAlt: "Kiến Tạo Tri Thức",
        title: "KIẾN TẠO TRI THỨC – DẪN LỐI TƯƠNG LAI",
        content: "Julie Academy không chỉ là một trang web ôn tập thông thường mà là người bạn đồng hành thông minh cho hành trình học tập của bạn.",
        direction: "row-reverse",
      },
      {
        type: "content",
        imgSrc: homepage3,
        imgAlt: "Học sinh và gia sư cùng phát triển",
        title: "CÙNG PHÁT TRIỂN, CÙNG THÀNH CÔNG",
        content: "Julie Academy là môi trường để gia sư, giáo viên cập nhật kiến thức, đổi mới phương pháp và cùng nhau phát triển trong kỷ nguyên giáo dục số.",
        direction: "row",
      },
    ],
    []
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Helmet>
        <title>Julie Academy - Nền tảng học tập trực tuyến</title>
        <meta
          name="description"
          content="Julie Academy - Nền tảng học tập AI kết nối gia sư và học sinh, cá nhân hóa lộ trình học, miễn phí trọn đời."
        />
        <link rel="canonical" href="https://julieacademy.vn/" />
        <link rel="preload" href={homepage1} as="image" />
      </Helmet>

      <Background />
      <Header mode={mode} toggleMode={toggleMode} />

      <Box component="main" sx={{ flexGrow: 1, position: "relative" }}>
        <HeroSection />
        {PAGE_SECTIONS.map((section, index) => (
          <motion.div
            key={`${section.type}-${index}`}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
            variants={MOTION_VARIANTS.fadeInUp}
          >
            <StyledSectionWrapper hasDivider={index > 0}>
              {section.type === "features" ? (
                <FeatureSection />
              ) : (
                <ContentSection {...section} isFirstImage={index === 0} />
              )}
            </StyledSectionWrapper>
          </motion.div>
        ))}
      </Box>

      <Footer />
    </Box>
  );
}

export default HomePage;