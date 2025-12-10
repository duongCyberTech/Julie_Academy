/*
 * File: frontend/src/pages/student/MockDashboardData.js
 *
 * Dữ liệu giả lập hoàn chỉnh cho Dashboard Học sinh.
 * Bao gồm: User, Badges, History, và các dữ liệu đa chiều cho Biểu đồ.
 */

// 1. Thông tin User & Student (Giữ nguyên của bạn)
export const MOCK_USER_PROFILE = {
  uid: 'user-123',
  username: 'hoang_nguyen',
  fname: 'Nguyễn',
  lname: 'Hoàng',
  email: 'hoang@example.com',
  createAt: '2023-09-05T08:00:00Z', // Ngày tham gia
  avata_url: 'https://i.pravatar.cc/150?u=hoang',
  role: 'student',
  student: {
    school: 'THCS Chu Văn An',
    dob: '2010-05-20T00:00:00Z',
  }
};

// 2. Danh sách Huy hiệu (Giữ nguyên của bạn)
export const MOCK_BADGES = [
  { badge_id: 'b1', title: 'Ong Chăm Chỉ', description: 'Học 7 ngày liên tiếp', icon: '🐝', color: '#FFC107' },
  { badge_id: 'b2', title: 'Thần Đồng', description: 'Điểm 10 Đại số', icon: '🧮', color: '#2196F3' },
  { badge_id: 'b3', title: 'Kẻ Hủy Diệt', description: 'Hoàn thành 50 bài', icon: '🚀', color: '#F44336' },
  { badge_id: 'b4', title: 'Nhà Thông Thái', description: 'Trả lời đúng 100 câu', icon: '🦉', color: '#9C27B0' },
  { badge_id: 'b5', title: 'Tốc Độ Ánh Sáng', description: 'Hoàn thành bài thi < 5 phút', icon: '⚡', color: '#FF9800' },
  { badge_id: 'b6', title: 'Bách Phát Bách Trúng', description: 'Đúng 100% bài kiểm tra', icon: '🎯', color: '#4CAF50' },
];

// 3. Lịch sử làm bài (Giữ nguyên của bạn + Bổ sung để tính toán phong phú hơn)
export const MOCK_EXAM_HISTORY = [
  { et_id: 'et-01', final_score: 8.5, startAt: '2024-03-01T08:00:00Z', doneAt: '2024-03-01T08:45:00Z', exam: { title: 'Kiểm tra 1 tiết Đại số', exam_type: 'test', class: { subject: 'Toán' } } },
  { et_id: 'et-02', final_score: 7.0, startAt: '2024-03-05T14:00:00Z', doneAt: '2024-03-05T14:30:00Z', exam: { title: 'Luyện tập Hình học', exam_type: 'practice', class: { subject: 'Toán' } } },
  { et_id: 'et-03', final_score: 9.0, startAt: '2024-03-10T09:00:00Z', doneAt: '2024-03-10T10:00:00Z', exam: { title: 'Thi thử Vật Lý', exam_type: 'test', class: { subject: 'Lý' } } },
  { et_id: 'et-04', final_score: 6.5, startAt: '2024-03-12T19:00:00Z', doneAt: '2024-03-12T19:45:00Z', exam: { title: 'Luyện tập Hóa học', exam_type: 'practice', class: { subject: 'Hóa' } } },
  { et_id: 'et-05', final_score: 9.5, startAt: '2024-03-15T08:00:00Z', doneAt: '2024-03-15T08:20:00Z', exam: { title: 'Kiểm tra nhanh 15p', exam_type: 'test', class: { subject: 'Toán' } } },
  { et_id: 'et-06', final_score: 8.0, startAt: '2024-03-18T10:00:00Z', doneAt: '2024-03-18T10:40:00Z', exam: { title: 'Luyện tập Đại số', exam_type: 'practice', class: { subject: 'Toán' } } },
  { et_id: 'et-07', final_score: 10.0, startAt: '2024-02-28T10:00:00Z', doneAt: '2024-02-28T10:40:00Z', exam: { title: 'Ôn tập chương 1', exam_type: 'practice', class: { subject: 'Toán' } } },
];

// 4. Các lớp đang tham gia (Giữ nguyên của bạn)
export const MOCK_ACTIVE_CLASSES = [
  { class_id: 'c1', classname: 'Lớp Toán 9A', subject: 'Toán', teacher: 'Thầy Hùng' },
  { class_id: 'c2', classname: 'Lớp Lý 9B', subject: 'Lý', teacher: 'Cô Lan' },
  { class_id: 'c3', classname: 'Lớp Hóa 9C', subject: 'Hóa', teacher: 'Thầy Minh' },
];

// 5. Gợi ý khóa học (Giữ nguyên của bạn)
export const MOCK_SUGGESTIONS = [
  {
    id: 'sug-1',
    title: 'Chuyên đề: Hệ thức lượng trong tam giác vuông',
    type: 'topic',
    reason: 'Điểm phần Hình học của bạn đang thấp hơn trung bình (5.0)',
    priority: 'high', 
    subject: 'Toán'
  },
  {
    id: 'sug-2',
    title: 'Khóa học: Vật lý điện từ căn bản',
    type: 'course',
    reason: 'Chuẩn bị cho kỳ thi giữa kỳ sắp tới',
    priority: 'medium', 
    subject: 'Lý'
  }
];

// --- PHẦN BỔ SUNG ĐỂ DASHBOARD HOÀN CHỈNH ---

// 6. Dữ liệu Bản đồ Kiến thức (Radar Chart) - Bổ sung mới
// Mô phỏng điểm năng lực từng kỹ năng
export const MOCK_SKILL_MAP = [
    { subject: 'PT Bậc 2', A: 90, fullMark: 100 },
    { subject: 'Hệ thức lượng', A: 60, fullMark: 100 }, // Yếu -> Cần gợi ý học
    { subject: 'Hàm số', A: 80, fullMark: 100 },
    { subject: 'Thống kê', A: 95, fullMark: 100 },
    { subject: 'Cơ học', A: 70, fullMark: 100 },
    { subject: 'Điện học', A: 85, fullMark: 100 },
];

// 7. Dữ liệu Phân bổ thời gian (Pie Chart) - Bổ sung mới
// Mô phỏng % thời gian học các môn
export const MOCK_TIME_DISTRIBUTION = [
    { name: 'Đại số', value: 15, color: '#0088FE' },
    { name: 'Hình học', value: 10, color: '#00C49F' },
    { name: 'Vật lý', value: 8, color: '#FFBB28' },
    { name: 'Hóa học', value: 5, color: '#FF8042' },
    { name: 'Tiếng Anh', value: 7, color: '#8884d8' },
];

// 8. Dữ liệu Đa chiều cho Biểu đồ Tiến độ (Line Chart) - Hỗ trợ bộ lọc Tuần/Tháng
export const MOCK_PROGRESS_DATA = {
    week: [
        { name: 'T2', score: 6.5, subject: 'Toán' },
        { name: 'T3', score: 7.0, subject: 'Lý' },
        { name: 'T4', score: 8.0, subject: 'Toán' },
        { name: 'T5', score: 7.5, subject: 'Hóa' },
        { name: 'T6', score: 8.5, subject: 'Toán' },
        { name: 'T7', score: 9.0, subject: 'Anh' },
        { name: 'CN', score: 8.5, subject: 'Lý' },
    ],
    month: [
        // Tuần 1
        { name: 'Tuần 1', score: 7.0, subject: 'Toán' },
        { name: 'Tuần 1', score: 6.5, subject: 'Lý' },
        // Tuần 2
        { name: 'Tuần 2', score: 7.5, subject: 'Toán' },
        { name: 'Tuần 2', score: 7.0, subject: 'Lý' },
        // Tuần 3
        { name: 'Tuần 3', score: 8.0, subject: 'Toán' },
        { name: 'Tuần 3', score: 7.8, subject: 'Lý' },
        // Tuần 4
        { name: 'Tuần 4', score: 8.5, subject: 'Toán' },
        { name: 'Tuần 4', score: 8.2, subject: 'Lý' },
    ],
    semester: [
        { name: 'Tháng 9', score: 6.5, subject: 'Toán' },
        { name: 'Tháng 9', score: 6.0, subject: 'Lý' },
        { name: 'Tháng 10', score: 7.5, subject: 'Toán' },
        { name: 'Tháng 10', score: 7.0, subject: 'Lý' },
        { name: 'Tháng 11', score: 8.0, subject: 'Toán' },
        { name: 'Tháng 11', score: 7.5, subject: 'Lý' },
        { name: 'Tháng 12', score: 9.0, subject: 'Toán' },
        { name: 'Tháng 12', score: 8.5, subject: 'Lý' },
    ]
};
// 9. Dữ liệu Đa chiều cho Biểu đồ So sánh (Bar Chart) - Hỗ trợ bộ lọc Tuần/Tháng
export const MOCK_COMPARISON_DATA = {
    week: [
        { subject: 'Toán', myAvg: 8.5, classAvg: 7.0 },
        { subject: 'Lý', myAvg: 7.0, classAvg: 7.2 }, 
        { subject: 'Hóa', myAvg: 8.0, classAvg: 7.5 },
    ],
    month: [
        { subject: 'Toán', myAvg: 8.2, classAvg: 7.5 },
        { subject: 'Lý', myAvg: 7.5, classAvg: 7.6 },
        { subject: 'Hóa', myAvg: 8.1, classAvg: 7.2 },
        { subject: 'Anh', myAvg: 9.0, classAvg: 8.0 },
    ],
    semester: [
        { subject: 'Toán', myAvg: 8.0, classAvg: 7.8 },
        { subject: 'Lý', myAvg: 7.8, classAvg: 7.8 },
        { subject: 'Hóa', myAvg: 8.2, classAvg: 7.5 },
        { subject: 'Anh', myAvg: 8.8, classAvg: 8.1 },
        { subject: 'Văn', myAvg: 7.5, classAvg: 7.2 },
    ]
};