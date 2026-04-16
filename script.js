// Data State
let subjects = [];

// DOM Elements - Trang Tính GPA
const numSubjectsInput = document.getElementById('numSubjectsInput');
const btnGenerate = document.getElementById('btnGenerate');
const subjectList = document.getElementById('subjectList');
const emptyState = document.getElementById('emptyState');
const btnCalculate = document.getElementById('btnCalculate');
const btnAddSubject = document.getElementById('btnAddSubject');
const resultAvg4 = document.getElementById('resultAvg4');
const resultAvg10 = document.getElementById('resultAvg10');
const classificationBanner = document.getElementById('classificationBanner');
const classificationText = document.getElementById('classificationText');

// DOM Elements - Trang Tính Mục Tiêu
const btnCalculateTarget = document.getElementById('btnCalculateTarget');
const oldCredits = document.getElementById('oldCredits');
const oldGPA = document.getElementById('oldGPA');
const newCredits = document.getElementById('newCredits');
const targetGPA = document.getElementById('targetGPA');
const targetResultBox = document.getElementById('targetResultBox');
const targetResultText = document.getElementById('targetResultText');
const targetMessage = document.getElementById('targetMessage');

// --- Logic (Ported from logic.ts) ---

const getGradeCTUT = (score10) => {
  const roundedScore = Math.round(score10 * 10) / 10;
  if (roundedScore >= 9.5) return { gradeText: "A+", gpa4: 4.0 };
  else if (roundedScore >= 8.5) return { gradeText: "A", gpa4: 3.8 };
  else if (roundedScore >= 8.0) return { gradeText: "B+", gpa4: 3.5 };
  else if (roundedScore >= 7.0) return { gradeText: "B", gpa4: 3.0 };
  else if (roundedScore >= 6.5) return { gradeText: "C+", gpa4: 2.5 };
  else if (roundedScore >= 5.5) return { gradeText: "C", gpa4: 2.0 };
  else if (roundedScore >= 5.0) return { gradeText: "D+", gpa4: 1.5 };
  else if (roundedScore >= 4.0) return { gradeText: "D", gpa4: 1.0 };
  else return { gradeText: "F", gpa4: 0.0 };
};

const calculateSubjectResult = (subject) => {
  const mid = parseFloat(subject.midTerm) || 0;
  const final = parseFloat(subject.finalTerm) || 0;
  const total = 0.4 * mid + 0.6 * final;
  const { gradeText, gpa4 } = getGradeCTUT(total);
  return { total10: total, gradeText, gpa4 };
};

const calculateOverall = (subjects) => {
  let totalCredits = 0;
  let weightedSum10 = 0;
  let weightedSum4 = 0;
  subjects.forEach(sub => {
    const credits = parseFloat(sub.credits) || 0;
    if (credits > 0) {
      const res = calculateSubjectResult(sub);
      weightedSum10 += res.total10 * credits;
      weightedSum4 += res.gpa4 * credits;
      totalCredits += credits;
    }
  });
  if (totalCredits === 0) {
    return { avg10: 0, avg4: 0, totalCredits: 0 };
  }
  return {
    avg10: weightedSum10 / totalCredits,
    avg4: weightedSum4 / totalCredits,
    totalCredits
  };
};

const getClassification = (gpa4) => {
  if (gpa4 >= 3.6) return { label: 'Xuất sắc', className: 'bg-green-50 border-green-200 text-green-800' };
  if (gpa4 >= 3.2) return { label: 'Giỏi', className: 'bg-blue-50 border-blue-200 text-blue-800' };
  if (gpa4 >= 2.5) return { label: 'Khá', className: 'bg-yellow-50 border-yellow-200 text-yellow-800' };
  if (gpa4 >= 2.0) return { label: 'Trung bình', className: 'bg-orange-50 border-orange-200 text-orange-800' };
  return { label: 'Yếu', className: 'bg-red-50 border-red-200 text-red-800' };
};

// --- App Functions ---

const createEmptySubject = () => ({
    id: crypto.randomUUID(),
    name: "",
    credits: "", // Để trống thay vì 3
    midTerm: "", // Để trống thay vì 0
    finalTerm: "", // Để trống thay vì 0
});

const renderSubjects = () => {
  subjectList.innerHTML = '';
  if (subjects.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    subjects.forEach((sub, index) => {
      const row = document.createElement('div');
      row.className = 'grid grid-cols-1 md:grid-cols-12 gap-4 py-4 border-b border-gray-100 items-center last:border-0 hover:bg-gray-50 transition-colors px-4';
      row.innerHTML = `
<div class="md:col-span-4 flex flex-col">
<label class="md:hidden text-xs font-semibold text-gray-500 mb-1">Tên môn học</label>
<input type="text" data-id="${sub.id}" data-field="name" value="${sub.name}" placeholder="Môn học ${index + 1}" class="w-full bg-transparent text-gray-900 placeholder-gray-400 border-none focus:ring-0 p-0 font-medium input-field">
</div>
<div class="md:col-span-2 flex flex-col">
<label class="md:hidden text-xs font-semibold text-gray-500 mb-1">Số tín chỉ</label>
<input type="number" min="0" data-id="${sub.id}" data-field="credits" value="${sub.credits === 0 && sub.name === '' ? '' : sub.credits}" placeholder="0" class="w-full bg-gray-50 md:bg-transparent rounded-lg md:rounded-none px-3 py-2 md:p-0 border border-gray-200 md:border-none focus:ring-2 md:focus:ring-0 focus:ring-blue-500 text-gray-900 text-center md:text-left input-field">
</div>
<div class="md:col-span-2 flex flex-col">
<label class="md:hidden text-xs font-semibold text-gray-500 mb-1">Điểm giữa kỳ</label>
<input type="number" min="0" max="10" step="0.1" data-id="${sub.id}" data-field="midTerm" value="${sub.midTerm}" placeholder="0.0" class="w-full bg-gray-50 md:bg-transparent rounded-lg md:rounded-none px-3 py-2 md:p-0 border border-gray-200 md:border-none focus:ring-2 md:focus:ring-0 focus:ring-blue-500 text-gray-900 text-center md:text-left input-field">
</div>
<div class="md:col-span-3 flex flex-col relative">
<label class="md:hidden text-xs font-semibold text-gray-500 mb-1">Điểm cuối kỳ</label>
<div class="flex items-center gap-2">
<input type="number" min="0" max="10" step="0.1" data-id="${sub.id}" data-field="finalTerm" value="${sub.finalTerm}" placeholder="0.0" class="w-full bg-gray-50 md:bg-transparent rounded-lg md:rounded-none px-3 py-2 md:p-0 border border-gray-200 md:border-none focus:ring-2 md:focus:ring-0 focus:ring-blue-500 text-gray-900 text-center md:text-left input-field">
<button class="md:hidden p-2 text-gray-400 hover:text-red-500 transition-colors btn-delete" data-id="${sub.id}">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
</button>
</div>
</div>
<div class="hidden md:flex md:col-span-1 justify-end">
<button class="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 btn-delete" data-id="${sub.id}" title="Xóa môn">
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
</button>
</div>
`;
      subjectList.appendChild(row);
    });
  }
};

const generateForm = () => {
  const count = parseInt(numSubjectsInput.value) || 3;
  subjects = [];
  for (let i = 0; i < count; i++) {
    const sub = createEmptySubject();
    
    subjects.push(sub);
  }
  renderSubjects();
  resultAvg4.textContent = "0.00";
  resultAvg10.textContent = "0.00";
  classificationBanner.classList.add('hidden');
};

const handleInput = (e) => {
  if (e.target.classList.contains('input-field')) {
    const id = e.target.dataset.id;
    const field = e.target.dataset.field;
    let value = e.target.value;
    const subject = subjects.find(s => s.id === id);
    if (subject) {
      subject[field] = value;
    }
  }
};

const handleClick = (e) => {
  const btnDelete = e.target.closest('.btn-delete');
  if (btnDelete) {
    const id = btnDelete.dataset.id;
    subjects = subjects.filter(s => s.id !== id);
    renderSubjects();
  }
};

const calculate = () => {
  const results = calculateOverall(subjects);
  resultAvg4.textContent = results.avg4.toFixed(2);
  resultAvg10.textContent = results.avg10.toFixed(2);
  if (results.totalCredits > 0) {
    const cls = getClassification(results.avg4);
    classificationText.textContent = cls.label;
    classificationBanner.className = `rounded-2xl p-5 flex items-center justify-between shadow-sm border ${cls.className}`;
    classificationBanner.classList.remove('hidden');
  } else {
    classificationBanner.classList.add('hidden');
  }
};

// --- Khởi tạo trang Tính GPA ---
if (btnGenerate) {
  btnGenerate.addEventListener('click', generateForm);
  btnAddSubject.addEventListener('click', () => {
    subjects.push(createEmptySubject());
    renderSubjects();
  });
  btnCalculate.addEventListener('click', calculate);
  subjectList.addEventListener('input', handleInput);
  subjectList.addEventListener('click', handleClick);


  // THÊM MỚI: Bắt sự kiện phím Enter
  subjectList.addEventListener('keydown', (e) => {
      // Chỉ xử lý khi bấm Enter và đang đứng ở trong các ô nhập liệu
      if (e.key === 'Enter' && e.target.classList.contains('input-field')) {
          e.preventDefault(); // Ngăn trình duyệt tự động submit hoặc scroll
          
          // Lấy tất cả các ô nhập liệu trên màn hình
          const inputs = Array.from(subjectList.querySelectorAll('.input-field'));
          const index = inputs.indexOf(e.target);
          
          if (index > -1) {
              // Nếu chưa phải là ô cuối cùng -> Nhảy sang ô tiếp theo
              if (index < inputs.length - 1) {
                  inputs[index + 1].focus();
              } 
              // Nếu là ô cuối cùng (Cuối kỳ) -> Thêm dòng mới và nhảy xuống dòng mới
              else {
                  btnAddSubject.click();
                  // Đợi HTML vẽ xong dòng mới rồi đưa con trỏ chuột vào ô Tên môn
                  setTimeout(() => {
                      const newInputs = subjectList.querySelectorAll('.input-field');
                      // Lùi lại 4 ô (Tên, Tín chỉ, Giữa kỳ, Cuối kỳ) để trỏ đúng vào ô Tên môn mới
                      newInputs[newInputs.length - 4].focus(); 
                  }, 10);
              }
          }
      }
  });
  
  generateForm();
}

// --- Khởi tạo trang Tính Mục Tiêu ---
if (btnCalculateTarget) {
  btnCalculateTarget.addEventListener('click', () => {
    const oldC = parseFloat(oldCredits.value);
    const oldG = parseFloat(oldGPA.value);
    const newC = parseFloat(newCredits.value);
    const targetG = parseFloat(targetGPA.value);
    if (isNaN(oldC) || isNaN(oldG) || isNaN(newC) || isNaN(targetG)) {
      alert("Vui lòng nhập đầy đủ các thông số để tính điểm mục tiêu!");
      return;
    }
    const neededGPA = (targetG * (oldC + newC) - oldG * oldC) / newC;
    const roundedNeeded = neededGPA.toFixed(2);
    targetResultBox.classList.remove('hidden');
    if (neededGPA > 4.0) {
      targetResultBox.className = 'mt-6 p-6 rounded-xl text-center border border-red-200 bg-red-50';
      targetResultText.className = 'text-4xl font-bold text-red-600';
      targetResultText.textContent = roundedNeeded;
      targetMessage.className = 'mt-3 text-sm font-medium text-red-600';
      targetMessage.textContent = 'Bất khả thi! Điểm yêu cầu vượt quá thang điểm 4.0.';
    } else if (neededGPA < 0) {
      targetResultBox.className = 'mt-6 p-6 rounded-xl text-center border border-green-200 bg-green-50';
      targetResultText.className = 'text-4xl font-bold text-green-600';
      targetResultText.textContent = '0.00';
      targetMessage.className = 'mt-3 text-sm font-medium text-green-600';
      targetMessage.textContent = 'Dư sức! Bạn có rớt vài môn vẫn đạt được mục tiêu này.';
    } else {
      targetResultBox.className = 'mt-6 p-6 rounded-xl text-center border border-blue-200 bg-blue-50';
      targetResultText.className = 'text-4xl font-bold text-blue-600';
      targetResultText.textContent = roundedNeeded;
      targetMessage.className = 'mt-3 text-sm font-medium text-blue-600';
      targetMessage.textContent = 'Nằm trong khả năng, cố gắng lên nhé!';
    }
  });
}

// --- NAVBAR INJECTION ---
const renderNavbar = () => {
  const navbarContainer = document.getElementById('app-navbar');
  if (!navbarContainer) return; // Nếu trang không có div này thì bỏ qua
  const path = window.location.pathname;
  const isGpa = path.includes('tinh-gpa.html');
  const isTarget = path.includes('tinh-muc-tieu.html');
  const isConvert = path.includes('bang-quy-doi.html');
  const activeClass = "whitespace-nowrap px-4 py-2.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold transition-colors";
  const inactiveClass = "whitespace-nowrap px-4 py-2.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 text-sm font-medium transition-colors";
  const navHTML = `
<nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full mb-8">
<div class="max-w-6xl mx-auto px-4">
<div class="flex justify-between items-center h-16">
<a href="index.html" class="flex items-center gap-2 font-extrabold text-lg sm:text-xl text-blue-600 hover:opacity-80 transition-opacity">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
<span class="hidden sm:block tracking-tight">Home</span>
</a>
<div class="flex items-center space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar">
<a href="tinh-gpa.html" class="${isGpa ? activeClass : inactiveClass}">Tính ĐTB Học Kỳ</a>
<a href="tinh-muc-tieu.html" class="${isTarget ? activeClass : inactiveClass}">Tính Mục Tiêu</a>
<a href="bang-quy-doi.html" class="${isConvert ? activeClass : inactiveClass}">Bảng Quy Đổi</a>
</div>
</div>
</div>
</nav>
`;
  navbarContainer.innerHTML = navHTML;
};
// Chạy hàm vẽ Navbar ngay khi tải trang
renderNavbar();

// ... (Đoạn code cũ của bạn bắt đầu từ đây: let subjects = []; ...)
