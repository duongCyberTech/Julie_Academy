import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
  Tooltip
} from "@mui/material";
import {
  CameraAlt,
  Save,
  Email,
  CloudUpload,
  AdminPanelSettings,
  Security,
  GppGood,
  Fingerprint,
  InfoOutlined
} from "@mui/icons-material";
import "../student/Profile.css"; // Dùng chung CSS

const AdminProfilePage = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [savedUser, setSavedUser] = useState({
    fname: "", mname: "", lname: "",
    email: "", role: "",
    avata_url: "", createAt: "",
    uid: "" // Admin cần hiển thị UID để thể hiện tính kỹ thuật
  });

  const [formData, setFormData] = useState({
    fname: "", mname: "", lname: ""
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const API_URL = "http://localhost:4000";
  const token = localStorage.getItem("token");

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

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

        // Admin dùng bảng User gốc, không có bảng phụ
        setSavedUser(data);
        setFormData({
          fname: data.fname || "",
          mname: data.mname || "",
          lname: data.lname || ""
        });

        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải thông tin:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, token]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToast({ open: true, message: "Ảnh quá lớn (Max 5MB)", severity: "warning" });
      return;
    }

    const decoded = jwtDecode(token);
    const userId = decoded.sub || decoded.uid;
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
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

      if (res.data) {
        const newAvatarUrl = res.data.avata_url || URL.createObjectURL(file);
        setSavedUser(prev => ({ ...prev, avata_url: newAvatarUrl }));
        setToast({ open: true, message: "Cập nhật ảnh quản trị viên thành công!", severity: "success" });
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
        fname: formData.fname,
        mname: formData.mname,
        lname: formData.lname
      };

      await axios.patch(`${API_URL}/users/${userId}`, payload, getAuthConfig());

      setSavedUser(prev => ({ ...prev, ...formData }));
      setToast({ open: true, message: "Cập nhật thông tin thành công!", severity: "success" });
    } catch (error) {
      setToast({ open: true, message: "Cập nhật thất bại.", severity: "error" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container" style={{ alignItems: "center" }}>
        <CircularProgress />
      </div>
    );
  }

  const displayAvatar = savedUser.avata_url || "https://via.placeholder.com/150";

  return (
    <div className="profile-container">
      <div className="profile-content">
        
        {/* === CỘT TRÁI: THẺ ĐỊNH DANH (Theme Đỏ/Xám - Quyền lực) === */}
        <div className="left-panel card" style={{ background: "linear-gradient(to bottom, #fef2f2, #f3f4f6)" }}>
          <div className="avatar-wrapper">
            <img
              src={displayAvatar}
              alt="Avatar"
              className="avatar-img"
              style={{ borderColor: "#dc2626" }} // Viền đỏ quyền lực
              onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
            />
            <button className="camera-btn" onClick={() => setShowAvatarModal(true)} style={{ background: "#dc2626", borderColor: "white" }}>
              <CameraAlt fontSize="small" />
            </button>
          </div>

          <h2 className="user-fullname">
            {savedUser.lname} {savedUser.mname} {savedUser.fname}
          </h2>
          
          <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip 
              label="QUẢN TRỊ VIÊN" 
              style={{ backgroundColor: "#dc2626", color: "white", fontWeight: "bold", paddingLeft: "5px" }}
              icon={<AdminPanelSettings style={{ color: "white", fontSize: 18 }} />}
            />
            <Chip 
              label="Root Access" 
              variant="outlined"
              style={{ borderColor: "#4b5563", color: "#4b5563", fontWeight: "600" }}
              icon={<Security style={{ color: "#4b5563", fontSize: 16 }} />}
              size="small"
            />
          </div>

          {/* Phần thông tin cơ bản - Căn chỉnh giống Tutor/Parent */}
          <div className="basic-info" style={{ alignItems: 'flex-start', textAlign: 'left', width: '100%', paddingLeft: '10%' }}>
            
            <div className="info-item" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <Email fontSize="small" style={{ color: "#dc2626" }} /> 
              <span style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>{savedUser.email}</span>
            </div>
            
            <div className="info-item" style={{ width: '100%', justifyContent: 'flex-start', color: '#15803d' }}>
              <GppGood fontSize="small" /> 
              <span style={{ fontWeight: 500 }}>Tài khoản bảo mật</span>
            </div>

          </div>

          {/* UID - Thông số kỹ thuật cho Admin */}
          <div style={{ 
              marginTop: '20px', 
              padding: '10px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#4b5563',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
          }}>
              <Fingerprint fontSize="small" />
              UID: {savedUser.uid ? `${savedUser.uid.substring(0, 15)}...` : 'N/A'}
          </div>
        </div>

        {/* === CỘT PHẢI: FORM CHỈNH SỬA === */}
        <div className="right-panel card">
          <div className="panel-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3>Thông Tin Quản Trị</h3>
                    <p>Quản lý thông tin định danh hệ thống.</p>
                </div>
                <Security style={{ fontSize: 40, color: '#9ca3af', opacity: 0.5 }} />
            </div>
          </div>

          <div className="form-grid">
            {/* Hàng tên */}
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

            {/* Email Read-only */}
            <div className="form-group full-width">
              <label>Email đăng nhập</label>
              <div style={{ position: 'relative' }}>
                <input type="email" value={savedUser.email || ""} disabled className="input-disabled" style={{ paddingLeft: '40px' }} />
                <Email style={{ position: "absolute", left: "12px", top: "12px", color: "#9ca3af", fontSize: "20px" }} />
              </div>
            </div>

            {/* System Info Read-only */}
            <div className="form-group">
               <label>Vai trò hệ thống</label>
               <input type="text" value="Super Admin" disabled className="input-disabled" style={{ fontWeight: 'bold', color: '#dc2626' }} />
            </div>

            <div className="form-group">
               <label>Ngày gia nhập</label>
               <input 
                  type="text" 
                  value={savedUser.createAt ? new Date(savedUser.createAt).toLocaleDateString("vi-VN") : "N/A"} 
                  disabled 
                  className="input-disabled" 
               />
            </div>
          </div>

          <div className="action-buttons">
            <button 
                className="btn-save" 
                onClick={handleSave} 
                disabled={updating}
                style={{ 
                    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)", 
                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)" 
                }}
            >
              {updating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Save fontSize="small" />
              )}
              {updating ? " Đang cập nhật..." : " Lưu Thay Đổi"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Upload giống Student/Tutor */}
      {showAvatarModal && (
        <div className="modal-overlay" onClick={() => setShowAvatarModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#dc2626' }}>Ảnh Hồ Sơ Admin</h3>
            
            <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'left', border: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#334155', fontWeight: 600 }}>
                    <InfoOutlined fontSize="small" color="error"/> Lưu ý:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                    <li>Dùng ảnh chân dung rõ mặt.</li>
                    <li>Định dạng: <strong>JPEG, PNG</strong> (Max 5MB).</li>
                </ul>
            </div>

            <div className="modal-actions">
              <label htmlFor="file-upload" className="btn-upload" style={{ backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
                <CloudUpload fontSize="small" style={{ marginRight: '5px' }}/> Chọn ảnh
              </label>
              <input id="file-upload" type="file" accept="image/*" hidden onChange={handleFileChange} />
              <button className="btn-close" onClick={() => setShowAvatarModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminProfilePage;