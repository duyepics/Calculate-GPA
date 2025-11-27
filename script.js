// Data State
let subjects = [];

// DOM Elements
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

const createEmptySubject = (idx = 0) => ({
  id: crypto.randomUUID(),
  name: ``,
  credits: 3,
  midTerm: 0,
  finalTerm: 0,
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
        <!-- Name -->
        <div class="md:col-span-4 flex flex-col">
          <label class="md:hidden text-xs font-semibold text-gray-500 mb-1">Tên môn học</label>
          <input type="text" data-id="${sub.id}" data-field="name" value="${sub.name}" placeholder="Môn học ${index + 1}" class="w-full bg-transparent text-gray-900 placeholder-gray-400 border-none focus:ring-0 p-0 font-medium input-field">
        </div>

        <!-- Credits -->
        <div class="md:col-span-2 flex flex-col">
          <label class="md:hidden text-xs font-semibold text-gray-500 mb-1">Số tín chỉ</label>
          <input type="number" min="0" data-id="${sub.id}" data-field="credits" value="${sub.credits === 0 && sub.name === '' ? '' : sub.credits}" placeholder="0" class="w-full bg-gray-50 md:bg-transparent rounded-lg md:rounded-none px-3 py-2 md:p-0 border border-gray-200 md:border-none focus:ring-2 md:focus:ring-0 focus:ring-blue-500 text-gray-900 text-center md:text-left input-field">
        </div>

        <!-- MidTerm -->
        <div class="md:col-span-2 flex flex-col">
          <label class="md:hidden text-xs font-semibold text-gray-500 mb-1">Điểm giữa kỳ</label>
          <input type="number" min="0" max="10" step="0.1" data-id="${sub.id}" data-field="midTerm" value="${sub.midTerm}" placeholder="0.0" class="w-full bg-gray-50 md:bg-transparent rounded-lg md:rounded-none px-3 py-2 md:p-0 border border-gray-200 md:border-none focus:ring-2 md:focus:ring-0 focus:ring-blue-500 text-gray-900 text-center md:text-left input-field">
        </div>

        <!-- FinalTerm -->
        <div class="md:col-span-3 flex flex-col relative">
          <label class="md:hidden text-xs font-semibold text-gray-500 mb-1">Điểm cuối kỳ</label>
          <div class="flex items-center gap-2">
            <input type="number" min="0" max="10" step="0.1" data-id="${sub.id}" data-field="finalTerm" value="${sub.finalTerm}" placeholder="0.0" class="w-full bg-gray-50 md:bg-transparent rounded-lg md:rounded-none px-3 py-2 md:p-0 border border-gray-200 md:border-none focus:ring-2 md:focus:ring-0 focus:ring-blue-500 text-gray-900 text-center md:text-left input-field">
            <button class="md:hidden p-2 text-gray-400 hover:text-red-500 transition-colors btn-delete" data-id="${sub.id}">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </div>

        <!-- Delete Desktop -->
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
    sub.name = `Môn ${i + 1}`;
    subjects.push(sub);
  }
  renderSubjects();
  // Reset results
  resultAvg4.textContent = "0.00";
  resultAvg10.textContent = "0.00";
  classificationBanner.classList.add('hidden');
};

const handleInput = (e) => {
  if (e.target.classList.contains('input-field')) {
    const id = e.target.dataset.id;
    const field = e.target.dataset.field;
    let value = e.target.value;
    
    // Find subject
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

// Event Listeners
btnGenerate.addEventListener('click', generateForm);
btnAddSubject.addEventListener('click', () => {
  subjects.push(createEmptySubject());
  renderSubjects();
});
btnCalculate.addEventListener('click', calculate);
subjectList.addEventListener('input', handleInput);
subjectList.addEventListener('click', handleClick);

// Init
generateForm();
