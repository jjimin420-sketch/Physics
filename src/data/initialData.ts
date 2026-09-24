import { User, Assignment, Submission, Quiz, QuizAttempt, VideoLesson } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'student_1',
    name: 'นางสาว Jenny Jelly (อรกัญญา นุกูล)',
    role: 'student',
    username: 'jennyjelly',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    email: 'chonkanya.school@gmail.com',
    studentId: 'ST-6701',
    studentGrade: 'ม.4',
    studentRoom: 'ม.4/1',
    studentNumber: '67',
    targetGoal: 'เกรด4ฟิสิกส์',
    createdAt: '2026-05-10'
  },
  {
    id: 'student_2',
    name: 'น.ส. วริศรา นิลพันธ์',
    role: 'student',
    username: 'student2',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    email: 'warisara@chonkanya.ac.th',
    studentId: 'ST-6702',
    studentGrade: 'ม.4',
    studentRoom: 'ม.4/1',
    studentNumber: '12',
    targetGoal: 'เกรด4ฟิสิกส์',
    createdAt: '2026-05-10'
  },
  {
    id: 'student_3',
    name: 'นาย ภัทรพล สันติชัย',
    role: 'student',
    username: 'student3',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'pattarapol@chonkanya.ac.th',
    studentId: 'ST-6703',
    studentGrade: 'ม.4',
    studentRoom: 'ม.4/2',
    studentNumber: '25',
    targetGoal: 'ผ่านเกณฑ์ 80%',
    createdAt: '2026-05-10'
  },
  {
    id: 'teacher_1',
    name: 'อ. วิชัย ประเสริฐศักดิ์',
    role: 'teacher',
    username: 'teacher1',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    email: 'wichai.phy@chonkanya.ac.th',
    teacherSubject: 'ฟิสิกส์พื้นฐานและฟิสิกส์โอลิมปิก',
    createdAt: '2026-05-01'
  },
  {
    id: 'teacher_2',
    name: 'อ. กนกวรรณ จันทร์เรือง',
    role: 'teacher',
    username: 'teacher2',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'kanokwan.phy@chonkanya.ac.th',
    teacherSubject: 'ฟิสิกส์ ม.5-ม.6 (คลื่นและแม่เหล็กไฟฟ้า)',
    createdAt: '2026-05-01'
  },
  {
    id: 'admin_1',
    name: 'ผู้ดูแลระบบฝ่ายวิชาการ (Admin)',
    role: 'admin',
    username: 'admin',
    password: 'admin123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    email: 'admin.academic@chonkanya.ac.th',
    createdAt: '2026-04-15'
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_1',
    title: 'แบบฝึกหัดเรื่อง การคำนวณกฎข้อที่ 2 ของนิวตัน (∑F = ma)',
    topic: 'กลศาสตร์และแรง',
    description: 'จงแสดงวิธีทำอย่างละเอียด 3 ข้อ เรื่องวัตถุมวล 5 kg ถูกแรงลัพธ์ 20 N กระทำบนพื้นระดับที่มีแรงเสียดทานจลน์ μ = 0.2 พร้อมวาดแผนภาพวัตถุอิสระ (Free Body Diagram)',
    dueDate: '2026-09-25',
    totalPoints: 20,
    assignedBy: 'อ. วิชัย ประเสริฐศักดิ์',
    teacherId: 'teacher_1',
    createdAt: '2026-09-12',
    attachmentName: 'โจทย์_กฎการเคลื่อนที่_ชุดที่1.pdf'
  },
  {
    id: 'asg_2',
    title: 'การวิเคราะห์การเคลื่อนที่แบบโพรเจกไทล์ (วิถีโค้ง)',
    topic: 'การเคลื่อนที่ใน 2 มิติ',
    description: 'ยิงลูกปืนใหญ่ด้วยความเร็วต้น 50 m/s ทำมุม 37° กับแนวราบ จงหาความสูงสูงสุด, เวลาในการเคลื่อนที่ทั้งหมด และระยะทางตกในแนวราบ กำหนด g = 10 m/s²',
    dueDate: '2026-09-30',
    totalPoints: 15,
    assignedBy: 'อ. วิชัย ประเสริฐศักดิ์',
    teacherId: 'teacher_1',
    createdAt: '2026-09-14',
    attachmentName: 'Projectile_Motion_Lab.pdf'
  },
  {
    id: 'asg_3',
    title: 'สรุปและเขียนแผนผังมโนทัศน์ เรื่องคลื่นแม่เหล็กไฟฟ้าและสเปกตรัม',
    topic: 'คลื่นและแสง',
    description: 'จัดทำ Mind Map หรือสรุปสเปกตรัมของคลื่นแม่เหล็กไฟฟ้าทั้ง 7 ชนิด พร้อมระบุช่วงความถี่ การนำไปใช้ประโยชน์ในชีวิตประจำวัน และอันตรายที่อาจเกิดขึ้น',
    dueDate: '2026-10-05',
    totalPoints: 10,
    assignedBy: 'อ. กนกวรรณ จันทร์เรือง',
    teacherId: 'teacher_2',
    createdAt: '2026-09-15'
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_1',
    assignmentId: 'asg_1',
    studentId: 'student_1',
    studentName: 'นางสาว Jenny Jelly (อรกัญญา นุกูล)',
    submittedAt: '2026-09-14 15:30',
    content: 'หนูแสดงวิธีทำโดยแตกแรงในแนวราบและแนวดิ่ง คำนวณ N = mg = 50 N, แรงเสียดทาน f = μN = 10 N แรงลัพธ์ ∑F = 20 - 10 = 10 N ได้ความเร่ง a = ∑F/m = 10/5 = 2 m/s² ค่ะ',
    fileAttachment: 'fbd_inclined_plane_jenny.png',
    attachmentUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    attachmentType: 'image',
    attachments: [
      {
        name: 'fbd_inclined_plane_jenny.png',
        url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
        type: 'image',
        size: '1.2 MB'
      }
    ],
    status: 'graded',
    score: 19,
    feedback: 'คำนวณถูกต้อง ชัดเจนดีมาก แนะนำให้เน้นการเขียนหน่วยกำกับในขั้นตอนย่อยเพิ่มเติม',
    gradedBy: 'อ. วิชัย ประเสริฐศักดิ์',
    gradedAt: '2026-09-15 10:20'
  },
  {
    id: 'sub_2',
    assignmentId: 'asg_1',
    studentId: 'student_2',
    studentName: 'น.ส. วริศรา นิลพันธ์',
    submittedAt: '2026-09-15 11:45',
    content: 'ส่งไฟล์วิธีทำและภาพวาด Free Body Diagram แสดงแรง N, W, F ภายนอก และแรงเสียดทาน f อย่างครบถ้วน ได้คำตอบ a = 2 m/s²',
    fileAttachment: 'fbd_diagram_warisara.png',
    attachmentUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
    attachmentType: 'image',
    attachments: [
      {
        name: 'fbd_diagram_warisara.png',
        url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
        type: 'image',
        size: '850 KB'
      }
    ],
    status: 'submitted'
  }
];

export const INITIAL_VIDEOS: VideoLesson[] = [
  {
    id: 'vid_1790240231789',
    title: 'video 632136926006870767 wR1Ta1kq',
    topic: 'กลศาสตร์',
    description: 'การบรรยายและสาธิตการทดลองวิชาฟิสิกส์เรื่อง กลศาสตร์',
    videoUrl: '/uploads/1790240231821_video_632136926006870767-wR1Ta1kq.mp4',
    duration: '01:14 นาที',
    thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80',
    keyFormulas: ['∑F = ma'],
    summaryPoints: ['สรุปใจความสำคัญและเทคนิคการทำโจทย์'],
    isUploadedFile: true,
    fileName: '1790240231821_video_632136926006870767-wR1Ta1kq.mp4',
    fileSize: '6.8 MB',
    videoType: 'file',
    uploadedById: 'teacher_1',
    uploadedBy: 'อ. วิชัย ประเสริฐศักดิ์',
    uploadedAt: '2026-09-24'
  },
  {
    id: 'vid_1',
    title: 'สรุปเข้ม: กฎการเคลื่อนที่ของนิวตัน 3 ข้อ เข้าใจง่ายในคลิปเดียว',
    topic: 'กลศาสตร์',
    description: 'ปูพื้นฐานกฎข้อ 1 (ความเฉื่อย), กฎข้อ 2 (∑F = ma) และกฎข้อ 3 (กิริยา = ปฏิกิริยา) พร้อมตัวอย่างโจทย์ประยุกต์ลิฟต์และรอก',
    videoUrl: 'https://www.youtube.com/embed/kKKM8Y-u7ds',
    duration: '24:15 นาที',
    uploadedById: 'teacher_1',
    uploadedBy: 'อ. วิชัย ประเสริฐศักดิ์',
    uploadedAt: '2026-09-10',
    thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80',
    keyFormulas: ['∑F = 0 (สมดุล)', '∑F = ma', 'Action = -Reaction'],
    summaryPoints: [
      'ความเฉื่อยคือสมบัติการคงสภาพการเคลื่อนที่ของมวล',
      'แรงลัพธ์ที่ไม่เป็นศูนย์จะทำให้วัตถุเกิดความเร่งในทิศทางเดียวกับแรง',
      'แรงคู่กิริยา-ปฏิกิริยาเกิดขึ้นพร้อมกัน กระทำต่อวัตถุคนละก้อนกันเสมอ'
    ]
  },
  {
    id: 'vid_2',
    title: 'การเคลื่อนที่แบบโพรเจกไทล์และการประยุกต์แกน X-Y',
    topic: 'การเคลื่อนที่ใน 2 มิติ',
    description: 'เทคนิคการแยกคิดแนวราบ (ความเร็วคงที่ ux = u cos θ, sx = ux·t) และแนวดิ่ง (ความเร่งคงที่ g) จุดที่เด็กมักสับสน',
    videoUrl: 'https://www.youtube.com/embed/aRzkPjWc0_M',
    duration: '31:40 นาที',
    uploadedById: 'teacher_1',
    uploadedBy: 'อ. วิชัย ประเสริฐศักดิ์',
    uploadedAt: '2026-09-12',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
    keyFormulas: ['Sx = Ux · t', 'Vy = Uy - gt', 'H_max = Uy² / (2g)', 'R = (u² sin 2θ) / g'],
    summaryPoints: [
      'แนวราบไม่มีความเร่ง (ax = 0) ความเร็วคงที่ตลอดการเคลื่อนที่',
      'จุดสูงสุดความเร็วในแนวดิ่งจะเป็นศูนย์ (Vy = 0) แต่ยังมี Vx',
      'เวลาที่ใช้เคลื่อนที่ในแนวราบและแนวดิ่งมีค่าเท่ากัน'
    ]
  },
  {
    id: 'vid_3',
    title: 'คลื่นและปรากฏการณ์แทรกสอด-เลี้ยวเบนของแสง',
    topic: 'คลื่นและแสง',
    description: 'การทดลองสลิตคู่ของยัง (Young’s Double Slit Experiment) การคำนวณแถบมืด แถบสว่าง และความยาวคลื่นแสง',
    videoUrl: 'https://www.youtube.com/embed/Iuv6hY6zsd0',
    duration: '28:50 นาที',
    uploadedById: 'teacher_2',
    uploadedBy: 'อ. กนกวรรณ จันทร์เรือง',
    uploadedAt: '2026-09-14',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    keyFormulas: ['d sin θ = nλ (แถบสว่าง)', 'd(y/L) = nλ', 'v = fλ'],
    summaryPoints: [
      'คลื่นแสงแสดงสมบัติการแทรกสอดเมื่อผ่านช่องเปิดคู่ที่เป็นแหล่งกำเนิดอาพันธ์',
      'ระยะห่างระหว่างริ้วสว่างจะแปรผันตรงกับความยาวคลื่นและระยะห่างฉาก'
    ]
  },
  {
    id: 'vid_4',
    title: 'ไฟฟ้าสถิต: กฎของคูลอมบ์และสนามไฟฟ้า',
    topic: 'ไฟฟ้าและแม่เหล็ก',
    description: 'แรงกระทำระหว่างประจุไฟฟ้าสองประจุ เส้นสนามไฟฟ้า และการหาสนามไฟฟ้าลัพธ์ที่จุดกึ่งกลาง',
    videoUrl: 'https://www.youtube.com/embed/mdulnsOX5W0',
    duration: '22:10 นาที',
    uploadedById: 'teacher_2',
    uploadedBy: 'อ. กนกวรรณ จันทร์เรือง',
    uploadedAt: '2026-09-15',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    keyFormulas: ['F = k·|q1·q2| / r²', 'E = F / q', 'E = k·Q / r²'],
    summaryPoints: [
      'ประจุชนิดเดียวกันผลักกัน ประจุต่างชนิดกันดูดกัน',
      'ทิศทางของสนามไฟฟ้ากำหนดตามทิศของแรงที่กระทำต่อประจุบวกทดสอบ'
    ]
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz_1',
    title: 'แบบทดสอบเก็บคะแนน: กฎการเคลื่อนที่และแรงของนิวตัน',
    topic: 'กลศาสตร์',
    description: 'ทดสอบความเข้าใจเกี่ยวกับกฎของนิวตัน 3 ข้อ, แรงเสียดทาน, และการคำนวณความเร่ง',
    timeLimitMinutes: 15,
    createdById: 'teacher_1',
    createdBy: 'อ. วิชัย ประเสริฐศักดิ์',
    createdAt: '2026-09-11',
    questions: [
      {
        id: 'q1_1',
        question: 'ข้อใดอธิบาย "กฎข้อที่ 1 ของนิวตัน" (Law of Inertia) ได้ถูกต้องที่สุด?',
        formula: '∑F = 0 ⇒ a = 0',
        options: [
          'วัตถุจะเคลื่อนที่ด้วยความเร่งแปรผันตรงกับแรงลัพธ์',
          'ถ้าไม่มีแรงภายนอกมากระทำ วัตถุที่หยุดนิ่งจะยังคงหยุดนิ่ง หรือเคลื่อนที่ด้วยความเร็วคงที่ในแนวเส้นตรง',
          'ทุกแรงกิริยาย่อมมีแรงปฏิกิริยาขนาดเท่ากันทิศตรงข้ามเสมอ',
          'วัตถุทุกชนิดจะตกลงสู่พื้นโลกด้วยความเร่งเท่ากันเสมอโดยไม่ขึ้นกับมวล'
        ],
        correctIndex: 1,
        explanation: 'กฎข้อที่ 1 ของนิวตันกล่าวว่า วัตถุจะรักษาสภาพหยุดนิ่งหรือเคลื่อนที่ด้วยความเร็วสม่ำเสมอในแนวเส้นตรง เว้นแต่จะมีแรงลัพธ์ที่ไม่เป็นศูนย์มากระทำ (∑F = 0)'
      },
      {
        id: 'q1_2',
        question: 'วัตถุมวล 4 kg วางบนพื้นราบลื่น ถูกแรง 20 N ผลักในแนวราบ วัตถุนี้จะมีความเร่งเท่าใด?',
        formula: '∑F = ma',
        options: [
          '2 m/s²',
          '4 m/s²',
          '5 m/s²',
          '80 m/s²'
        ],
        correctIndex: 2,
        explanation: 'จากสมการ ∑F = ma ⇒ 20 N = (4 kg) × a ⇒ a = 20 / 4 = 5 m/s²'
      },
      {
        id: 'q1_3',
        question: 'ในการยิงปืน เมื่อกระสุนพุ่งไปข้างหน้า ตัวปืนจะถีบกลับมาด้านหลัง ปรากฏการณ์นี้สอดคล้องกับกฎข้อใด?',
        formula: 'F_action = -F_reaction',
        options: [
          'กฎข้อที่ 1 ของนิวตัน',
          'กฎข้อที่ 2 ของนิวตัน',
          'กฎข้อที่ 3 ของนิวตัน (Action = Reaction)',
          'กฎการอนุรักษ์ประจุไฟฟ้า'
        ],
        correctIndex: 2,
        explanation: 'แรงที่ปืนกระทำต่อลูกกระสุน (Action) เท่ากับแรงที่ลูกกระสุนดันปืนกลับไปข้างหลัง (Reaction) มีขนาดเท่ากันแต่มีทิศทางตรงกันข้าม เป็นไปตามกฎข้อ 3'
      },
      {
        id: 'q1_4',
        question: 'ถ้าชั่งน้ำหนักของคนในลิฟต์ที่กำลังเคลื่อนที่ "ลงด้วยความเร่ง a" ค่าน้ำหนักที่ตาชั่งอ่านได้จะมีค่าอย่างไร?',
        formula: 'N = m(g - a)',
        options: [
          'มากกว่าน้ำหนักจริง (N = m(g + a))',
          'น้อยกว่าน้ำหนักจริง (N = m(g - a))',
          'เท่ากับน้ำหนักจริงเสมอ (N = mg)',
          'อ่านค่าได้เป็นศูนย์ทันที'
        ],
        correctIndex: 1,
        explanation: 'เมื่อลิฟต์ลงด้วยความเร่ง a จากสมการ mg - N = ma จะได้ N = m(g - a) ซึ่งน้อยกว่าน้ำหนักจริง mg'
      }
    ]
  },
  {
    id: 'quiz_2',
    title: 'แบบทดสอบย่อย: การเคลื่อนที่แบบโพรเจกไทล์',
    topic: 'การเคลื่อนที่ใน 2 มิติ',
    description: 'ทดสอบความเร็วแนวราบและแนวดิ่ง มุมยิง 45 องศา และการวิเคราะห์จุดสูงสุด',
    timeLimitMinutes: 10,
    createdById: 'teacher_1',
    createdBy: 'อ. วิชัย ประเสริฐศักดิ์',
    createdAt: '2026-09-13',
    questions: [
      {
        id: 'q2_1',
        question: 'ในการเคลื่อนที่แบบโพรเจกไทล์ในอากาศ (ไม่คิดแรงต้านอากาศ) ข้อใดกล่าวถูกต้องที่สุดเกี่ยวกับความเร่ง?',
        formula: 'ax = 0 , ay = -g',
        options: [
          'มีทั้งความเร่งในแนวราบและความเร่งในแนวดิ่ง',
          'ความเร่งในแนวราบเป็นศูนย์ แต่มีความเร่งในแนวดิ่งเท่ากับค่า g คงตัวเสมอ',
          'ที่จุดสูงสุดของวิถีโค้ง ความเร่งของวัตถุจะเป็นศูนย์',
          'ความเร็วของวัตถุที่จุดสูงสุดเป็นศูนย์ทั้งแกน x และ y'
        ],
        correctIndex: 1,
        explanation: 'วัตถุมีเฉพาะแรงโน้มถ่วงของโลกกระทำในแนวดิ่ง จึงมีเพียง ay = g ชี้ลงล่าง ส่วนแนวราบไม่มีแรงกระทำ ax จึงเป็น 0'
      },
      {
        id: 'q2_2',
        question: 'มุมยิงกี่องศาทำให้วัตถุเคลื่อนที่ไปได้ระยะทางตกในแนวราบ (Range: R) ไกลที่สุดบนพื้นระดับเดียวกัน?',
        formula: 'R = (u² sin 2θ) / g',
        options: [
          '30 องศา',
          '45 องศา',
          '60 องศา',
          '90 องศา'
        ],
        correctIndex: 1,
        explanation: 'จากสูตร R = (u² sin 2θ) / g ค่า sin 2θ จะสูงสุดเมื่อ 2θ = 90° นั่นคือ θ = 45°'
      }
    ]
  }
];

export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'att_1',
    quizId: 'quiz_1',
    studentId: 'student_1',
    studentName: 'ด.ช. ณัฐวุฒิ สมบูรณ์',
    score: 4,
    totalQuestions: 4,
    percentage: 100,
    answers: [1, 2, 2, 1],
    completedAt: '2026-09-13 16:45'
  },
  {
    id: 'att_2',
    quizId: 'quiz_1',
    studentId: 'student_2',
    studentName: 'น.ส. วริศรา นิลพันธ์',
    score: 3,
    totalQuestions: 4,
    percentage: 75,
    answers: [1, 2, 2, 0],
    completedAt: '2026-09-14 14:10'
  }
];
