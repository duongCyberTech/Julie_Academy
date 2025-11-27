import React from "react";
import Role3 from "../../assets/images/role3.webp";
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
  alpha,
  useTheme,
  Stack,
  styled,
  Grid,
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

const features = [
  {
    icon: <Psychology />,
    color: "primary",
    title: "Lộ trình cá nhân hóa",
  },
  {
    icon: <LibraryBooks />,
    color: "secondary",
    title: "Kho tài liệu chuẩn",
  },
  {
    icon: <Devices />,
    color: "success",
    title: "Đa nền tảng",
  },
];

const audienceItems = [
  {
    primary: "Học viên",
    secondary: "Luyện tập chủ động, nhận phản hồi tức thì và cải thiện điểm số.",
  },
  {
    primary: "Gia sư & Giáo viên",
    secondary: "Quản lý lớp học dễ dàng, giao bài tập và xem báo cáo chi tiết.",
  },
  {
    primary: "Phụ huynh",
    secondary: "Đồng hành cùng con, nắm bắt điểm mạnh và điểm cần cải thiện.",
  },
];

const StyledFeatureCard = styled(Paper)(({ theme }) => ({
  display: "flex", 
  flexDirection: "row", 
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2), 
  height: "100%",
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[3],
    borderColor: theme.palette.primary.main,
  },
}));

const MissionSection = React.memo(() => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        py: { xs: 6, md: 12 },
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        bgcolor: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.background.default, 0.5) 
          : alpha(theme.palette.primary.main, 0.02),
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "-50%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: "200%",
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      
      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Box 
          display="inline-flex" 
          alignItems="center" 
          gap={1} 
          mb={1} 
          sx={{ 
            py: 0.5, 
            px: 1.5, 
            borderRadius: 50, 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}
        >
          <AutoAwesome color="primary" sx={{ fontSize: 16 }} />
          <Typography variant="caption" color="primary.main" fontWeight={600} textTransform="uppercase">
            Sứ mệnh
          </Typography>
        </Box>
        
        <Typography
          variant="h3"
          component="h1"
          fontWeight={600}
          gutterBottom
          sx={{
            color: "text.primary",
            mb: 2,
            letterSpacing: "-0.5px",
            fontSize: { xs: "2rem", md: "2.75rem" }
          }}
        >
          Tiếp sức hành trình tri thức
        </Typography>
        
        <Typography 
          variant="h6" 
          component="p" 
          color="text.secondary" 
          sx={{ 
            mb: 0, 
            lineHeight: 1.6, 
            maxWidth: "700px", 
            mx: "auto",
            fontWeight: 400, 
            fontSize: { xs: "1rem", md: "1rem" }
          }}
        >
          Chúng tôi tin rằng một lộ trình học tập phù hợp chính là chìa khóa để mở ra sự tự tin và bứt phá giới hạn bản thân.
        </Typography>
      </Container>
    </Box>
  );
});

const FeaturesSection = React.memo(({ features }) => {
  const theme = useTheme();
  return (
    <Box sx={{ py: { xs: 4, md: 5 }, bgcolor: "background.paper" }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={4}>
          <Typography variant="h5" component="h2" fontWeight={600} color="text.primary">
            Tại sao chọn Julie Academy?
          </Typography>
        </Box>

        <Grid container spacing={2} justifyContent="center">
          {features.map((feature) => (
            <Grid size={{ xs: 12, md: 4 }} key={feature.title}>
              <StyledFeatureCard elevation={0}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette[feature.color].main, 0.1),
                    color: `${feature.color}.main`,
                    width: 40,
                    height: 40,
                  }}
                >
                  {React.cloneElement(feature.icon, { fontSize: "small" })}
                </Avatar>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  {feature.title}
                </Typography>
              </StyledFeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
});

const AudienceSection = React.memo(({ items }) => {
  const theme = useTheme();
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: "relative", p: 1, maxWidth: 300, mx: "auto" }}>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  transform: "rotate(-2deg)",
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  zIndex: 0
                }}
              />
              <Box
                component="img"
                src={Role3}
                alt="Interaction"
                sx={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 3,
                  boxShadow: theme.shadows[2],
                  position: "relative",
                  zIndex: 1,
                  display: "block",
                  bgcolor: "background.paper"
                }}
              />
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h4" component="h2" fontWeight={600} gutterBottom color="text.primary">
              Giải pháp toàn diện
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3, fontSize: "1rem", lineHeight: 1.7 }}>
              Hệ sinh thái kết nối chặt chẽ giữa các vai trò giúp tối ưu hóa hiệu quả học tập và giảng dạy.
            </Typography>
            <List disablePadding>
              {items.map((item) => (
                <ListItem key={item.primary} sx={{ px: 0, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: "primary.main", width: 32, height: 32 }}>
                      <CheckCircle fontSize="small" />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                        {item.primary}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {item.secondary}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
});

const TestimonialSection = React.memo(() => {
  const theme = useTheme();
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "background.paper" }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 }, 
            textAlign: "center",
            borderRadius: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
            position: "relative",
          }}
        >
          <FormatQuote sx={{ fontSize: 48, color: "primary.main", opacity: 0.15, position: "absolute", top: 16, left: 16 }} />
          <Typography
            variant="h6"
            component="blockquote"
            sx={{ 
              fontStyle: "italic", 
              mb: 3, 
              lineHeight: 1.6, 
              fontWeight: 400,
              fontSize: { xs: "1rem", md: "1.1rem" },
              color: "text.primary"
            }}
          >
            "Tôi đã sử dụng nhiều nền tảng, nhưng Julie Academy thực sự giúp tôi xác định được lỗ hổng kiến thức. 
            Chức năng luyện tập thông minh giống như có một gia sư riêng bên cạnh."
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <Avatar sx={{ bgcolor: "secondary.main", width: 40, height: 40, fontWeight: "bold", fontSize: "0.9rem" }}>M</Avatar>
            <Box textAlign="left">
              <Typography variant="subtitle2" fontWeight={800} color="text.primary">Minh Quân</Typography>
              <Typography variant="caption" color="text.secondary">Học viên THPT</Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
});

const StorySection = React.memo(() => {
  const theme = useTheme();
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, textAlign: "center", bgcolor: "background.default" }}>
      <Container maxWidth="md">
        <Box mb={2} display="flex" justifyContent="center">
          <Avatar 
            sx={{ 
              bgcolor: alpha(theme.palette.warning.main, 0.1), 
              color: "warning.main", 
              width: 56, 
              height: 56,
              boxShadow: theme.shadows[1]
            }}
          >
            <EmojiObjects sx={{ fontSize: 28 }} />
          </Avatar>
        </Box>
        <Typography variant="h4" component="h2" fontWeight={600} gutterBottom color="text.primary">
          Câu chuyện khởi nguồn
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          paragraph 
          sx={{ 
            fontSize: "1rem", 
            lineHeight: 1.8,
            maxWidth: "700px", 
            mx: "auto",
            fontWeight: 400
          }}
        >
          Julie Academy được sinh ra từ niềm tin rằng không có phương pháp nào phù hợp cho tất cả. 
          Chúng tôi không tin vào việc học vẹt, mà tin vào sự thấu hiểu sâu sắc. 
          Sứ mệnh của chúng tôi là biến việc học trở thành hành trình khám phá đầy thú vị.
        </Typography>
      </Container>
    </Box>
  );
});

const CtaSection = React.memo(() => {
  const theme = useTheme();
  return (
    <Box sx={{ py: { xs: 8, md: 10 }, textAlign: "center", bgcolor: "background.paper" }}>
      <Container maxWidth="md">
        <Typography variant="h3" component="h2" fontWeight={600} gutterBottom sx={{ fontSize: { xs: "2rem", md: "2.5rem" }, color: "text.primary" }}>
          Sẵn sàng bứt phá?
        </Typography>
        <Typography variant="body1" component="p" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: "auto", lineHeight: 1.6 }}>
          Tham gia cùng hàng ngàn học viên khác và nâng tầm kiến thức ngay hôm nay.
        </Typography>
        <Button 
          variant="contained" 
          size="medium" 
          href="/register"
          endIcon={<RocketLaunch fontSize="small" />}
          sx={{ 
            borderRadius: 50, 
            px: 4, 
            py: 1.25, 
            fontSize: "0.95rem", 
            fontWeight: 700,
            textTransform: "none",
            boxShadow: theme.shadows[3],
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: theme.shadows[6]
            }
          }}
        >
          Đăng ký miễn phí
        </Button>
      </Container>
    </Box>
  );
});

function AboutPage() {
  return (
    <Box sx={{ overflowX: "hidden" }}>
      <MissionSection />
      <FeaturesSection features={features} />
      <AudienceSection items={audienceItems} />
      <TestimonialSection />
      <StorySection />
      <CtaSection />
    </Box>
  );
}

export default AboutPage;