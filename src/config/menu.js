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
  FaClipboardList,
  FaLayerGroup,
  FaBook,
  FaUserCheck,
  FaTasks,
  FaVideo,
  FaLink
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
      { code: 'SUBJECTS', label: 'Subjects', icon: FaBook },                     // ✅ New
      { code: 'CLASS_TEACHERS', label: 'Class Teachers', icon: FaUserCheck },   // ✅ New
    ],
  },
  {
    label: 'Attendance',
    icon: FaCalendarAlt,
    items: [
      { code: 'STUDENT_ATTENDANCE', label: 'Student Attendance', icon: FaCalendarCheck },
      { code: 'TEACHER_ATTENDANCE', label: 'Teacher Attendance', icon: FaClock },
       { code: 'CLASS_SECTION', label: 'Class & Sections', icon: FaLayerGroup },
    ],
  },
  {
  label: 'Scheduling',
  icon: FaClock,
  items: [
    { code: 'TIMETABLE', label: 'Timetable', icon: FaClipboardList },
  ],
},
{
  label: 'Online Classes',
  icon: FaVideo,
  items: [
    { code: 'ONLINE_MEET_LINKS', label: 'Meet Links', icon: FaLink },
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