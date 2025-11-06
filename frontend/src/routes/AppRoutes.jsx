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
import NewQuestion from "../pages/tutor/NewQuestion";
import UserManagement from "../pages/admin/UserManagement";
import AboutPage from "../pages/public/AboutPage";
import ContactPage from "../pages/public/ContactPage";
import ResourcesManagement from "../pages/admin/ResourcesManagement";

import StudentDashboard from "../pages/student/StudentDashboard";
import StudentProfilePage from "../pages/student/StudentProfilePage";
import StudentMyClassPage from '../pages/student/StudentMyClassPage';
import StudentClassDetailPage from '../pages/student/StudentClassDetailPage';
import StudentThreadDetailPage from '../pages/student/StudentThreadDetailPage';
// import StudentPracticePage from '../pages/student/StudentPracticePage';
// import StudentPracticeSessionPage from '../pages/student/StudentPracticeSessionPage';
// import StudentHomeworkPage from '../pages/student/StudentHomeworkPage';
// import StudentExamSessionPage from '../pages/student/StudentExamSessionPage';
// import StudentExamReviewPage from '../pages/student/StudentExamReviewPage'; 

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
        </Route>
      </Route>

      {/* Nhóm các route cho Tutor */}
      <Route element={<ProtectedRoute allowedRoles={["tutor"]} />}>
        <Route path="/tutor" element={<Layout />}>
          <Route path="dashboard" element={<TutorDashboard />} />
          <Route path="question" element={<QuestionPage />} />
          <Route path="new" element={<NewQuestion />} />
          <Route path="class" element={<ClassPage />} />
        </Route>
      </Route>

      {/* Nhóm các route cho Student */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<Layout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="myclass" element={<StudentMyClassPage />} />
          <Route path="myclass/:classId" element={<StudentClassDetailPage />} />
          <Route path="myclass/:classId/:threadId" element={<StudentThreadDetailPage />} />  
          {/* <Route path="practice" element={<StudentPracticePage />} />
          <Route path="practice/:categoryId/session" element={<StudentPracticeSessionPage />} />
          <Route path="homework" element={<StudentHomeworkPage />} /> 
          <Route path="exam/:sessionId" element={<StudentExamSessionPage />} /> 
          <Route path="exam/review/:sessionId" element={<StudentExamReviewPage />} /> */}

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
