import React, { useMemo } from "react";
import Role3 from "../../assets/images/role3.webp";  
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from "@mui/material";
import {
  SchoolOutlined,
  DevicesOutlined,
  CheckCircleOutline,
  GroupOutlined,
  FormatQuoteOutlined,
  EmojiObjectsOutlined,
} from "@mui/icons-material";


const features = [
  {
    icon: <CheckCircleOutline />,
    color: "primary",
    title: "Lộ trình học tập cá nhân hóa",
    description:
      "Hệ thống tự động điều chỉnh độ khó và nội dung dựa trên kết quả của bạn.",
  },
  {
    icon: <SchoolOutlined />,
    color: "secondary",
    title: "Nguồn tài liệu phong phú",
    description:
      "Hàng ngàn câu hỏi, bài giảng và bài kiểm tra được biên soạn kỹ lưỡng.",
  },
  {
    icon: <DevicesOutlined />,
    color: "success",
    title: "Giao diện thân thiện",
    description: "Thiết kế trực quan, dễ sử dụng trên mọi thiết bị.",
  },
];

const audienceItems = [
  {
    primary: "Học viên",
    secondary: "Luyện tập theo lộ trình cá nhân hóa, nhận phản hồi tức thì.",
  },
  {
    primary: "Gia sư & Giáo viên",
    secondary: "Tạo lớp học, giao bài tập và theo dõi tiến độ chi tiết của học viên.",
  },
  {
    primary: "Phụ huynh",
    secondary: "Dễ dàng nắm bắt tình hình học tập và điểm mạnh/yếu của con.",
  },
];


const MissionSection = React.memo(() => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        textAlign: "center",
        bgcolor: alpha(theme.palette.primary.main, 0.05),
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          component="h1" 
          fontWeight={700}
          gutterBottom
          color="primary.main"
        >
          Sứ mệnh của chúng tôi
        </Typography>
        <Typography variant="h4" component="p" color="text.primary" sx={{ mb: 1 }}>
          Tiếp sức cho người học trên hành trình làm chủ tri thức.
        </Typography>
        <Typography variant="h5" component="p" color="text.secondary" sx={{ mb: 3 }}>
          Chúng tôi tin rằng một lộ trình học tập phù hợp là chìa khóa cho sự
          tự tin và bứt phá.
        </Typography>
      </Container>
    </Box>
  );
});

/**
 * SECTION 2: Tính năng
 * Dùng h2 cho tiêu đề mục, h3 cho tiêu đề của card
 */
const FeaturesSection = React.memo(({ features }) => {
  const theme = useTheme();
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "background.paper" }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          fontWeight={600}
          textAlign="center"
          gutterBottom
        >
          <GroupOutlined
            sx={{
              mb: -0.5,
              mr: 1,
              color: "secondary.main",
              fontSize: "2rem",
            }}
          />
          Vì sao chọn Julie Academy?
        </Typography>

        <Grid container spacing={4} sx={{ mt: 4 }} justifyContent="center">
          {features.map((feature) => (
            <Grid item xs={12} sm={4} key={feature.title}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  textAlign: "center",
                  height: "100%",
                  borderRadius: 3,
                  background: theme.palette.background.paper,
                  transition: "transform 0.28s ease, box-shadow 0.28s ease",
                  "&:hover": {
                    boxShadow: theme.shadows[8],
                    transform: "translateY(-6px) scale(1.01)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: `${feature.color}.main`,
                    color: `${feature.color}.contrastText`,
                    width: 64,
                    height: 64,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  {React.cloneElement(feature.icon, { fontSize: "large" })}
                </Avatar>
                <Typography
                  variant="h6"
                  component="h3" 
                  fontWeight={600}
                  gutterBottom
                >
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
});

/**
 * SECTION 3: Đối tượng
 * Dùng h2 cho tiêu đề mục
 */
const AudienceSection = React.memo(({ items }) => {
  const theme = useTheme();
  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Grid container spacing={5} alignItems="center">
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              component="img"
              src={Role3} 
              alt="Học viên và gia sư"
              sx={{
                width: "50%",
                maxWidth: 400,
                height: "auto",
                borderRadius: 3,
                boxShadow: theme.shadows[6],
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h4"
              component="h2" 
              fontWeight={600}
              gutterBottom
            >
              Công cụ cho mọi vai trò
            </Typography>
            <Typography
              variant="body1"
              component="p"
              paragraph
              sx={{ fontSize: "1.1rem" }}
            >
              Julie Academy được thiết kế cho mọi đối tượng tham gia vào quá
              trình học tập.
            </Typography>
            <List>
              {items.map((item) => (
                <ListItem key={item.primary}>
                  <ListItemIcon>
                    <CheckCircleOutline color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.primary}
                    secondary={item.secondary}
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
        <Typography
          variant="h4"
          component="h2" 
          fontWeight={600}
          textAlign="center"
          gutterBottom
        >
          Học viên nói gì về Julie Academy?
        </Typography>
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 4,
            mt: 4,
            textAlign: "center",
            borderRadius: 3,
            borderColor: alpha(theme.palette.primary.main, 0.5),
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <FormatQuoteOutlined color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography
            variant="h6"
            component="blockquote"
            sx={{ fontStyle: "italic", mb: 2 }}
          >
            "Tôi đã sử dụng nhiều nền tảng, nhưng Julie Academy thực sự giúp
            tôi xác định được lỗ hổng kiến thức của mình. Chức năng luyện tập
            thông minh thật tuyệt vời!"
          </Typography>
          <Typography variant="subtitle1" component="cite" fontWeight={600}>
            — Minh Quân, Sinh viên
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
});

/**
 * SECTION 5: Câu chuyện
 * Dùng h2 cho tiêu đề mục
 */
const StorySection = React.memo(() => (
  <Box
    sx={{
      py: { xs: 6, md: 8 },
      textAlign: "center",
      bgcolor: "background.default",
    }}
  >
    <Container maxWidth="md">
      <Avatar
        sx={{
          bgcolor: "secondary.main",
          width: 56,
          height: 56,
          mx: "auto",
          mb: 2,
        }}
      >
        <EmojiObjectsOutlined />
      </Avatar>
      <Typography
        variant="h4"
        component="h2" 
        fontWeight={600}
        gutterBottom
      >
        Câu chuyện của chúng tôi
      </Typography>
      <Typography variant="body1" component="p" color="text.secondary" sx={{ mb: 3 }}>
        Julie Academy được sinh ra từ niềm tin rằng vấn đề không nằm ở bạn. Tên
        "Julie" đại diện cho tất cả những người học đó: những người đang tìm
        kiếm một con đường khác, một cách sắp xếp kiến thức phù hợp với cách
        tư duy duy nhất của họ. Chúng tôi không tin vào việc học vẹt hay chạy
        đua mà tin vào sự thấu hiểu. Chúng tôi tin rằng khi bạn được
        trao đúng công cụ để cá nhân hóa lộ trình, việc học sẽ trở thành một
        hành trình khám phá, không còn là một gánh nặng. Đó là lý do Julie
        Academy tồn tại.
      </Typography>
    </Container>
  </Box>
));

/**
 * SECTION 6: Kêu gọi hành động
 * Dùng h2 cho tiêu đề mục
 */
const CtaSection = React.memo(() => (
  <Box
    sx={{
      py: { xs: 6, md: 8 },
      textAlign: "center",
      bgcolor: "background.paper",
    }}
  >
    <Container maxWidth="md">
      <Typography
        variant="h4"
        component="h2" 
        fontWeight={600}
        gutterBottom
      >
        Sẵn sàng để bắt đầu?
      </Typography>
      <Typography variant="h6" component="p" color="text.secondary" sx={{ mb: 3 }}>
        Tham gia cùng hàng ngàn học viên khác và nâng tầm kiến thức của bạn
        ngay hôm nay.
      </Typography>
      <Button variant="contained" size="large" href="/register">
        Đăng ký miễn phí
      </Button>
    </Container>
  </Box>
));

function AboutPage() {
  return (
    <Box>
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