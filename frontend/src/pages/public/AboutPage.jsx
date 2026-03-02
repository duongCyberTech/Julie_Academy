import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Container,
  Typography,
  Box,
  Button,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Stack,
  styled,
} from "@mui/material";
import {
  Devices,
  CheckCircle,
  FormatQuote,
  EmojiObjects,
  RocketLaunch,
  AutoAwesome,
  Psychology,
  LibraryBooks,
} from "@mui/icons-material";

import { Background } from "../../components/Background";
import Role3 from "../../assets/images/role3.webp";

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
  overflow: "hidden",
  [theme.breakpoints.down("md")]: { paddingBlock: theme.spacing(6) },
}));

const StyledFeatureCard = styled(Paper)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(4),
    height: "100%",
    borderRadius: theme.shape.borderRadius * 2,
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
    background: isDark
      ? alpha(theme.palette.background.paper, 0.8)
      : alpha(theme.palette.background.paper, 0.95),
    border: isDark
      ? `1px solid ${alpha(theme.palette.common.white, 0.08)}`
      : `1px solid ${alpha(theme.palette.primary.light, 0.2)}`,
    boxShadow: isDark ? "none" : theme.shadows[3],
    "&:hover": {
      transform: isDark ? "none" : "translateY(-4px)",
      boxShadow: isDark ? "none" : theme.shadows[8],
    },
  };
});

const StyledImageBox = React.memo(({ src, alt }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: theme.shape.borderRadius * 2.5,
        background: isDark
          ? `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.1)})`
          : `linear-gradient(145deg, ${alpha(theme.palette.primary.light, 0.2)}, ${alpha(theme.palette.secondary.light, 0.15)})`,
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
        loading="lazy"
        decoding="async"
        sx={{
          width: "100%",
          height: "auto",
          aspectRatio: "4/3",
          objectFit: "cover",
          borderRadius: theme.shape.borderRadius * 2,
          display: "block",
          filter: isDark ? "brightness(0.9)" : "none",
          backgroundColor: alpha(theme.palette.neutral[200], 0.5),
        }}
      />
    </Box>
  );
});

const MissionSection = React.memo(() => {
  const theme = useTheme();
  return (
    <StyledSectionWrapper sx={{ pt: { xs: 12, md: 16 } }}>
      <Container maxWidth="md" sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.15 } } }}>
          <motion.div variants={MOTION_VARIANTS.fadeInUp}>
            <Box
              display="inline-flex"
              alignItems="center"
              gap={1}
              mb={3}
              sx={{
                py: 0.75,
                px: 2,
                borderRadius: 50,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <AutoAwesome color="primary" sx={{ fontSize: 18 }} />
              <Typography variant="caption" color="primary.main" fontWeight={700} textTransform="uppercase" letterSpacing={1}>
                Sứ mệnh
              </Typography>
            </Box>
          </motion.div>

          <motion.div variants={MOTION_VARIANTS.fadeInUp}>
            <Typography component="h1" variant="h2" fontWeight={700} color="text.primary" sx={{ mb: 3 }}>
              Tiếp sức hành trình tri thức
            </Typography>
          </motion.div>

          <motion.div variants={MOTION_VARIANTS.fadeInUp}>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: "auto", lineHeight: 1.8, fontSize: "1.15rem" }}>
              Chúng tôi tin rằng một lộ trình học tập phù hợp chính là chìa khóa để mở ra sự tự tin và bứt phá giới hạn bản thân.
            </Typography>
          </motion.div>
        </motion.div>
      </Container>
    </StyledSectionWrapper>
  );
});

const FeaturesSection = React.memo(({ features }) => {
  const theme = useTheme();
  return (
    <StyledSectionWrapper>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h2" fontWeight={700} color="text.primary">
            Tại sao chọn Julie Academy?
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: { xs: 3, md: 4 } }}>
          {features.map((feature, index) => (
            <motion.div key={feature.title} initial="initial" whileInView="animate" viewport={{ once: true, amount: 0.2 }} variants={MOTION_VARIANTS.fadeInUp}>
              <StyledFeatureCard elevation={0}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette[feature.color].main, 0.15),
                    color: `${feature.color}.main`,
                    width: 56,
                    height: 56,
                    mb: 1,
                  }}
                >
                  {React.cloneElement(feature.icon, { fontSize: "medium" })}
                </Avatar>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {feature.title}
                </Typography>
              </StyledFeatureCard>
            </motion.div>
          ))}
        </Box>
      </Container>
    </StyledSectionWrapper>
  );
});

const AudienceSection = React.memo(({ items }) => {
  const theme = useTheme();
  return (
    <StyledSectionWrapper>
      <Container maxWidth="lg">
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, alignItems: "center", gap: { xs: 6, md: 10 } }}>
          <Box sx={{ order: { xs: 2, md: 1 } }}>
            <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={MOTION_VARIANTS.fadeInUp}>
              <StyledImageBox src={Role3} alt="Giải pháp toàn diện" />
            </motion.div>
          </Box>

          <Box sx={{ order: { xs: 1, md: 2 } }}>
            <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={{ animate: { transition: { staggerChildren: 0.1 } } }}>
              <motion.div variants={MOTION_VARIANTS.fadeInUp}>
                <Typography variant="h3" component="h2" fontWeight={700} gutterBottom color="text.primary" mb={3}>
                  Giải pháp toàn diện
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, fontSize: "1.05rem", lineHeight: 1.8 }}>
                  Hệ sinh thái kết nối chặt chẽ giữa các vai trò giúp tối ưu hóa hiệu quả học tập và giảng dạy.
                </Typography>
              </motion.div>

              <List disablePadding>
                {items.map((item, index) => (
                  <motion.div variants={MOTION_VARIANTS.fadeInUp} key={item.primary}>
                    <ListItem sx={{ px: 0, py: 2, borderBottom: index !== items.length - 1 ? `1px solid ${theme.palette.divider}` : "none" }}>
                      <ListItemIcon sx={{ minWidth: 56 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", width: 40, height: 40 }}>
                          <CheckCircle fontSize="small" />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="h6" fontWeight={700} color="text.primary">{item.primary}</Typography>}
                        secondary={<Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>{item.secondary}</Typography>}
                      />
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </motion.div>
          </Box>
        </Box>
      </Container>
    </StyledSectionWrapper>
  );
});

const TestimonialSection = React.memo(() => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  
  return (
    <StyledSectionWrapper>
      <Container maxWidth="md">
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={MOTION_VARIANTS.fadeInUp}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 5, md: 8 },
              textAlign: "center",
              borderRadius: theme.shape.borderRadius * 3,
              background: isDark ? alpha(theme.palette.background.paper, 0.6) : alpha(theme.palette.background.paper, 0.8),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              boxShadow: theme.shadows[4],
              position: "relative",
            }}
          >
            <FormatQuote sx={{ fontSize: 64, color: "primary.main", opacity: 0.1, position: "absolute", top: 24, left: 24 }} />
            <Typography
              variant="h5"
              component="blockquote"
              sx={{ fontStyle: "italic", mb: 4, lineHeight: 1.8, fontWeight: 600, color: "text.primary" }}
            >
              "Tôi đã sử dụng nhiều nền tảng, nhưng Julie Academy thực sự giúp tôi xác định được lỗ hổng kiến thức. Chức năng luyện tập thông minh giống như có một gia sư riêng bên cạnh."
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
              <Avatar sx={{ bgcolor: "secondary.main", width: 48, height: 48, fontWeight: 700 }}>M</Avatar>
              <Box textAlign="left">
                <Typography variant="subtitle1" fontWeight={700} color="text.primary">Minh Quân</Typography>
                <Typography variant="body2" color="text.secondary">Học viên THPT</Typography>
              </Box>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </StyledSectionWrapper>
  );
});

const StorySection = React.memo(() => {
  const theme = useTheme();
  return (
    <StyledSectionWrapper>
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={MOTION_VARIANTS.fadeInUp}>
          <Box mb={3} display="flex" justifyContent="center">
            <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.15), color: "warning.main", width: 64, height: 64 }}>
              <EmojiObjects sx={{ fontSize: 32 }} />
            </Avatar>
          </Box>
          <Typography variant="h3" component="h2" fontWeight={700} gutterBottom color="text.primary" mb={3}>
            Câu chuyện khởi nguồn
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem", lineHeight: 1.8, maxWidth: 700, mx: "auto" }}>
            Julie Academy được sinh ra từ niềm tin rằng không có phương pháp nào phù hợp cho tất cả. Chúng tôi không tin vào việc học vẹt, mà tin vào sự thấu hiểu sâu sắc. Sứ mệnh của chúng tôi là biến việc học trở thành hành trình khám phá đầy thú vị.
          </Typography>
        </motion.div>
      </Container>
    </StyledSectionWrapper>
  );
});

const CtaSection = React.memo(() => {
  const theme = useTheme();
  return (
    <StyledSectionWrapper sx={{ pb: { xs: 12, md: 16 } }}>
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={MOTION_VARIANTS.fadeInUp}>
          <Typography variant="h2" component="h2" fontWeight={700} gutterBottom sx={{ color: "text.primary", mb: 2 }}>
            Sẵn sàng bứt phá?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 500, mx: "auto", lineHeight: 1.6, fontSize: "1.1rem" }}>
            Tham gia cùng hàng ngàn học viên khác và nâng tầm kiến thức ngay hôm nay.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            href="/register"
            endIcon={<RocketLaunch />}
            sx={{
              borderRadius: "50px",
              px: 5,
              py: 1.5,
              fontSize: "1.1rem",
              boxShadow: `0 8px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: `0 12px 25px ${alpha(theme.palette.secondary.main, 0.6)}`,
              },
            }}
          >
            Đăng ký miễn phí
          </Button>
        </motion.div>
      </Container>
    </StyledSectionWrapper>
  );
});

function AboutPage() {
  const FEATURES = useMemo(
    () => [
      { icon: <Psychology />, color: "primary", title: "Lộ trình cá nhân hóa" },
      { icon: <LibraryBooks />, color: "secondary", title: "Kho tài liệu chuẩn" },
      { icon: <Devices />, color: "primary", title: "Đa nền tảng" },
    ],
    []
  );

  const AUDIENCE_ITEMS = useMemo(
    () => [
      { primary: "Học viên", secondary: "Luyện tập chủ động, nhận phản hồi tức thì và cải thiện điểm số." },
      { primary: "Gia sư & Giáo viên", secondary: "Quản lý lớp học dễ dàng, giao bài tập và xem báo cáo chi tiết." },
      { primary: "Phụ huynh", secondary: "Đồng hành cùng con, nắm bắt điểm mạnh và điểm cần cải thiện." },
    ],
    []
  );

  return (
    <Background>
      <Box component="main" sx={{ flexGrow: 1, position: "relative" }}>
        <MissionSection />
        <FeaturesSection features={FEATURES} />
        <AudienceSection items={AUDIENCE_ITEMS} />
        <TestimonialSection />
        <StorySection />
        <CtaSection />
      </Box>
    </Background>
  );
}

export default AboutPage;