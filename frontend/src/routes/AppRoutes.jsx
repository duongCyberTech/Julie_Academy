import React from "react";
import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";
import UnauthorizedPage from "../pages/public/UnauthorizedPage";
import ProtectedRoute from "./ProtectedRoutes";
import Layout from "../components/Layout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import TutorDashboard from "../pages/tutor/TutorDashboard";
import QuestionPage from "../pages/tutor/QuestionPage";
import ClassPage from "../pages/tutor/ClassPage";
import { Typography } from "@mui/material";
import QuestionEditorPage from "../pages/tutor/QuestionEditor.jsx";
import UserManagement from "../pages/admin/UserManagement";
import AboutPage from "../pages/public/AboutPage";
import ContactPage from "../pages/public/ContactPage";
import ResourcesManagement from "../pages/admin/ResourcesManagement";
import ClassDetailPage from "../pages/tutor/ClassDetailPage";
import ExamPage from "../pages/tutor/ExamPage";
import ExamDetailPage from "../pages/tutor/ExamDetailPage";
import AssignmentPage from "../pages/tutor/AssignmentPage";
import SystemSetting from "../pages/admin/SystemSetting.jsx";
import QuestionDetailPage from "../pages/tutor/QuestionDetailPage.jsx";
import ParentDashboard from "../pages/parent/ParentDashboard.jsx";
import ParentEnrollPage from "../pages/parent/ParentEnrollPage.jsx";
import NewQuestion from "../pages/tutor/NewQuestion.jsx";

//Student
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentProfilePage from "../pages/student/StudentProfilePage";
import StudentMyClassPage from "../pages/student/StudentMyClassPage";
import StudentClassDetailPage from "../pages/student/StudentClassDetailPage";
import StudentThreadDetailPage from "../pages/student/StudentThreadDetailPage";
import StudentPracticePage from "../pages/student/StudentPracticePage";
import StudentPracticeSessionPage from "../pages/student/StudentPracticeSessionPage";
import StudentPracticeResultPage from "../pages/student/StudentPracticeResultPage";
import StudentPracticeReviewPage from "../pages/student/StudentPracticeReviewPage";
import StudentAssignmentPage from "../pages/student/StudentAssignmentPage";
import StudentAssignmentSessionPage from "../pages/student/StudentAssignmentSessionPage";
import StudentAssignmentResultPage from "../pages/student/StudentAssignmentResultPage";
import StudentEnrollPage from "../pages/student/StudentEnrollPage.jsx";

//Profile
import TutorProfilePage from "../pages/tutor/TutorProfilePage.jsx";
import AdminProfilePage from "../pages/admin/AdminProfilePage.jsx";
import ParentProfilePage from "../pages/parent/ParentProfilePage.jsx";

function AppRoutes(props) {
  return (
    <Routes>
      {/* --- Các Route Công Khai (Public) --- */}
      <Route path="/" element={<HomePage {...props} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/aboutus" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Nhóm các route cho Admin */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<Layout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="resources" element={<ResourcesManagement />} />
          <Route path="settings" element={<SystemSetting />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>
      </Route>
      {/* Nhóm các route cho Tutor */}
      <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
        <Route path="/tutor" element={<Layout />}>
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
          
        </Route>
      </Route>

      {/* Nhóm các route cho Student */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<Layout />}>
          {/* Dashboard */}
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="enroll" element={<StudentEnrollPage />} />

          {/* Hồ sơ cá nhân */}
          <Route path="profile" element={<StudentProfilePage />} />

          {/* Quản lý lớp học */}
          <Route path="classes" element={<StudentMyClassPage />} />
          <Route path="classes/:classId" element={<StudentClassDetailPage />} />

          {/* Diễn đàn/Thảo luận trong lớp */}
          <Route
            path="classes/:classId/:threadId"
            element={<StudentThreadDetailPage />}
          />

          {/* Luyện tập (Practice) */}
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

          {/* Bài tập được giao (Assignment) */}
          <Route path="assignment" element={<StudentAssignmentPage />} />
          <Route
            path="assignment/session/:sessionId"
            element={<StudentAssignmentSessionPage />}
          />
          <Route
            path="assignment/session/:sessionId/result"
            element={<StudentAssignmentResultPage />}
          />
        </Route>
      </Route>

      {/* Nhóm các route cho Parent */}
      <Route element={<ProtectedRoute allowedRoles={["parents"]} />}>
        <Route path="/parent" element={<Layout />}>
          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="enroll" element={<ParentEnrollPage />} />
          <Route path="profile" element={<ParentProfilePage />} />
        </Route>
      </Route>

      {/* Route bắt các đường dẫn không hợp lệ (404 Not Found) */}
      <Route
        path="*"
        element={
          <Typography sx={{ p: 4 }}>404 - Không Tìm Thấy Trang</Typography>
        }
      />
    </Routes>
  );
}

export default AppRoutes;