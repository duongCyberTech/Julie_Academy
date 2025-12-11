import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Chip
} from "@mui/material";
import {
  CameraAlt,
  Save,
  Email,
  Phone,
  WorkHistory,
  CloudUpload,
  School,
  VerifiedUser,
  Lightbulb,
  InfoOutlined,
  Star
} from "@mui/icons-material";
import "../student/Profile.css"

const TutorProfilePage = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [savedUser, setSavedUser] = useState({
    fname: "", mname: "", lname: "",
    email: "", username: "", role: "",
    avata_url: "", createAt: "",
    experiences: "", // Dữ liệu hiển thị (đã lưu)
    phone_number: ""
  });

  const [formData, setFormData] = useState({
    fname: "", mname: "", lname: "",
    phone_number: "",
    experiences: "" // Dữ liệu đang nhập
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

        // Lấy dữ liệu an toàn từ object tutor (nếu có)
        const phoneVal = data.tutor?.phone_number || data.phone_number || "";
        const expVal = data.tutor?.experiences || "";

        const fullData = { ...data, phone_number: phoneVal, experiences: expVal };
        
        setSavedUser(fullData);
        setFormData({
          fname: data.fname || "",
          mname: data.mname || "",
          lname: data.lname || "",
          phone_number: phoneVal,
          experiences: expVal
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

      // Payload khớp với Postman bạn đã test
      const payload = {
        fname: formData.fname,
        mname: formData.mname,
        lname: formData.lname,
        phone_number: formData.phone_number,
        experiences: formData.experiences 
      };

      await axios.patch(`${API_URL}/users/${userId}`, payload, getAuthConfig());

      // Cập nhật UI ngay lập tức
      setSavedUser(prev => ({
        ...prev,
        ...formData
      }));

      setToast({ open: true, message: "Cập nhật hồ sơ thành công!", severity: "success" });
    } catch (error) {
      setToast({ open: true, message: "Cập nhật thất bại. Vui lòng thử lại.", severity: "error" });
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
        {/* === CỘT TRÁI: HIỂN THỊ (MINI CV) === */}
        <div
          className="left-panel card"
          style={{ background: "linear-gradient(to bottom, #ffffff, #f0fdf4)" }}
        >
          <div className="avatar-wrapper">
            <img
              src={displayAvatar}
              alt="Avatar"
              className="avatar-img"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150";
              }}
            />
            <button
              className="camera-btn"
              onClick={() => setShowAvatarModal(true)}
            >
              <CameraAlt fontSize="small" />
            </button>
          </div>

          <h2 className="user-fullname">
            {savedUser.lname} {savedUser.mname} {savedUser.fname}
          </h2>

          <div
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Chip
              label="GIA SƯ"
              color="success"
              size="small"
              icon={<School style={{ fontSize: 16 }} />}
              style={{ fontWeight: 600 }}
            />
            {savedUser.phone_number && (
              <Chip
                label="Đã xác thực SĐT"
                variant="outlined"
                color="primary"
                size="small"
                icon={<VerifiedUser style={{ fontSize: 16 }} />}
              />
            )}
          </div>

          <div
            className="basic-info"
            style={{
              width: "100%",
              padding: "0 20px", // Tạo khoảng cách an toàn 2 bên
              marginTop: "25px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start", // QUAN TRỌNG: Căn tất cả sang trái
            }}
          >
            {/* Khối Email */}
            <div
              className="info-item"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "2px",
                color: "#4b5563", // Màu xám đậm cho dễ đọc
              }}
            >
              <Email fontSize="small" color="action" />
              <span style={{ fontSize: "0.95rem" }}>{savedUser.email}</span>
            </div>

            {/* Khối SĐT */}
            {savedUser.phone_number && (
              <div
                className="info-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#4b5563",
                }}
              >
                <Phone fontSize="small" color="action" />
                <span style={{ fontSize: "0.95rem" }}>
                  {savedUser.phone_number}
                </span>
              </div>
            )}
          </div>

          {/* HIỂN THỊ KINH NGHIỆM - PHẦN QUAN TRỌNG NHẤT */}
          {savedUser.experiences && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: "12px",
                border: "1px solid #dcfce7",
                width: "100%",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginBottom: "8px",
                  color: "#15803d",
                  fontWeight: "bold",
                }}
              >
                <WorkHistory fontSize="small" /> Kinh nghiệm & Thành tích
              </div>
              <p
                style={{
                  whiteSpace: "pre-line", // QUAN TRỌNG: Giữ định dạng xuống dòng
                  fontSize: "0.9rem",
                  color: "#374151",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                {savedUser.experiences}
              </p>
            </div>
          )}
        </div>

        {/* === CỘT PHẢI: FORM CHỈNH SỬA === */}
        <div className="right-panel card">
          <div className="panel-header">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h3>Hồ Sơ Giảng Dạy</h3>
                <p>
                  Hãy xây dựng thật uy tín để thu hút học sinh và phụ huynh đăng
                  kí lớp của mình nhé
                </p>
              </div>
              <Star style={{ color: "#fbbf24", fontSize: 40 }} />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Họ (Last Name)</label>
              <input
                type="text"
                name="lname"
                value={formData.lname}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Tên đệm (Middle Name)</label>
              <input
                type="text"
                name="mname"
                value={formData.mname}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group full-width-mobile">
              <label>Tên (First Name)</label>
              <input
                type="text"
                name="fname"
                value={formData.fname}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Số điện thoại liên hệ</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: 0912345678"
                  style={{ paddingLeft: "40px" }}
                />
                <Phone
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

            {/* EXPERIENCE TEXTAREA - HERO SECTION */}
            <div
              className="form-group full-width"
              style={{ marginTop: "10px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "5px",
                }}
              >
                <label>Giới thiệu & Kinh nghiệm</label>
                <Tooltip title="Mẹo: Hãy liệt kê nơi công tác, bằng cấp và các thành tích cụ thể (số học sinh đậu, điểm số...)">
                  <Lightbulb
                    fontSize="small"
                    style={{ color: "#eab308", cursor: "pointer" }}
                  />
                </Tooltip>
              </div>

              <div style={{ position: "relative" }}>
                <textarea
                  name="experiences"
                  value={formData.experiences}
                  onChange={handleInputChange}
                  rows="8"
                  placeholder={`- Nơi công tác: Giáo viên Toán THCS Nguyễn Du\n- Bằng cấp: Thạc sĩ Sư phạm Toán\n- Thành tích: Đào tạo 50+ học sinh đậu trường Chuyên\n- Phương pháp: Tư duy logic, sơ đồ Mindmap`}
                  style={{
                    width: "100%",
                    padding: "12px",
                    paddingLeft: "12px",
                    borderRadius: "10px",
                    border: "1.5px solid #e5e7eb",
                    fontFamily: "inherit",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    resize: "vertical",
                    outline: "none",
                    backgroundColor: "#f9fafb",
                  }}
                />
              </div>
              <small
                style={{
                  color: "#6b7280",
                  fontStyle: "italic",
                  marginTop: "4px",
                }}
              ></small>
            </div>

            <div className="form-group full-width">
              <label>Email đăng nhập (Không thể thay đổi)</label>
              <input
                type="email"
                value={savedUser.email || ""}
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
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              }}
            >
              {updating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Save fontSize="small" />
              )}
              {updating ? " Đang cập nhật..." : " Lưu Hồ Sơ"}
            </button>
          </div>
        </div>
      </div>

      {/* === MODAL UPLOAD ẢNH (Đã nâng cấp giao diện giống Student) === */}
      {showAvatarModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAvatarModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Thay Đổi Ảnh Đại Diện</h3>

            {/* Khu vực thông tin hướng dẫn (Mới thêm) */}
            <div
              style={{
                margin: "20px 0",
                padding: "15px",
                backgroundColor: "#f8fafc",
                borderRadius: "8px",
                textAlign: "left",
                border: "1px dashed #cbd5e1",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  color: "#334155",
                  fontWeight: 600,
                }}
              >
                <InfoOutlined fontSize="small" color="primary" /> Lưu ý khi tải
                ảnh:
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  color: "#64748b",
                  fontSize: "0.9rem",
                }}
              >
                <li>
                  Định dạng hỗ trợ: <strong>JPEG, PNG</strong>
                </li>
                <li>
                  Dung lượng tối đa: <strong>5MB</strong>
                </li>
                <li>Nên dùng ảnh vuông để hiển thị đẹp nhất.</li>
              </ul>
            </div>

            <div className="modal-actions">
              <label
                htmlFor="file-upload"
                className="btn-upload"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <CloudUpload fontSize="small" /> Chọn ảnh từ máy tính
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />

              <button
                className="btn-close"
                onClick={() => setShowAvatarModal(false)}
              >
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
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TutorProfilePage;