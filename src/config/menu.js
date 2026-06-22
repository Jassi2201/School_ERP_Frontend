import {
  FaTachometerAlt,
  FaGraduationCap,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCog,
  FaUser,
  FaChalkboardTeacher,
  FaCalendarCheck,
  FaClock,
  FaDollarSign,
  FaUserCog,
} from 'react-icons/fa';

export const menuGroups = [
  {
    label: 'Dashboard',
    icon: FaTachometerAlt,
    items: [{ code: 'DASHBOARD', label: 'Dashboard', icon: FaTachometerAlt }],
    top: true,
  },
  {
    label: 'Academic',
    icon: FaGraduationCap,
    items: [
      { code: 'STUDENT', label: 'Students', icon: FaUser },
      { code: 'TEACHER', label: 'Teachers', icon: FaChalkboardTeacher },
    ],
  },
  {
    label: 'Attendance',
    icon: FaCalendarAlt,
    items: [
      { code: 'STUDENT_ATTENDANCE', label: 'Student Attendance', icon: FaCalendarCheck },
      { code: 'TEACHER_ATTENDANCE', label: 'Teacher Attendance', icon: FaClock },
    ],
  },
  {
    label: 'Finance',
    icon: FaMoneyBillWave,
    items: [{ code: 'STUDENT_FEES', label: 'Fees', icon: FaDollarSign }],
  },
  {
    label: 'System',
    icon: FaCog,
    items: [{ code: 'ROLE_PERMISSION', label: 'Roles', icon: FaUserCog }],
  },
];