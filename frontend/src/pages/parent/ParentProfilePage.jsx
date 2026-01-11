import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
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
import "../student/Profile.css"; 

const ParentProfilePage = () => {
  const navigate = useNavigate();

  const [savedUser, setSavedUser] = useState({
    fname: "", mname: "", lname: "",
    email: "", role: "",
    avata_url: "", createAt: "",
    phone_number: "" 
  });

  const [formData, setFormData] = useState({
    fname: "", mname: "", lname: "",
    phone_number: ""
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

        // Lấy số điện thoại từ bảng parents hoặc root (tuỳ backend trả về)
        const phoneVal = data.parents?.phone_number || data.phone_number || "";

        const fullData = { ...data, phone_number: phoneVal };
        setSavedUser(fullData);
        setFormData({
          fname: data.fname || "",
          mname: data.mname || "",
          lname: data.lname || "",
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
        fname: formData.fname,
        mname: formData.mname,
        lname: formData.lname,
        phone_number: formData.phone_number
      };

      await axios.patch(`${API_URL}/users/${userId}`, payload, getAuthConfig());

      setSavedUser(prev => ({
        ...prev,
        ...formData
      }));

      setToast({ open: true, message: "Cập nhật hồ sơ thành công!", severity: "success" });
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