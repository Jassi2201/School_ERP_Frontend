import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Student from './pages/Student';
import Teacher from './pages/Teacher';
import StudentAttendance from './pages/StudentAttendance';
import TeacherAttendance from './pages/TeacherAttendance';
import RolePermissions from './pages/RolePermissions';
import ClassSection from './pages/ClassSection';
import ClassTeachers from './pages/ClassTeachers';
import Subjects from './pages/Subjects';
import TimetableManagement from './pages/TimetableManagement';
import OnlineMeetLinks from './pages/OnlineMeetLinks';
import TeacherHomework from './pages/HomeworkList';
import HomeworkList from './pages/HomeworkList';
import StudyMaterialList from './pages/StudyMaterialList';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/403" element={<div className="p-6 text-red-600">Access Denied</div>} />
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
         <Route
  path="/student"
  element={
    <ProtectedRoute moduleCode="STUDENT">
      <Student/>
    </ProtectedRoute>
  }
/>
<Route
  path="/teacher"
  element={
    <ProtectedRoute moduleCode="TEACHER">
      <Teacher />
    </ProtectedRoute>
  }
/>
<Route
  path="/student-attendance"
  element={
    <ProtectedRoute moduleCode="STUDENT_ATTENDANCE">
      <StudentAttendance />
    </ProtectedRoute>
  }
/>
<Route
  path="/teacher-attendance"
  element={
    <ProtectedRoute moduleCode="TEACHER_ATTENDANCE">
      <TeacherAttendance />
    </ProtectedRoute>
  }
/>

<Route
  path="/role-permission"
  element={
    <ProtectedRoute moduleCode="ROLE_PERMISSION">
      <RolePermissions />
    </ProtectedRoute>
  }
/>
<Route path="/subjects" element={<ProtectedRoute moduleCode="SUBJECTS"><Subjects /></ProtectedRoute>} />
<Route path="/class-teachers" element={<ProtectedRoute moduleCode="CLASS_TEACHERS"><ClassTeachers /></ProtectedRoute>} />
<Route path="/timetable" element={<ProtectedRoute moduleCode="TIMETABLE"><TimetableManagement /></ProtectedRoute>} />
<Route path="/online-meet-links" element={
  <ProtectedRoute moduleCode="ONLINE_MEET_LINKS">
    <OnlineMeetLinks />
  </ProtectedRoute>
} />
<Route path="/homework" element={<ProtectedRoute moduleCode="HOMEWORK"><HomeworkList /></ProtectedRoute>} />

<Route
  path="/study-material"
  element={
    <ProtectedRoute moduleCode="STUDY_MATERIAL">
      <StudyMaterialList />
    </ProtectedRoute>
  }
/>

<Route
  path="/class-section"
  element={
    <ProtectedRoute moduleCode="CLASS_SECTION">
      <ClassSection />
    </ProtectedRoute>
  }
/>
          {/* Add more modules here */}
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
export default App;