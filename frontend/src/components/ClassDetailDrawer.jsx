import React from "react";
import { jwtDecode } from "jwt-decode";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Button,
  Divider,
  Stack,
  Paper,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Close,
  CalendarToday,
  AccessTime,
  School,
  Star,
  MenuBook,
  ClassOutlined,
  Phone,
  InfoOutlined,
} from "@mui/icons-material";
import dayjs from "dayjs";

const getDayName = (num) => {
  const days = {
    2: "Thứ 2",
    3: "Thứ 3",
    4: "Thứ 4",
    5: "Thứ 5",
    6: "Thứ 6",
    7: "Thứ 7",
    8: "Chủ Nhật",
    1: "Chủ Nhật",
    0: "Chủ Nhật",
  };
  return days[num] || "Chưa xếp lịch";
};

const ClassDetailDrawer = ({ open, onClose, classData, onEnrollClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!classData) return null;

  const {
    classname,
    description,
    subject,
    grade,
    status,
    nb_of_student,
    startat,
    tutor,
    schedule,
    learning,
  } = classData;
  const tutorUser = tutor?.user || {};

  let enrollmentStatus = null;
  let isParent = false;

  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const currentUid = decoded.sub || decoded.uid || decoded.userId;
      const role = decoded.role;

      if (role === "parents") {
        isParent = true;
      } else if (role === "student") {
        const myRecord = learning?.find(
          (l) =>
            l.student?.user?.uid === currentUid ||
            l.student?.uid === currentUid ||
            l.student_uid === currentUid,
        );
        if (myRecord) {
          enrollmentStatus = myRecord.status;
        }
      }
    } catch (e) {
      console.error("Token decode error in drawer", e);
    }
  }

  const renderActionButton = () => {
    if (status === "completed" || status === "cancelled") {
      return (
        <Button
          variant="contained"
          disabled
          fullWidth
          sx={{ py: 1.5, borderRadius: "12px", fontWeight: 700 }}
        >
          Lớp đã đóng
        </Button>
      );
    }
    if (enrollmentStatus === "pending") {
      return (
        <Button
          variant="outlined"
          disabled
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: "12px",
            fontWeight: 700,
            borderColor: "warning.main",
            color: "warning.main",
          }}
        >
          Đang chờ duyệt...
        </Button>
      );
    }
    if (enrollmentStatus === "accepted") {
      return (
        <Button
          variant="contained"
          disabled
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: "12px",
            fontWeight: 700,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: "success.main",
          }}
        >
          Đã tham gia lớp này
        </Button>
      );
    }
    return (
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={() => onEnrollClick(classData)}
        sx={{
          py: 1.5,
          fontSize: "1rem",
          fontWeight: 700,
          borderRadius: "12px",
          boxShadow: isDark
            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            : "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {"Đăng ký"}
      </Button>
    );
  };

  const infoCardSx = {
    p: 2.5,
    borderRadius: "16px",
    border: "1px solid",
    borderColor: isDark ? theme.palette.midnight?.border : "divider",
    backgroundColor: isDark
      ? alpha(theme.palette.background.default, 0.4)
      : alpha(theme.palette.primary.main, 0.02),
    transition: "all 0.3s",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: isDark
        ? `0 0 16px ${alpha(theme.palette.primary.main, 0.08)}`
        : "0px 8px 20px rgba(0,0,0,0.04)",
      borderColor: "primary.main",
    },
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", md: 450 },
          p: 0,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
          borderLeft: `1px solid ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
        },
      }}
    >
      {/* HEADER DRAWER */}
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid",
          borderColor: isDark ? theme.palette.midnight?.border : "divider",
          bgcolor: isDark
            ? alpha(theme.palette.background.paper, 0.8)
            : alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Chip
              label={status === "pending" ? "Đang tuyển sinh" : "Đang diễn ra"}
              color={status === "pending" ? "success" : "primary"}
              size="small"
              sx={{
                mb: 1.5,
                fontWeight: 700,
                borderRadius: "8px",
                bgcolor: alpha(
                  theme.palette[status === "pending" ? "success" : "primary"]
                    .main,
                  0.1,
                ),
                color: `${status === "pending" ? "success" : "primary"}.main`,
              }}
            />
            <Typography
              variant="h5"
              fontWeight="bold"
              color="text.primary"
              sx={{ lineHeight: 1.3 }}
            >
              {classname}
            </Typography>
            <Stack direction="row" spacing={1} mt={1.5}>
              <Chip
                icon={<MenuBook fontSize="small" />}
                label={subject}
                size="small"
                variant="outlined"
                sx={{ borderRadius: "8px", fontWeight: 600 }}
              />
              <Chip
                icon={<ClassOutlined fontSize="small" />}
                label={`Khối ${grade}`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: "8px", fontWeight: 600 }}
              />
            </Stack>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: alpha(theme.palette.text.secondary, 0.1),
              "&:hover": { bgcolor: alpha(theme.palette.text.secondary, 0.2) },
            }}
          >
            <Close />
          </IconButton>
        </Stack>
      </Box>

      {/* BODY DRAWER */}
      <Box
        sx={{
          p: 3,
          overflowY: "auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(theme.palette.text.secondary, 0.2),
            borderRadius: "10px",
            "&:hover": {
              backgroundColor: alpha(theme.palette.text.secondary, 0.4),
            },
          },
        }}
      >
        {/* LỊCH HỌC */}
        <Paper elevation={0} sx={infoCardSx}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "primary.main",
            }}
          >
            <CalendarToday fontSize="small" /> Lịch học chi tiết
          </Typography>

          <Typography
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1.5,
              color: "text.secondary",
            }}
          >
            <strong>Khai giảng:</strong>{" "}
            <Chip
              size="small"
              label={
                startat ? dayjs(startat).format("DD/MM/YYYY") : "Chưa cập nhật"
              }
              sx={{
                bgcolor: "background.paper",
                fontWeight: 600,
                border: "1px solid",
                borderColor: "divider",
              }}
            />
          </Typography>

          <Divider
            sx={{ my: 1.5, borderStyle: "dashed", borderColor: "divider" }}
          />

          {schedule && schedule.length > 0 ? (
            <Stack spacing={1.5}>
              {schedule.map((slot) => (
                <Box
                  key={slot.schedule_id || Math.random()}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "background.paper",
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography fontWeight="700" color="text.primary">
                    {getDayName(
                      slot.meeting_date ?? slot.day ?? slot.day_of_week,
                    )}
                  </Typography>
                  <Chip
                    icon={<AccessTime fontSize="small" />}
                    label={`${slot.startAt || slot.startTime || ""} - ${slot.endAt || slot.endTime || ""}`}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                      fontWeight: 700,
                      borderRadius: "8px",
                      border: "none",
                    }}
                  />
                </Box>
              ))}
            </Stack>
          ) : (
            <Box
              sx={{
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography
                variant="body2"
                fontStyle="italic"
                color="text.secondary"
              >
                Chưa có lịch học cụ thể.
              </Typography>
            </Box>
          )}
        </Paper>

        {/* THÔNG TIN GIA SƯ */}
        <Paper
          elevation={0}
          sx={{
            ...infoCardSx,
            "&:hover": {
              ...infoCardSx["&:hover"],
              borderColor: "success.main",
            },
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            gutterBottom
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "success.main",
              mb: 2,
            }}
          >
            <School fontSize="small" /> Thông tin Gia sư
          </Typography>

          <Box sx={{ display: "flex", gap: 2.5, alignItems: "center", mb: 2 }}>
            <Avatar
              src={tutorUser.avata_url}
              sx={{
                width: 64,
                height: 64,
                border: "2px solid",
                borderColor: alpha(theme.palette.success.main, 0.2),
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: "success.main",
                fontWeight: 700,
              }}
            >
              {tutorUser.lname?.charAt(0)}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="text.primary"
              >
                {[tutorUser.lname, tutorUser.mname, tutorUser.fname]
                  .filter(Boolean)
                  .join(" ")}
              </Typography>
              {tutor?.phone_number && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 0.5, mt: 0.5 }}
                >
                  <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    color="text.secondary"
                  >
                    {tutor.phone_number}
                  </Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                <Star
                  sx={{ fontSize: 16, color: theme.palette.warning.main }}
                />
                <Typography
                  variant="caption"
                  fontWeight="600"
                  color="warning.main"
                >
                  Gia sư uy tín
                </Typography>
              </Stack>
            </Box>
          </Box>

          {/* Kinh nghiệm và giới thiệu */}
          {tutor?.experiences && (
            <Box
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.05),
                p: 2,
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha(theme.palette.success.main, 0.1),
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "pre-line",
                  color: isDark ? "success.light" : "success.dark",
                  lineHeight: 1.6,
                }}
              >
                <Typography
                  component="span"
                  fontWeight="bold"
                  display="block"
                  mb={0.5}
                >
                  Giới thiệu & Kinh nghiệm:
                </Typography>
                {tutor.experiences}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* MÔ TẢ LỚP HỌC */}
        <Paper
          elevation={0}
          sx={{
            ...infoCardSx,
            "&:hover": { ...infoCardSx["&:hover"], borderColor: "info.main" },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "info.main",
              }}
            >
              <InfoOutlined fontSize="small" /> Mô tả
            </Typography>

            <Chip
              label={
                <span>
                  Sĩ số: <strong>{nb_of_student}</strong>
                </span>
              }
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: "info.main",
                fontWeight: 500,
                borderRadius: 1.5,
              }}
            />
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ lineHeight: 1.6 }}
          >
            {description ||
              "Giáo viên chưa cập nhật mô tả chi tiết cho lớp học này."}
          </Typography>
        </Paper>
      </Box>

      {/* FOOTER ACTION */}
      <Box
        sx={{
          p: 2.5,
          borderTop: "1px solid",
          borderColor: isDark ? theme.palette.midnight?.border : "divider",
          bgcolor: isDark
            ? alpha(theme.palette.background.paper, 0.9)
            : "background.paper",
        }}
      >
        {renderActionButton()}
      </Box>
    </Drawer>
  );
};

export default ClassDetailDrawer;
