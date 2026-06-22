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
          {/* Add more modules here */}
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
export default App;