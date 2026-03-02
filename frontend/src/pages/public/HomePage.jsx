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
  Grid
} from "@mui/material";

// Icons
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
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
import qt from "../../assets/images/qt.png"; 

const MOTION_VARIANTS = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  },
};

const FEATURES = [
  { icon: EmojiObjectsRoundedIcon, title: "Cá nhân hóa lộ trình", description: "Phân tích năng lực thực tế, tạo ra lộ trình học tập tối ưu dành riêng cho từng học sinh." },
  { icon: MenuBookRoundedIcon, title: "Học liệu tin cậy", description: "Hệ thống kiến thức chuẩn hóa, sinh động được kiểm duyệt bởi giáo viên giàu kinh nghiệm." },
  { icon: SchoolRoundedIcon, title: "Gia sư đồng hành", description: "Kết nối nhanh chóng với mạng lưới gia sư chất lượng cao, sẵn sàng hỗ trợ 24/7." },
];

const StyledSectionWrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  paddingBlock: theme.spacing(6),
  [theme.breakpoints.down("md")]: { paddingBlock: theme.spacing(4) },
}));

const ContentDisplayCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.mode === "dark" ? alpha(theme.palette.background.paper, 0.6) : alpha(theme.palette.background.paper, 0.8),
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
  "& img": { width: "100%", height: "100%", objectFit: "cover", display: "block" }
}));

const InteractiveWord = ({ word, onClick, colorTheme }) => (
  <Box
    component="span"
    onClick={onClick}
    sx={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: colorTheme.text,
      fontWeight: 700,
      cursor: "pointer",
      padding: "2px 14px",
      margin: "4px",
      backgroundColor: colorTheme.bg,
      border: `2px solid ${colorTheme.border}`,
      borderRadius: "10px",
      boxShadow: `0 3px 0 ${colorTheme.border}`,
      transition: "all 0.1s ease",
      minWidth: { xs: "100px", md: "140px" },
      textAlign: "center",
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

const HeroSection = React.memo(() => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [idx, setIdx] = useState({ sub: 0, goal: 0, tutor: 0 });

  const data = {
    subjects: ["Toán học", "Tiếng Anh", "Ngữ Văn", "Vật Lý", "Hóa Học", "Hình học 9"],
    goals: ["hóa giải mọi đề khó", "chạm đỉnh phong độ", "vượt rào điểm 9+", "xóa tan mất gốc", "về đích sớm"],
    tutors: ["gia sư tận tâm", "giáo viên tâm lý", "trùm lý thuyết", "chuyên gia gỡ rối", "phù thủy kiến thức"]
  };

  const pastel = {
    blue: { bg: "#E0F2FE", text: "#0284C7", border: "#7DD3FC" },
    orange: { bg: "#FFEDD5", text: "#EA580C", border: "#FDBA74" },
    purple: { bg: "#F3E8FF", text: "#9333EA", border: "#D8B4FE" },
  };

  return (
    <StyledSectionWrapper sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">
        <Stack spacing={6} alignItems="center">
          
          {/* PHẦN 1: ẢNH VÀ CHỮ TRÊN CÙNG MỘT HÀNG */}
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            
            {/* Ảnh bên trái */}
            <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <Box sx={{
                  p: 1,
                  borderRadius: "28px",
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: `0 20px 40px ${alpha(theme.palette.text.primary, 0.05)}`,
                  width: { xs: "220px", md: "300px" },
                  aspectRatio: "1/1",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Box component="img" src={qt} alt="Julie Academy" sx={{ width: "80%", height: "80%", objectFit: "contain" }} />
                </Box>
              </motion.div>
            </Grid>

            {/* Chữ bên phải */}
            <Grid item xs={12} md={7}>
              <Stack spacing={3} alignItems={{ xs: "center", md: "flex-start" }}>
                <motion.div variants={MOTION_VARIANTS.fadeInUp} initial="initial" animate="animate">
                  <Typography variant="h3" sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: "1.8rem", md: "2.6rem" }, 
                    lineHeight: 1.3,
                    textAlign: { xs: "center", md: "left" },
                    color: "text.primary"
                  }}>
                    Xóa bỏ giới hạn, giúp bạn tự tin để <br />
                    <InteractiveWord word={data.goals[idx.goal]} onClick={() => setIdx(p=>({...p, goal: (p.goal+1)%data.goals.length}))} colorTheme={pastel.orange} />
                  </Typography>
                </motion.div>

                <motion.div variants={MOTION_VARIANTS.fadeInUp} initial="initial" animate="animate">
                  <Typography variant="h4" sx={{ 
                    fontWeight: 600, 
                    fontSize: { xs: "2rem", md: "2rem" }, 
                    color: "text.secondary",
                    textAlign: { xs: "center", md: "left" },
                    lineHeight: 1.5
                  }}>
                    Làm chủ <InteractiveWord word={data.subjects[idx.sub]} onClick={() => setIdx(p=>({...p, sub: (p.sub+1)%data.subjects.length}))} colorTheme={pastel.blue} /> cùng với <InteractiveWord word={data.tutors[idx.tutor]} onClick={() => setIdx(p=>({...p, tutor: (p.tutor+1)%data.tutors.length}))} colorTheme={pastel.purple} />.
                  </Typography>
                </motion.div>
              </Stack>
            </Grid>
          </Grid>

          {/* PHẦN 2: HƯỚNG DẪN VÀ CTA - CĂN GIỮA TUYỆT ĐỐI DƯỚI CẢ HAI */}
          <Stack spacing={4} alignItems="center" sx={{ width: "100%" }}>
            <motion.div variants={MOTION_VARIANTS.fadeInUp} initial="initial" animate="animate" style={{ width: "100%", display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ 
                maxWidth: "880px",
                py: 2, px: 3, borderRadius: "15px",
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                display: "flex", alignItems: "center", gap: 2,
                justifyContent: "center"
              }}>
                <TouchAppRoundedIcon color="info" />
                <Typography variant="body1" sx={{ color: "info.main", fontWeight: 700, textAlign: "center" }}>
                  Julie Academy đồng hành dựa trên năng lực của bạn — Chạm vào từ khóa để bắt đầu
                </Typography>
              </Box>
            </motion.div>

            <Button
              variant="contained" 
              onClick={() => navigate("/login")}
              endIcon={<RocketLaunchRoundedIcon />}
              sx={{
                borderRadius: "20px", px: { xs: 6, md: 12 }, py: 2.5, 
                fontSize: { xs: "2rem", md: "2rem" }, fontWeight: 700,
                bgcolor: "text.primary", color: "background.paper",
                boxShadow: `0 20px 40px ${alpha(theme.palette.text.primary, 0.2)}`,
                "&:hover": { bgcolor: "primary.main", transform: "translateY(-5px)" },
                transition: "all 0.3s ease"
              }}
            >
              Kích hoạt lộ trình bứt phá
            </Button>
          </Stack>

        </Stack>
      </Container>
    </StyledSectionWrapper>
  );
});
const ContentSection = React.memo(({ imgSrc, imgAlt, title, content, direction }) => (
  <Container maxWidth="lg" sx={{ my: 4 }}>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, alignItems: "center", gap: 6 }}>
      <Box sx={{ order: { xs: 2, md: direction === "row" ? 1 : 2 } }}>
        <ContentDisplayCard elevation={0}>
          <Typography variant="h4" fontWeight={700} mb={2}>{title}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>{content}</Typography>
        </ContentDisplayCard>
      </Box>
      <Box sx={{ order: { xs: 1, md: direction === "row" ? 2 : 1 } }}>
        <StyledImageBox>
          <img src={imgSrc} alt={imgAlt} loading="lazy" />
        </StyledImageBox>
      </Box>
    </Box>
  </Container>
));

export default function HomePage({ mode, toggleMode }) {
const PAGE_SECTIONS = useMemo(() => [
    { 
      type: "content", 
      imgSrc: homepage1, 
      imgAlt: "Method", 
      title: "Đánh thức tiềm năng vô hạn", 
      content: "Không chỉ dừng lại ở những con số và lý thuyết khô khan, Julie Academy mang đến một hệ sinh thái học tập tương tác đa chiều. Chúng tôi giúp bạn nắm bắt bản chất vấn đề một cách tự nhiên, biến những kiến thức phức tạp thành những trải nghiệm thú vị và khắc sâu vào tư duy.", 
      direction: "row" 
    },
    { type: "features" },
    { 
      type: "content", 
      imgSrc: homepage2, 
      imgAlt: "Journey", 
      title: "Lộ trình riêng biệt - Thành công khác biệt", 
      content: "Mỗi học sinh là một cá thể duy nhất với những thế mạnh riêng. Tại đây, chúng tôi không chỉ cung cấp bài giảng, mà còn là người bạn đồng hành thấu hiểu, theo sát từng bước ngoặt trong hành trình chinh phục tri thức, giúp bạn tự tin vượt qua mọi rào cản để chạm đến mục tiêu cao nhất.", 
      direction: "row-reverse" 
    },
    { 
      type: "content", 
      imgSrc: homepage3, 
      imgAlt: "Connect", 
      title: "Gắn kết tri thức trong kỷ nguyên số", 
      content: "Chúng tôi xóa nhòa khoảng cách giữa giáo viên và học sinh bằng môi trường kết nối thông minh. Sự tương tác liên tục, phản hồi kịp thời và tinh thần cùng nhau tiến bộ chính là chìa khóa giúp bạn không bao giờ cảm thấy đơn độc trên con đường học thuật đầy thử thách.", 
      direction: "row" 
    },
  ], []);

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
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "0.75fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
                  {FEATURES.map((f) => <Card key={f.title} {...f} />)}
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