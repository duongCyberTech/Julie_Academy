import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Snackbar,
  Alert,
  CircularProgress,
  
} from "@mui/material";
import {
  CameraAlt,
  Save,
  Email,
  CalendarToday,
  InfoOutlined,
  CloudUpload,
} from "@mui/icons-material";
import "./Profile.css"; // Giữ nguyên file CSS cũ
import SchoolIcon from "@mui/icons-material/School";
const StudentProfilePage = () => {
  const navigate = useNavigate();

  // --- STATE QUẢN LÝ ---
  
  // 1. savedUser: Dữ liệu "Đã lưu" - Dùng để hiển thị ở Cột Trái (Không đổi khi đang gõ)
  const [savedUser, setSavedUser] = useState({
    fname: "", mname: "", lname: "",
    email: "", username: "", role: "",
    avata_url: "", createAt: ""
  });

  // 2. formData: Dữ liệu "Đang nhập" - Dùng cho các ô Input ở Cột Phải
  const [formData, setFormData] = useState({
    fname: "", mname: "", lname: "",
    school: "", dob: ""
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  // --- CẤU HÌNH ---
  const API_URL = "http://localhost:4000";
  const token = localStorage.getItem("token");

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` },
  });

  // --- 1. FETCH DỮ LIỆU ---
  useEffect(() => {
    const fetchProfile = async () => {
      let userId = null;
      if (token) {
        try {
          const decoded = jwtDecode(token);
          userId = decoded.sub || decoded.uid;
        } catch (error) {
          console.error("Token lỗi:", error);
        }
      }

      if (!token || !userId) {
        setToast({ open: true, message: "Phiên đăng nhập hết hạn", severity: "error" });
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/${userId}`, getAuthConfig());
        const data = response.data;

        const schoolVal = data.student?.school || "";
        const dobVal = data.student?.dob ? data.student.dob.split("T")[0] : "";

        // Set dữ liệu cho cả 2 state ban đầu
        const fullData = { ...data, school: schoolVal, dob: dobVal };
        setSavedUser(fullData); 
        setFormData({
          fname: data.fname || "",
          mname: data.mname || "",
          lname: data.lname || "",
          school: schoolVal,
          dob: dobVal
        });

        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải thông tin:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, token]);

  // --- XỬ LÝ INPUT (Chỉ update formData) ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- 2. UPLOAD ẢNH ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra sơ bộ (Client side validation)
    if (file.size > 5 * 1024 * 1024) { // 5MB
        setToast({ open: true, message: "Ảnh quá lớn! Vui lòng chọn ảnh < 5MB", severity: "warning" });
        return;
    }

    const decoded = jwtDecode(token);
    const userId = decoded.sub || decoded.uid;
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      // Backend Controller: @Post(':id/avatar')
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
        // Cập nhật Avatar ngay lập tức cho savedUser vì ảnh đã lên server
        const newAvatarUrl = res.data.avata_url || URL.createObjectURL(file);
        setSavedUser(prev => ({ ...prev, avata_url: newAvatarUrl }));
        
        setToast({ open: true, message: "Đổi ảnh đại diện thành công!", severity: "success" });
        setShowAvatarModal(false);
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      setToast({ open: true, message: "Lỗi upload ảnh.", severity: "error" });
    }
  };

  // --- 3. LƯU THÔNG TIN ---
  const handleSave = async () => {
    try {
      setUpdating(true);
      const decoded = jwtDecode(token);
      const userId = decoded.sub || decoded.uid;

      const payload = {
        fname: formData.fname,
        mname: formData.mname,
        lname: formData.lname,
        school: formData.school,
        dob: formData.dob ? new Date(formData.dob).toISOString() : null,
      };

      await axios.patch(`${API_URL}/users/${userId}`, payload, getAuthConfig());

      // [QUAN TRỌNG]: Khi lưu thành công, mới cập nhật giao diện hiển thị bên trái
      setSavedUser(prev => ({
        ...prev,
        fname: formData.fname,
        mname: formData.mname,
        lname: formData.lname,
        student: { ...prev.student, school: formData.school, dob: formData.dob } // Update nested nếu cần
      }));

      setToast({ open: true, message: "Cập nhật hồ sơ thành công!", severity: "success" });
    } catch (error) {
      console.error("Lỗi lưu:", error);
      setToast({ open: true, message: "Cập nhật thất bại.", severity: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseToast = () => setToast({ ...toast, open: false });

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
        
        {/* === CỘT TRÁI: HIỂN THỊ THÔNG TIN (Dùng savedUser) === */}
        <div className="left-panel card">
          <div className="avatar-wrapper">
            <img
              src={displayAvatar}
              alt="Avatar"
              className="avatar-img"
              onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
            />
            <button className="camera-btn" onClick={() => setShowAvatarModal(true)}>
              <CameraAlt fontSize="small" />
            </button>
          </div>

          {/* Sửa: Hiển thị đủ 3 thành phần tên */}
          <h2 className="user-fullname">
            {savedUser.lname} {savedUser.mname} {savedUser.fname}
          </h2>
          <span className="user-role">{savedUser.role || "HỌC SINH"}</span>

          <div className="basic-info">
            <div className="info-item">
              <Email fontSize="small" /> {savedUser.email}
            </div>
            {savedUser.createAt && (
              <div className="info-item">
                <CalendarToday fontSize="small" />
                Tham gia: {new Date(savedUser.createAt).toLocaleDateString("vi-VN")}
              </div>
            )}
          </div>
        </div>

        {/* === CỘT PHẢI: FORM CHỈNH SỬA (Dùng formData) === */}
        <div className="right-panel card">
          <div className="panel-header">
            <h3>Thông Tin Cá Nhân</h3>
            <p>Quản lý và cập nhật thông tin hồ sơ của bạn</p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Họ (Last Name)</label>
              <input
                type="text"
                name="lname"
                value={formData.lname}
                onChange={handleInputChange}
                placeholder="Nhập họ..."
              />
            </div>
            <div className="form-group">
              <label>Tên đệm (Middle Name)</label>
              <input
                type="text"
                name="mname"
                value={formData.mname}
                onChange={handleInputChange}
                placeholder="Nhập tên đệm..."
              />
            </div>
            <div className="form-group full-width-mobile">
              <label>Tên (First Name)</label>
              <input
                type="text"
                name="fname"
                value={formData.fname}
                onChange={handleInputChange}
                placeholder="Nhập tên..."
              />
            </div>

            <div className="form-group full-width">
              <label>Email (Không thể thay đổi)</label>
              <input type="email" value={savedUser.email || ""} disabled className="input-disabled" />
            </div>

            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input type="text" value={savedUser.username || ""} disabled className="input-disabled" />
            </div>

            <div className="form-group">
              <label>Ngày sinh</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Trường học</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  placeholder="Nhập tên trường học..."
                  style={{ paddingLeft: "40px" }}
                />
                <SchoolIcon
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "12px",
                    color: "#9ca3af",
                    fontSize: "20px",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-save" onClick={handleSave} disabled={updating}>
              {updating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Save fontSize="small" />
              )}
              {updating ? " Đang lưu..." : " Lưu Thay Đổi"}
            </button>
          </div>
        </div>
      </div>

      {/* === MODAL UPLOAD ẢNH (Đã cải tiến) === */}
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

      {/* TOAST THÔNG BÁO */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: "100%", boxShadow: 3 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default StudentProfilePage;