import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  useTheme,
  alpha,
  styled,
  Chip,
  Stack,
  Grid,
} from "@mui/material";

// Icons
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import EmojiObjectsRoundedIcon from "@mui/icons-material/EmojiObjectsRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

import Card from "../../components/Card";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Background } from "../../components/Background";

// Images
import homepage1 from "../../assets/images/homepage1.webp";
import homepage2 from "../../assets/images/homepage2.webp";
import homepage3 from "../../assets/images/homepage3.webp";
import qt from "../../assets/images/qt.webp";

const MOTION_VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  },
};

const FEATURES = [
  {
    icon: EmojiObjectsRoundedIcon,
    title: "Cá nhân hóa lộ trình",
    description:
      "Phân tích năng lực thực tế, tạo ra lộ trình học tập tối ưu dành riêng cho từng học sinh.",
  },
  {
    icon: MenuBookRoundedIcon,
    title: "Học liệu tin cậy",
    description:
      "Hệ thống kiến thức chuẩn hóa, sinh động được kiểm duyệt bởi giáo viên giàu kinh nghiệm.",
  },
  {
    icon: SchoolRoundedIcon,
    title: "Gia sư đồng hành",
    description:
      "Kết nối nhanh chóng với mạng lưới gia sư chất lượng cao, sẵn sàng hỗ trợ 24/7.",
  },
];

const StyledSectionWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  paddingBlock: theme.spacing(6),
  [theme.breakpoints.down("md")]: { paddingBlock: theme.spacing(4) },
}));

const ContentDisplayCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  background:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.6)
      : alpha(theme.palette.background.paper, 0.8),
  backdropFilter: "blur(12px)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
}));

const StyledImageBox = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2.5,
  overflow: "hidden",
  boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
  aspectRatio: "4/3",
  maxWidth: "500px",
  backgroundColor: alpha(theme.palette.divider, 0.1),
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
}));

const InteractiveWord = ({ word, onClick, type }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const colors = {
    blue: {
      bg: isDark ? alpha(theme.palette.primary.main, 0.15) : "#E0F2FE",
      text: isDark ? theme.palette.primary.light : "#0284C7",
      border: isDark ? alpha(theme.palette.primary.main, 0.3) : "#7DD3FC",
    },
    orange: {
      bg: isDark ? alpha("#EA580C", 0.15) : "#FFEDD5",
      text: isDark ? "#FB923C" : "#EA580C",
      border: isDark ? alpha("#EA580C", 0.3) : "#FDBA74",
    },
    purple: {
      bg: isDark ? alpha("#9333EA", 0.15) : "#F3E8FF",
      text: isDark ? "#C084FC" : "#9333EA",
      border: isDark ? alpha("#9333EA", 0.3) : "#D8B4FE",
    },
  };

  const activeColor = colors[type];

  return (
    <Box
      component="span"
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: activeColor.text,
        fontWeight: 700,
        cursor: "pointer",
        padding: "2px 14px",
        margin: "4px",
        backgroundColor: activeColor.bg,
        border: `2px solid ${activeColor.border}`,
        borderRadius: "10px",
        boxShadow: isDark
          ? `0 3px 0 ${alpha(activeColor.border, 0.5)}`
          : `0 3px 0 ${activeColor.border}`,
        transition: "all 0.1s ease",
        minWidth: { xs: "100px", md: "140px" },
        "&:active": { transform: "translateY(2px)", boxShadow: "0 0px 0" },
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={word}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </Box>
  );
};

const HeroSection = React.memo(() => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const [idx, setIdx] = useState({ sub: 0, goal: 0, tutor: 0 });

  const data = {
    subs: [
      "Toán học",
      "Tiếng Anh",
      "Ngữ Văn",
      "Vật Lý",
      "Hóa Học",
      "Hình học 9",
    ],
    goals: [
      "chinh phục điểm cao",
      "săn học bổng xịn",
      "vượt qua kỳ thi",
      "hiện thực ước mơ",
      "thay đổi tương lai",
      "theo đuổi đam mê",
    ],
    tutors: [
      "Anh lớn thủ khoa",
      "Chị cả ôn chuyên",
      "Thầy giáo tâm lý",
      "Cô giáo truyền lửa",
      "Chiến thần luyện đề",
      "Phù thủy tư duy",
    ],
  };

  const next = (key) =>
    setIdx((prev) => ({
      ...prev,
      [key]: (prev[key] + 1) % data[key + "s"].length,
    }));

  return (
    <StyledSectionWrapper sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={3} alignItems={{ xs: "center", md: "flex-start" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "6px",
                    fontWeight: 800,
                  }}
                >
                  JULIE ACADEMY
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    letterSpacing: 1,
                  }}
                >
                  • CHẠM ĐỂ THAY ĐỔI LỘ TRÌNH
                </Typography>
              </Stack>

              <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2rem", md: "3rem" },
                    mb: 2,
                    fontWeight: 700,
                  }}
                >
                  Sẵn sàng cùng{" "}
                  <InteractiveWord
                    word={data.tutors[idx.tutor]}
                    onClick={() => next("tutor")}
                    type="orange"
                  />
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    fontSize: { xs: "1.4rem", md: "1.8rem" },
                    color: "text.primary",
                  }}
                >
                  Làm chủ{" "}
                  <InteractiveWord
                    word={data.subs[idx.sub]}
                    onClick={() => next("sub")}
                    type="blue"
                  />{" "}
                  và{" "}
                  <InteractiveWord
                    word={data.goals[idx.goal]}
                    onClick={() => next("goal")}
                    type="purple"
                  />
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 3,
                    color: "text.secondary",
                    maxWidth: "520px",
                    fontSize: "1.1rem",
                    borderLeft: "3px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                    pl: 2,
                  }}
                >
                  Nền tảng học tập cá nhân hóa giúp học sinh trung học bứt phá
                  điểm số thông qua phương pháp học tập thích ứng.
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/login")}
                size="large"
                endIcon={<RocketLaunchRoundedIcon />}
                sx={{ borderRadius: "16px", px: 6, py: 2, fontSize: "1.15rem" }}
              >
                Kích hoạt lộ trình ngay
              </Button>
            </Stack>
          </Grid>

          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Box sx={{ position: "relative" }}>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "40px",
                    bgcolor: "background.paper",
                    backdropFilter: "blur(12px)",
                    boxShadow: isDark
                      ? `0 40px 80px rgba(0,0,0,0.4)`
                      : "0 40px 80px rgba(0,0,0,0.08)",
                    width: { xs: "280px", md: "400px" },
                    aspectRatio: "1/1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${isDark ? theme.palette.midnight?.border : "rgba(0,0,0,0.05)"}`,
                  }}
                >
                  <Box
                    component="img"
                    src={qt}
                    alt={"Try Hard"}
                    sx={{
                      width: "85%",
                      filter: isDark
                        ? "drop-shadow(0 0 10px rgba(56,189,248,0.2))"
                        : "none",
                    }}
                  />
                </Box>
              </motion.div>

              <Paper
                sx={{
                  position: "absolute",
                  bottom: 30,
                  right: -10,
                  px: 2,
                  py: 1.5,
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "background.paper",
                  backgroundImage: "none",
                  border: `1px solid ${isDark ? theme.palette.midnight?.border : "#eee"}`,
                }}
              >
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.15),
                    p: 0.5,
                    borderRadius: "50%",
                    display: "flex",
                  }}
                >
                  <VerifiedUserRoundedIcon
                    sx={{ fontSize: 16, color: "success.main" }}
                  />
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, lineHeight: 1 }}
                  >
                    100+
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Gia sư tham gia
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </StyledSectionWrapper>
  );
});
const ContentSection = React.memo(
  ({ imgSrc, imgAlt, title, content, direction }) => (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          alignItems: "center",
          gap: 6,
        }}
      >
        <Box sx={{ order: { xs: 2, md: direction === "row" ? 1 : 2 } }}>
          <ContentDisplayCard elevation={0}>
            <Typography variant="h4" fontWeight={700} mb={2}>
              {title}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.7 }}
            >
              {content}
            </Typography>
          </ContentDisplayCard>
        </Box>
        <Box sx={{ order: { xs: 1, md: direction === "row" ? 2 : 1 } }}>
          <StyledImageBox>
            <img src={imgSrc} alt={imgAlt} loading="lazy" />
          </StyledImageBox>
        </Box>
      </Box>
    </Container>
  ),
);

export default function HomePage({ mode, toggleMode }) {
  const PAGE_SECTIONS = useMemo(
    () => [
      {
        type: "content",
        imgSrc: homepage1,
        imgAlt: "Method",
        title: "Đánh thức tiềm năng vô hạn",
        content:
          "Không chỉ dừng lại ở những con số và lý thuyết khô khan, Julie Academy mang đến một hệ sinh thái học tập tương tác đa chiều. Chúng tôi giúp bạn nắm bắt bản chất vấn đề một cách tự nhiên, biến những kiến thức phức tạp thành những trải nghiệm thú vị và khắc sâu vào tư duy.",
        direction: "row",
      },
      { type: "features" },
      {
        type: "content",
        imgSrc: homepage2,
        imgAlt: "Journey",
        title: "Lộ trình riêng biệt - Thành công khác biệt",
        content:
          "Mỗi học sinh là một cá thể duy nhất với những thế mạnh riêng. Tại đây, chúng tôi không chỉ cung cấp bài giảng, mà còn là người bạn đồng hành thấu hiểu, theo sát từng bước ngoặt trong hành trình chinh phục tri thức, giúp bạn tự tin vượt qua mọi rào cản để chạm đến mục tiêu cao nhất.",
        direction: "row-reverse",
      },
      {
        type: "content",
        imgSrc: homepage3,
        imgAlt: "Connect",
        title: "Gắn kết tri thức trong kỷ nguyên số",
        content:
          "Chúng tôi xóa nhòa khoảng cách giữa giáo viên và học sinh bằng môi trường kết nối thông minh. Sự tương tác liên tục, phản hồi kịp thời và tinh thần cùng nhau tiến bộ chính là chìa khóa giúp bạn không bao giờ cảm thấy đơn độc trên con đường học thuật đầy thử thách.",
        direction: "row",
      },
    ],
    [],
  );

  return (
    <Background>
      <Helmet>
        <title>Julie Academy | Nền tảng học tập thông minh</title>
      </Helmet>
      <Header mode={mode} toggleMode={toggleMode} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <HeroSection />
        {PAGE_SECTIONS.map((section, index) => (
          <StyledSectionWrapper key={index}>
            {section.type === "features" ? (
              <Container maxWidth="lg">
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "0.75fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  {FEATURES.map((f) => (
                    <Card key={f.title} {...f} />
                  ))}
                </Box>
              </Container>
            ) : (
              <ContentSection {...section} />
            )}
          </StyledSectionWrapper>
        ))}
      </Box>
      <Footer />
    </Background>
  );
}
