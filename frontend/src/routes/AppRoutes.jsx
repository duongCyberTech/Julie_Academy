import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Typography, Box, CircularProgress } from "@mui/material";

// --- CÁC COMPONENT CỐT LÕI (Giữ nguyên import đồng bộ) ---
import HomePage from "../pages/public/HomePage";
import ProtectedRoute from "./ProtectedRoutes";
import Layout from "../components/Layout";

// --- CÁC TRANG CÔNG KHAI (Lazy Load) ---
const LoginPage = React.lazy(() => import("../pages/public/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/public/RegisterPage"));
const UnauthorizedPage = React.lazy(() => import("../pages/public/UnauthorizedPage"));
const AboutPage = React.lazy(() => import("../pages/public/AboutPage"));
const ContactPage = React.lazy(() => import("../pages/public/ContactPage"));
const PolicyPage = React.lazy(() => import("../pages/public/PolicyPage"));
const TermPage = React.lazy(() => import("../pages/public/TermPage"));

// --- ADMIN (Lazy Load) ---
const AdminDashboard = React.lazy(() => import("../pages/admin/AdminDashboard"));
const UserManagement = React.lazy(() => import("../pages/admin/UserManagement"));
const ResourcesManagement = React.lazy(() => import("../pages/admin/ResourcesManagement"));
const SystemSetting = React.lazy(() => import("../pages/admin/SystemSetting.jsx"));
const AdminProfilePage = React.lazy(() => import("../pages/admin/AdminProfilePage.jsx"));

// --- TUTOR (Lazy Load) ---
const TutorDashboard = React.lazy(() => import("../pages/tutor/TutorDashboard"));
const QuestionPage = React.lazy(() => import("../pages/tutor/QuestionPage"));
const NewQuestion = React.lazy(() => import("../pages/tutor/NewQuestion.jsx"));
const ClassPage = React.lazy(() => import("../pages/tutor/ClassPage"));
const ClassDetailPage = React.lazy(() => import("../pages/tutor/ClassDetailPage"));
const ExamPage = React.lazy(() => import("../pages/tutor/ExamPage"));
const ExamDetailPage = React.lazy(() => import("../pages/tutor/ExamDetailPage"));
const AssignmentPage = React.lazy(() => import("../pages/tutor/AssignmentPage"));
const QuestionDetailPage = React.lazy(() => import("../pages/tutor/QuestionDetailPage.jsx"));
const TutorProfilePage = React.lazy(() => import("../pages/tutor/TutorProfilePage.jsx"));
const QuestionEditor = React.lazy(() => import("../pages/tutor/QuestionEditor.jsx"));

// --- STUDENT (Lazy Load) ---
const StudentDashboard = React.lazy(() => import("../pages/student/StudentDashboard"));
const StudentProfilePage = React.lazy(() => import("../pages/student/StudentProfilePage"));
const StudentMyClassPage = React.lazy(() => import("../pages/student/StudentMyClassPage"));
const StudentClassDetailPage = React.lazy(() => import("../pages/student/StudentClassDetailPage"));
const StudentThreadDetailPage = React.lazy(() => import("../pages/student/StudentThreadDetailPage"));
const StudentPracticePage = React.lazy(() => import("../pages/student/StudentPracticePage"));
const StudentPracticeSessionPage = React.lazy(() => import("../pages/student/StudentPracticeSessionPage"));
const StudentPracticeResultPage = React.lazy(() => import("../pages/student/StudentPracticeResultPage"));
const StudentPracticeReviewPage = React.lazy(() => import("../pages/student/StudentPracticeReviewPage"));
const StudentAssignmentPage = React.lazy(() => import("../pages/student/StudentAssignmentPage"));
const StudentAssignmentSessionPage = React.lazy(() => import("../pages/student/StudentAssignmentSessionPage"));
const StudentAssignmentResultPage = React.lazy(() => import("../pages/student/StudentAssignmentResultPage"));
const StudentEnrollPage = React.lazy(() => import("../pages/student/StudentEnrollPage.jsx"));
const StudentGlobalAssignmentPage = React.lazy(() => import("../pages/student/StudentGlobalAssignmentPage"));

// --- PARENT (Lazy Load) ---
const ParentDashboard = React.lazy(() => import("../pages/parent/ParentDashboard.jsx"));
const ParentEnrollPage = React.lazy(() => import("../pages/parent/ParentEnrollPage.jsx"));
const ParentProfilePage = React.lazy(() => import("../pages/parent/ParentProfilePage.jsx"));

// --- CHUNG (Lazy Load) ---
const NotificationPage = React.lazy(() => import("../pages/general/NotificationPage.jsx"));

// --- HIỆU ỨNG TẢI TRANG (Fallback UI) ---
const LoadingFallback = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      width: "100%",
    }}
  >
    <CircularProgress color="primary" />
  </Box>
);

function AppRoutes(props) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* --- Các Route Công Khai (Public) --- */}
        <Route path="/" element={<HomePage {...props} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/aboutus" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/policy" element={<PolicyPage />} />
        <Route path="/term" element={<TermPage />} />

        {/* Nhóm các route cho Admin */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          {/* ĐÃ THÊM {...props} VÀO LAYOUT */}
          <Route path="/admin" element={<Layout {...props} />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="resources" element={<ResourcesManagement />} />
            <Route path="settings" element={<SystemSetting />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>
        </Route>

        {/* Nhóm các route cho Tutor */}
        <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
          {/* ĐÃ THÊM {...props} VÀO LAYOUT */}
          <Route path="/tutor" element={<Layout {...props} />}>
            <Route path="dashboard" element={<TutorDashboard />} />
            <Route path="question" element={<QuestionPage />} />
            <Route path="new" element={<NewQuestion />} />
            <Route path="classes" element={<ClassPage />} />
            <Route path="classes/:classId" element={<ClassDetailPage />} />
            <Route path="exam" element={<ExamPage />} />
            <Route path="exam/:examId" element={<ExamDetailPage />} />
            <Route path="assignment" element={<AssignmentPage />} />
            <Route path="question/:id" element={<QuestionDetailPage />} />
            <Route path="profile" element={<TutorProfilePage />} />
            <Route path="edit-question/:id" element={<QuestionEditor />} />
            <Route
              path="classes/:classId/:threadId"
              element={<StudentThreadDetailPage />}
            />
          </Route>
        </Route>


        {/* Nhóm các route cho Student */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          {/* ĐÃ THÊM {...props} VÀO LAYOUT */}
          <Route path="/student" element={<Layout {...props} />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="enroll" element={<StudentEnrollPage />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="classes" element={<StudentMyClassPage />} />
            <Route path="classes/:classId" element={<StudentClassDetailPage />} />
            <Route
              path="classes/:classId/:threadId"
              element={<StudentThreadDetailPage />}
            />
            <Route path="practice" element={<StudentPracticePage />} />
            <Route
              path="practice/session/:sessionId"
              element={<StudentPracticeSessionPage />}
            />
            <Route
              path="practice/result/:resultId"
              element={<StudentPracticeResultPage />}
            />
            <Route
              path="practice/review/:reviewId"
              element={<StudentPracticeReviewPage />}
            />

            <Route path="assignment" element={<StudentGlobalAssignmentPage />} />
            
            <Route path="assignment/class/:classId" element={<StudentAssignmentPage />} />
            
            <Route
              path="assignment/class/:classId/exam/:examId/session/:sessionId"
              element={<StudentAssignmentSessionPage />}
            />
            <Route
              path="assignment/continue/:etId"
              element={<StudentAssignmentSessionPage />}
            />
            
           <Route path="assignment/result/:etId" element={<StudentAssignmentResultPage />} />


          </Route>
        </Route>


        {/* Nhóm các route cho Parent */}
        <Route element={<ProtectedRoute allowedRoles={["parents"]} />}>
          {/* ĐÃ THÊM {...props} VÀO LAYOUT */}
          <Route path="/parent" element={<Layout {...props} />}>
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="enroll" element={<ParentEnrollPage />} />
            <Route path="profile" element={<ParentProfilePage />} />
          </Route>
        </Route>

        {/* Nhóm các route chung cho các role */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "student", "parents", "tutor"]} />}>
          {/* ĐÃ THÊM {...props} VÀO LAYOUT */}
          <Route path="/settings" element={<Layout {...props} />}>
            <Route path="notifications" element={<NotificationPage />} />
          </Route>
        </Route>

        {/* Route bắt các đường dẫn không hợp lệ (404 Not Found) */}
        <Route
          path="*"
          element={
            <Typography sx={{ p: 4, textAlign: 'center' }} variant="h5">
              404 - Không Tìm Thấy Trang
            </Typography>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;