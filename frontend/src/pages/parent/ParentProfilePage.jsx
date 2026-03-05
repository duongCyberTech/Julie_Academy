<<<<<<< HEAD
import React, { useState, useCallback, useEffect, useMemo } from "react";
=======
import React, { useState, useEffect } from "react";
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
<<<<<<< HEAD
  Box, Typography, Paper, CircularProgress, Alert, Snackbar,
  Avatar, Button, TextField, Chip, Divider, IconButton, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Stack, Grid
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";

import {
  CameraAlt as CameraAltIcon,
  SaveOutlined as SaveOutlinedIcon,
  EmailOutlined as EmailOutlinedIcon,
  PhoneOutlined as PhoneOutlinedIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  FamilyRestroom as FamilyRestroomIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";

// 1. CHUẨN WRAPPER TỰ ĐỘNG GIÃN TRANG
const PageWrapper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(4),
  backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.paper,
  borderRadius: '24px',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
  minHeight: 'calc(100vh - 120px)',
  display: 'flex',
  flexDirection: 'column',
}));

// Cover Image mỏng phía trên Avatar (Màu cam dành cho Phụ huynh)
const CoverBackground = styled(Box)(({ theme }) => ({
  height: 120,
  background: `linear-gradient(135deg, #fdba74, #ea580c)`,
  borderTopLeftRadius: theme.shape.borderRadius * 2,
  borderTopRightRadius: theme.shape.borderRadius * 2,
  position: 'relative',
}));

export default function ParentProfilePage() {
=======
  Snackbar,
  Alert,
  CircularProgress,
  Chip
} from "@mui/material";
import {
  CameraAlt,
  Save,
  Email,
  Phone,
  CloudUpload,
  InfoOutlined,
  FamilyRestroom
} from "@mui/icons-material";
import "../student/Profile.css"; // Dùng chung file CSS

const ParentProfilePage = () => {
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
  const navigate = useNavigate();

  // --- STATE ---
  const [savedUser, setSavedUser] = useState({
    fname: "", mname: "", lname: "",
    email: "", role: "",
    avata_url: "", createAt: "",
<<<<<<< HEAD
    phone_number: ""
=======
    phone_number: "" // Trường quan trọng nhất của Phụ huynh
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
  });

  const [formData, setFormData] = useState({
    fname: "", mname: "", lname: "",
<<<<<<< HEAD
    phone_number: "",
=======
    phone_number: ""
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const API_URL = "http://localhost:4000";
  const token = localStorage.getItem("token");

<<<<<<< HEAD
  const getAuthConfig = useCallback(() => ({
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);
=======
  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      let userId = null;
      if (token) {
        try {
          const decoded = jwtDecode(token);
          userId = decoded.sub || decoded.uid;
        } catch (error) {}
      }

      if (!token || !userId) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/${userId}`, getAuthConfig());
        const data = response.data;

<<<<<<< HEAD
=======
        // Lấy số điện thoại từ bảng parents hoặc root (tuỳ backend trả về)
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        const phoneVal = data.parents?.phone_number || data.phone_number || "";

        const fullData = { ...data, phone_number: phoneVal };
        setSavedUser(fullData);
        setFormData({
          fname: data.fname || "",
          mname: data.mname || "",
          lname: data.lname || "",
<<<<<<< HEAD
          phone_number: phoneVal,
        });
      } catch (error) {
        setToast({ open: true, message: "Lỗi tải thông tin.", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, token, getAuthConfig]);

  // Tính toán độ hoàn thiện hồ sơ (Mỗi mục chiếm % nhất định)
  const profileCompleteness = useMemo(() => {
    let score = 0;
    if (savedUser.fname || savedUser.lname) score += 30;
    if (savedUser.email) score += 30;
    if (savedUser.phone_number) score += 40;
    return score;
  }, [savedUser]);
=======
          phone_number: phoneVal
        });

        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải thông tin:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, token]);
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
<<<<<<< HEAD
    if (file.size > 5 * 1024 * 1024) {
        setToast({ open: true, message: "Ảnh quá lớn (Max 5MB)", severity: "warning" });
        return;
=======

    if (file.size > 5 * 1024 * 1024) {
      setToast({ open: true, message: "Ảnh quá lớn (Max 5MB)", severity: "warning" });
      return;
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    }

    const decoded = jwtDecode(token);
    const userId = decoded.sub || decoded.uid;
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
<<<<<<< HEAD
      const res = await axios.post(`${API_URL}/users/${userId}/avatar`, uploadData, {
        headers: { ...getAuthConfig().headers, "Content-Type": "multipart/form-data" },
      });
=======
      const res = await axios.post(
        `${API_URL}/users/${userId}/avatar`,
        uploadData,
        {
          headers: {
            ...getAuthConfig().headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
      if (res.data) {
        const newAvatarUrl = res.data.avata_url || URL.createObjectURL(file);
        setSavedUser(prev => ({ ...prev, avata_url: newAvatarUrl }));
        setToast({ open: true, message: "Đổi ảnh đại diện thành công!", severity: "success" });
        setShowAvatarModal(false);
      }
    } catch (error) {
      setToast({ open: true, message: "Lỗi upload ảnh.", severity: "error" });
    }
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      const decoded = jwtDecode(token);
      const userId = decoded.sub || decoded.uid;

      const payload = {
<<<<<<< HEAD
        fname: formData.fname, mname: formData.mname, lname: formData.lname,
=======
        fname: formData.fname,
        mname: formData.mname,
        lname: formData.lname,
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
        phone_number: formData.phone_number
      };

      await axios.patch(`${API_URL}/users/${userId}`, payload, getAuthConfig());
<<<<<<< HEAD
      setSavedUser(prev => ({ ...prev, ...formData }));
      setToast({ open: true, message: "Cập nhật hồ sơ thành công!", severity: "success" });
    } catch (error) {
      setToast({ open: true, message: "Cập nhật thất bại. Vui lòng thử lại.", severity: "error" });
=======

      setSavedUser(prev => ({
        ...prev,
        ...formData
      }));

      setToast({ open: true, message: "Cập nhật hồ sơ thành công!", severity: "success" });
    } catch (error) {
      setToast({ open: true, message: "Cập nhật thất bại.", severity: "error" });
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
<<<<<<< HEAD
      <PageWrapper sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#ea580c' }} />
      </PageWrapper>
    );
  }

  const displayAvatar = savedUser.avata_url || "";

  return (
    <PageWrapper>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" color="text.primary">Hồ sơ Phụ huynh</Typography>
        <Typography variant="body2" color="text.secondary">Quản lý thông tin cá nhân và phương thức liên lạc để giáo viên cập nhật tình hình học tập.</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* ================================================= */}
        {/* CỘT TRÁI: MINI INFO & AVATAR */}
        {/* ================================================= */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', height: '100%', borderColor: 'divider' }}>
            <CoverBackground />
            
            <Box sx={{ px: 3, pb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: -7 }}>
              {/* Avatar kèm nút sửa */}
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton 
                    onClick={() => setShowAvatarModal(true)}
                    sx={{ 
                      bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'grey.100' }, width: 36, height: 36
                    }}
                  >
                    <CameraAltIcon fontSize="small" sx={{ color: '#ea580c' }} />
                  </IconButton>
                }
              >
                <Avatar 
                  src={displayAvatar} 
                  sx={{ 
                    width: 120, height: 120, border: '4px solid #fff', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', bgcolor: '#fed7aa', color: '#ea580c', fontSize: '3rem'
                  }}
                >
                  {savedUser.lname?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Badge>

              <Typography variant="h6" fontWeight="800" sx={{ mt: 2, textAlign: 'center' }}>
                {[savedUser.lname, savedUser.mname, savedUser.fname].filter(Boolean).join(" ")}
              </Typography>
              
              <Stack direction="row" spacing={1} mt={1} mb={3}>
                <Chip label="PHỤ HUYNH" sx={{ bgcolor: '#ea580c', color: 'white', fontWeight: 700 }} size="small" icon={<FamilyRestroomIcon sx={{ color: 'white !important' }}/>} />
              </Stack>

              {/* Progress Bar hoàn thiện hồ sơ */}
              <Box sx={{ width: '100%', mb: 4, p: 2, bgcolor: '#fff7ed', borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" fontWeight={700} color="#c2410c">Độ hoàn thiện hồ sơ</Typography>
                  <Typography variant="caption" fontWeight={700} color={profileCompleteness === 100 ? 'success.main' : '#ea580c'}>
                    {profileCompleteness}%
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={profileCompleteness} 
                  sx={{ 
                    height: 8, borderRadius: 4, bgcolor: '#ffedd5',
                    '& .MuiLinearProgress-bar': { bgcolor: profileCompleteness === 100 ? 'success.main' : '#ea580c' } 
                  }} 
                />
              </Box>

              {/* Thông tin liên hệ */}
              <Box sx={{ width: '100%', textAlign: 'left' }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>LIÊN HỆ</Typography>
                <Stack spacing={1.5} mt={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#fff7ed' }}><EmailOutlinedIcon fontSize="small" sx={{ color: '#ea580c' }} /></Avatar>
                    <Typography variant="body2" fontWeight={600} noWrap>{savedUser.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#fff7ed' }}><PhoneOutlinedIcon fontSize="small" sx={{ color: '#ea580c' }} /></Avatar>
                    <Typography variant="body2" fontWeight={600} color={savedUser.phone_number ? 'text.primary' : 'text.secondary'}>
                      {savedUser.phone_number || "Chưa cập nhật SĐT"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

            </Box>
          </Paper>
        </Grid>

        {/* ================================================= */}
        {/* CỘT PHẢI: FORM CHỈNH SỬA */}
        {/* ================================================= */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, borderColor: 'divider' }}>
            
            <Typography variant="h6" fontWeight="700" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlinedIcon sx={{ color: '#ea580c' }} /> Cập nhật thông tin
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Họ (Last Name)" name="lname" value={formData.lname} onChange={handleInputChange} size="medium" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Tên đệm (Middle Name)" name="mname" value={formData.mname} onChange={handleInputChange} size="medium" />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth label="Tên (First Name)" name="fname" value={formData.fname} onChange={handleInputChange} size="medium" />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth label="Email đăng nhập" value={savedUser.email || ""} disabled 
                  helperText="Email được dùng để đăng nhập và không thể thay đổi."
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth label="Số điện thoại liên hệ" name="phone_number" value={formData.phone_number} onChange={handleInputChange} 
                  placeholder="Ví dụ: 0912345678"
                  helperText="* Giáo viên sẽ ưu tiên liên hệ qua số điện thoại này."
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" size="large" 
                onClick={handleSave} disabled={updating}
                startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <SaveOutlinedIcon />}
                sx={{ px: 4, py: 1.5, borderRadius: '12px', bgcolor: '#ea580c', '&:hover': { bgcolor: '#c2410c' } }}
              >
                {updating ? "Đang lưu..." : "Lưu Thông Tin"}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ================================================= */}
      {/* DIALOG UPLOAD ẢNH */}
      {/* ================================================= */}
      <Dialog open={showAvatarModal} onClose={() => setShowAvatarModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center' }}>Cập Nhật Ảnh Đại Diện</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, bgcolor: '#fff7ed', borderRadius: 2, mb: 2, border: '1px dashed #fdba74' }}>
            <Typography variant="subtitle2" fontWeight={700} color="#c2410c" gutterBottom>Lưu ý định dạng:</Typography>
            <Typography variant="body2" color="text.secondary">• Hỗ trợ ảnh: JPEG, PNG</Typography>
            <Typography variant="body2" color="text.secondary">• Dung lượng tối đa: 5MB</Typography>
            <Typography variant="body2" color="text.secondary">• Nên dùng ảnh tỉ lệ vuông (1:1)</Typography>
          </Box>
          <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadOutlinedIcon />} sx={{ py: 1.5, borderStyle: 'dashed', color: '#ea580c', borderColor: '#ea580c' }}>
            Chọn ảnh từ máy tính
            <input type="file" accept="image/jpeg, image/png" hidden onChange={handleFileChange} />
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setShowAvatarModal(false)} color="inherit" sx={{ fontWeight: 600 }}>Hủy Bỏ</Button>
        </DialogActions>
      </Dialog>

      {/* TOAST THÔNG BÁO */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} variant="filled" sx={{ width: "100%", borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
}
=======
      <div className="profile-container" style={{ alignItems: "center" }}>
        <CircularProgress />
      </div>
    );
  }

  const displayAvatar = savedUser.avata_url || "https://via.placeholder.com/150";

  return (
    <div className="profile-container">
      <div className="profile-content">
        
        {/* === CỘT TRÁI: HIỂN THỊ THÔNG TIN (Theme Màu Cam) === */}
        <div className="left-panel card" style={{ background: "linear-gradient(to bottom, #fff7ed, #ffedd5)" }}>
          <div className="avatar-wrapper">
            <img
              src={displayAvatar}
              alt="Avatar"
              className="avatar-img"
              onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
            />
            <button className="camera-btn" onClick={() => setShowAvatarModal(true)} style={{ background: "#f97316", borderColor: "white" }}>
              <CameraAlt fontSize="small" />
            </button>
          </div>

          <h2 className="user-fullname">
            {savedUser.lname} {savedUser.mname} {savedUser.fname}
          </h2>
          
          <div style={{ marginTop: '10px' }}>
            <Chip 
              label="PHỤ HUYNH" 
              style={{ backgroundColor: "#f97316", color: "white", fontWeight: "bold" }}
              icon={<FamilyRestroom style={{ color: "white", fontSize: 18 }} />}
            />
          </div>

          {/* Sửa lỗi căn lề tại đây */}
          <div className="basic-info" style={{ alignItems: 'flex-start', textAlign: 'left', width: '100%', paddingLeft: '10%' }}>
            <div className="info-item" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <Email fontSize="small" style={{ color: "#f97316" }} /> 
              <span style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>{savedUser.email}</span>
            </div>
            
            {savedUser.phone_number ? (
                <div className="info-item" style={{ width: '100%', justifyContent: 'flex-start' }}>
                    <Phone fontSize="small" style={{ color: "#f97316" }} /> 
                    <span>{savedUser.phone_number}</span>
                </div>
            ) : (
                <div className="info-item" style={{ width: '100%', justifyContent: 'flex-start', color: '#9ca3af', fontStyle: 'italic' }}>
                    <Phone fontSize="small" /> 
                    <span>Chưa cập nhật SĐT</span>
                </div>
            )}
          </div>
        </div>

        {/* === CỘT PHẢI: FORM CHỈNH SỬA === */}
        <div className="right-panel card">
          <div className="panel-header">
            <h3>Hồ Sơ Phụ Huynh</h3>
            <p>Cập nhật thông tin liên lạc để nhận thông báo về tình hình học tập của con.</p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Họ (Last Name)</label>
              <input type="text" name="lname" value={formData.lname} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Tên đệm (Middle Name)</label>
              <input type="text" name="mname" value={formData.mname} onChange={handleInputChange} />
            </div>
            <div className="form-group full-width-mobile">
              <label>Tên (First Name)</label>
              <input type="text" name="fname" value={formData.fname} onChange={handleInputChange} />
            </div>

            <div className="form-group full-width">
              <label style={{ color: '#c2410c' }}>Số điện thoại</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 0987..."
                  style={{ paddingLeft: "40px", borderColor: '#fdba74' }}
                />
                <Phone style={{ position: "absolute", left: "12px", top: "12px", color: "#f97316", fontSize: "20px" }} />
              </div>
              <small style={{ color: '#9ca3af', marginTop: '4px' }}>* Giáo viên sẽ liên hệ với bạn qua số này khi cần thiết.</small>
            </div>

            <div className="form-group full-width">
              <label>Email (Tài khoản)</label>
              <input type="email" value={savedUser.email || ""} disabled className="input-disabled" />
            </div>
          </div>

          <div className="action-buttons">
            <button 
                className="btn-save" 
                onClick={handleSave} 
                disabled={updating}
                style={{ background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)" }}
            >
              {updating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Save fontSize="small" />
              )}
              {updating ? " Đang lưu..." : " Lưu Thông Tin"}
            </button>
          </div>
        </div>
      </div>

      {/* === MODAL UPLOAD ẢNH (Dùng code bạn cung cấp) === */}
      {showAvatarModal && (
        <div className="modal-overlay" onClick={() => setShowAvatarModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Thay Đổi Ảnh Đại Diện</h3>
            
            {/* Khu vực thông tin hướng dẫn */}
            <div style={{ 
                margin: '20px 0', 
                padding: '15px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px',
                textAlign: 'left',
                border: '1px dashed #cbd5e1'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#334155', fontWeight: 600 }}>
                    <InfoOutlined fontSize="small" color="primary"/> Lưu ý khi tải ảnh:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                    <li>Định dạng hỗ trợ: <strong>JPEG, PNG</strong></li>
                    <li>Dung lượng tối đa: <strong>5MB</strong></li>
                    <li>Nên dùng ảnh vuông để hiển thị đẹp nhất.</li>
                </ul>
            </div>

            <div className="modal-actions">
              <label htmlFor="file-upload" className="btn-upload" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CloudUpload fontSize="small"/> Chọn ảnh từ máy tính
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />

              <button className="btn-close" onClick={() => setShowAvatarModal(false)}>
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ParentProfilePage;
>>>>>>> fe8270f68b2d2783ea7b1ceb8cff470866f711d4
