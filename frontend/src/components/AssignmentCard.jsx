import React, { memo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import ClassIcon from "@mui/icons-material/Class";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import AlarmOnIcon from "@mui/icons-material/AlarmOn";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";

const AssignmentCard = memo(
  ({ session, status, onStart, onContinue, onView, isGlobal }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const { exam, expireAt, startAt, limit_taken, pending_et_id, examTakens } =
      session;

    const classNames =
      session.exam_open_in && session.exam_open_in.length > 0
        ? session.exam_open_in.map((item) => item.classname).join(", ")
        : "Chưa xếp lớp";

    const attempts = examTakens ? examTakens.length : 0;
    const completedAttempts = examTakens
      ? examTakens.filter((et) => et.isDone)
      : [];
    const highestScore =
      completedAttempts.length > 0
        ? Math.max(...completedAttempts.map((et) => et.final_score))
        : null;

    const statusConfig = {
      upcoming: {
        color: "info",
        label: "Sắp mở",
        border: theme.palette.info.main,
      },
      todo: pending_et_id
        ? {
            color: "warning",
            label: "Đang làm dở",
            border: theme.palette.warning.main,
          }
        : {
            color: "primary",
            label: "Cần làm",
            border: theme.palette.primary.main,
          },
      overdue: {
        color: "error",
        label: "Quá hạn",
        border: theme.palette.error.main,
      },
      completed: pending_et_id
        ? {
            color: "secondary",
            label: "Đang làm lại",
            border: theme.palette.secondary.main,
          }
        : {
            color: "success",
            label: "Hoàn thành",
            border: theme.palette.success.main,
          },
    };

    const currentStatus = statusConfig[status];
    const formatShortDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} - ${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;
    };

    const displayScore =
      highestScore !== null
        ? Number(highestScore)
            .toFixed(2)
            .replace(/\.00$/, "")
            .replace(/(\.[1-9])0$/, "$1")
        : null;
    const isPassed = highestScore !== null && highestScore >= 5;

    return (
      <Card
        elevation={0}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          border: `1px solid ${isDark ? theme.palette.midnight?.border : alpha(theme.palette.divider, 0.8)}`,
          borderTop: `4px solid ${currentStatus.border}`,
          backgroundColor: theme.palette.background.paper,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: isDark
              ? `0 8px 24px ${alpha(theme.palette[currentStatus.color].main, 0.15)}`
              : "0 12px 32px rgba(0,0,0,0.08)",
          },
        }}
      >
        <CardContent
          sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          {/* Header Title & Status */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 1.5,
              gap: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                lineHeight: 1.3,
                fontSize: "1.1rem",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {exam.title}
            </Typography>
            <Chip
              label={currentStatus.label}
              color={currentStatus.color}
              size="small"
              sx={{ fontWeight: 700, borderRadius: "8px", px: 1 }}
            />
          </Box>

          {isGlobal && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "primary.main",
                mb: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                p: 1,
                borderRadius: "8px",
                width: "fit-content",
              }}
            >
              <ClassIcon sx={{ fontSize: 18, mr: 1 }} />
              <Typography variant="body2" fontWeight={600}>
                {classNames}
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={2} mb={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 18, mr: 0.5 }} />
              <Typography variant="body2" fontWeight={600}>
                {exam.duration} phút
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <QuestionMarkIcon sx={{ fontSize: 18, mr: 0.5 }} />
              <Typography variant="body2" fontWeight={600}>
                {exam.total_ques} câu
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <FactCheckIcon sx={{ fontSize: 18, mr: 0.5 }} />
              <Typography variant="body2" fontWeight={600}>
                {attempts}/{limit_taken} lần
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          {/* Khối Điểm số & Hạn chót */}
          <Box
            sx={{
              mt: 2,
              borderTop: `1px dashed ${isDark ? theme.palette.midnight?.border : theme.palette.divider}`,
              pt: 2,
            }}
          >
            {highestScore !== null ? (
              <Box sx={{ mb: 2 }}>
                {/* Box hiển thị điểm */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    borderRadius: "8px",
                    bgcolor: isPassed
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.error.main, 0.1),
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={isPassed ? "success.main" : "error.main"}
                  >
                    ĐIỂM ĐẠT ĐƯỢC:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: isPassed ? "success.main" : "error.main",
                    }}
                  >
                    <EmojiEventsRoundedIcon sx={{ mr: 0.5, fontSize: 24 }} />
                    <Typography variant="h6" fontWeight={700}>
                      {displayScore} / 10
                    </Typography>
                  </Box>
                </Box>

                {!isPassed && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      mt: 1,
                      p: 1.2,
                      borderRadius: "8px",
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: "warning.dark",
                    }}
                  >
                    <LightbulbOutlinedIcon
                      sx={{ fontSize: 20, mr: 1, mt: -0.2 }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{ lineHeight: 1.4 }}
                    >
                      Chưa đạt rồi! Bạn nhớ xem lại kiến thức phần này để cải
                      thiện nhé.
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  p: 1.2,
                  borderRadius: "8px",
                  bgcolor:
                    status === "overdue"
                      ? alpha(theme.palette.error.main, 0.1)
                      : alpha(theme.palette.warning.main, 0.1),
                  color: status === "overdue" ? "error.main" : "warning.dark",
                }}
              >
                {status === "upcoming" ? (
                  <AlarmOnIcon sx={{ mr: 1 }} />
                ) : (
                  <EventBusyIcon sx={{ mr: 1 }} />
                )}
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    display="block"
                    sx={{ lineHeight: 1 }}
                  >
                    {status === "upcoming" ? "MỞ VÀO LÚC:" : "HẠN NỘP BÀI:"}
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formatShortDate(
                      status === "upcoming" ? startAt : expireAt,
                    )}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Các nút bấm */}
            <Stack direction="row" spacing={1.5}>
              {(status === "todo" || status === "completed") &&
                !pending_et_id &&
                attempts < limit_taken && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => onStart(session)}
                    endIcon={<PlayArrowRoundedIcon />}
                    sx={{ borderRadius: "10px", fontWeight: 700, py: 1 }}
                  >
                    {attempts === 0 ? "Bắt Đầu Làm" : "Làm Lại Lần Nữa"}
                  </Button>
                )}

              {pending_et_id && (
                <Button
                  fullWidth
                  variant="contained"
                  color={status === "completed" ? "secondary" : "warning"}
                  onClick={() => onContinue(pending_et_id)}
                  endIcon={<PlayArrowRoundedIcon />}
                  sx={{
                    borderRadius: "10px",
                    fontWeight: 700,
                    py: 1,
                    color: status === "todo" ? "#000" : "#fff",
                  }}
                >
                  Tiếp Tục Bài Dở
                </Button>
              )}

              {highestScore !== null && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  onClick={() => onView(session)}
                  sx={{
                    borderRadius: "10px",
                    fontWeight: 700,
                    py: 1,
                    borderWidth: 2,
                    "&:hover": { borderWidth: 2 },
                  }}
                >
                  Xem Chi Tiết
                </Button>
              )}
            </Stack>
          </Box>
        </CardContent>
      </Card>
    );
  },
);

export default AssignmentCard;
