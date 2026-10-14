(() => {
  "use strict";

  const PASS_MARK = 33;
  const STORAGE_KEY = "edutrack-students-v1";
  const avatarThemes = [
    ["#eeecff", "#5e51d9"], ["#e7f6ff", "#2879a9"], ["#fff0e6", "#bb6b36"],
    ["#e4f7ee", "#21845e"], ["#ffeaf0", "#bd4c70"], ["#f2edff", "#7853b9"]
  ];

  const starterStudents = [
    { id: "s1", name: "Aanya Sharma", roll: "STU-001", className: "10-A", marks: 86 },
    { id: "s2", name: "Rohan Verma", roll: "STU-002", className: "10-A", marks: 72 },
    { id: "s3", name: "Meera Singh", roll: "STU-003", className: "12-A", marks: 91 },
    { id: "s4", name: "Arjun Kumar", roll: "STU-004", className: "10-B", marks: 28 },
    { id: "s5", name: "Diya Patel", roll: "STU-005", className: "12-A", marks: 64 },
    { id: "s6", name: "Kabir Das", roll: "STU-006", className: "10-B", marks: 31 },
    { id: "s7", name: "Ishita Roy", roll: "STU-007", className: "10-A", marks: 78 },
    { id: "s8", name: "Vivaan Gupta", roll: "STU-008", className: "12-A", marks: 98 }
  ];

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    tableBody: $("#studentTableBody"),
    search: $("#searchInput"),
    statusFilter: $("#statusFilter"),
    classFilter: $("#classFilter"),
    sortFilter: $("#sortFilter"),
    emptyState: $("#emptyState"),
    recordCount: $("#recordCount"),
    total: $("#totalStudents"),
    passed: $("#passedStudents"),
    failed: $("#failedStudents"),
    passRate: $("#passRate"),
    average: $("#averageMarks"),
    navCount: $("#navStudentCount"),
    modal: $("#studentModal"),
    form: $("#studentForm"),
    modalTitle: $("#modalTitle"),
    studentId: $("#studentId"),
    name: $("#studentName"),
    roll: $("#rollNumber"),
    className: $("#studentClass"),
    marks: $("#studentMarks"),
    formError: $("#formError"),
    saveButton: $("#saveStudentBtn"),
    toast: $("#toast"),
    sidebar: $("#sidebar")
  };

  let students = loadStudents();
  let toastTimeout;

  function loadStudents() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) return [...starterStudents];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) throw new Error("Saved data is invalid.");
      return parsed.filter(isValidStudent);
    } catch (error) {
      console.warn("Could not load saved student data:", error);
      return [...starterStudents];
    }
  }

  function isValidStudent(student) {
    return student && typeof student.id === "string" &&
      typeof student.name === "string" && typeof student.roll === "string" &&
      ["10-A", "10-B", "12-A"].includes(student.className) &&
      Number.isInteger(student.marks) && student.marks >= 0 && student.marks <= 100;
  }

  function saveStudents() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      return true;
    } catch (error) {
      console.error("Could not save student data:", error);
      showToast("Could not save data. Check browser storage settings.");
      return false;
    }
  }

  function getResult(marks) {
    return marks >= PASS_MARK ? "pass" : "fail";
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(part => part[0].toUpperCase()).join("");
  }

  function filteredStudents() {
    const searchTerm = elements.search.value.trim().toLowerCase();
    const status = elements.statusFilter.value;
    const className = elements.classFilter.value;

    const visibleStudents = students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm) ||
        student.roll.toLowerCase().includes(searchTerm);
      const matchesStatus = status === "all" || getResult(student.marks) === status;
      const matchesClass = className === "all" || student.className === className;
      return matchesSearch && matchesStatus && matchesClass;
    });

    visibleSort(visibleStudents, elements.sortFilter.value);
    return visibleStudents;
  }

  function visibleSort(records, sortMode) {
    records.sort((a, b) => {
      if (sortMode === "name-desc") return b.name.localeCompare(a.name);
      if (sortMode === "marks-desc") return b.marks - a.marks || a.name.localeCompare(b.name);
      if (sortMode === "marks-asc") return a.marks - b.marks || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });
  }

  function renderTable() {
    const visibleStudents = filteredStudents();
    elements.tableBody.innerHTML = visibleStudents.map((student, index) => {
      const theme = avatarThemes[index % avatarThemes.length];
      const result = getResult(student.marks);
      const resultLabel = result === "pass" ? "Pass" : "Fail";
      return `
        <tr>
          <td>
            <div class="student-cell">
              <div class="student-avatar" style="--avatar-bg:${theme[0]};--avatar-fg:${theme[1]}">${escapeHTML(initials(student.name))}</div>
              <div><div class="student-name">${escapeHTML(student.name)}</div><div class="student-email">Student record</div></div>
            </div>
          </td>
          <td><span class="roll">${escapeHTML(student.roll)}</span></td>
          <td><span class="class-pill">${escapeHTML(student.className.replace("-", " "))}</span></td>
          <td><div class="marks-track"><span class="marks">${student.marks}/100</span><span class="mini-track"><span style="width:${student.marks}%"></span></span></div></td>
          <td><span class="result-badge ${result}"><span>${result === "pass" ? "✓" : "×"}</span>${resultLabel}</span></td>
          <td><div class="row-actions">
            <button class="icon-btn" data-action="edit" data-id="${escapeHTML(student.id)}" aria-label="Edit ${escapeHTML(student.name)}" title="Edit">✎</button>
            <button class="icon-btn delete" data-action="delete" data-id="${escapeHTML(student.id)}" aria-label="Delete ${escapeHTML(student.name)}" title="Delete">⌫</button>
          </div></td>
        </tr>`;
    }).join("");

    const hasResults = visibleStudents.length > 0;
    elements.emptyState.classList.toggle("hidden", hasResults);
    elements.tableBody.closest("table").classList.toggle("hidden", !hasResults);
    elements.recordCount.textContent = `Showing ${visibleStudents.length} of ${students.length} students`;
  }

  function renderStats() {
    const total = students.length;
    const passed = students.filter(student => getResult(student.marks) === "pass").length;
    const failed = total - passed;
    const average = total ? students.reduce((sum, student) => sum + student.marks, 0) / total : 0;

    elements.total.textContent = total;
    elements.passed.textContent = passed;
    elements.failed.textContent = failed;
    elements.passRate.textContent = `${total ? Math.round((passed / total) * 100) : 0}%`;
    elements.average.innerHTML = `${average.toFixed(1)}<span class="value-unit">/100</span>`;
    elements.navCount.textContent = total;
  }

  function render() {
    renderStats();
    renderTable();
  }

  function openModal(student = null) {
    elements.form.reset();
    elements.formError.classList.add("hidden");
    elements.studentId.value = student?.id || "";
    elements.modalTitle.textContent = student ? "Edit student" : "Add student";
    elements.saveButton.textContent = student ? "Save changes" : "Save student";
    if (student) {
      elements.name.value = student.name;
      elements.roll.value = student.roll;
      elements.className.value = student.className;
      elements.marks.value = student.marks;
    } else {
      elements.className.value = "10-A";
    }
    elements.modal.classList.remove("hidden");
    elements.name.focus();
  }

  function closeModal() {
    elements.modal.classList.add("hidden");
    elements.formError.classList.add("hidden");
  }

  function showFormError(message) {
    elements.formError.textContent = message;
    elements.formError.classList.remove("hidden");
  }

  function showToast(message) {
    window.clearTimeout(toastTimeout);
    elements.toast.textContent = message;
    elements.toast.classList.remove("hidden");
    toastTimeout = window.setTimeout(() => elements.toast.classList.add("hidden"), 2800);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const id = elements.studentId.value;
    const name = elements.name.value.trim().replace(/\s+/g, " ");
    const roll = elements.roll.value.trim().toUpperCase();
    const className = elements.className.value;
    const rawMarks = elements.marks.value;

    if (name.length < 2) return showFormError("Please enter a valid student name.");
    if (!roll) return showFormError("Please enter a roll number.");
    if (rawMarks === "" || !Number.isInteger(Number(rawMarks)) || Number(rawMarks) < 0 || Number(rawMarks) > 100) {
      return showFormError("Marks must be a whole number between 0 and 100.");
    }
    if (students.some(student => student.roll.toLowerCase() === roll.toLowerCase() && student.id !== id)) {
      return showFormError("This roll number already exists. Please use a unique roll number.");
    }

    const record = { id: id || `student-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`, name, roll, className, marks: Number(rawMarks) };
    if (id) {
      students = students.map(student => student.id === id ? record : student);
    } else {
      students.push(record);
    }

    if (!saveStudents()) return;
    render();
    closeModal();
    showToast(id ? "Student record updated." : "Student added successfully.");
  }

  function handleTableAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const student = students.find(item => item.id === button.dataset.id);
    if (!student) return;

    if (button.dataset.action === "edit") {
      openModal(student);
      return;
    }
    if (button.dataset.action === "delete") {
      const confirmed = window.confirm(`Delete the record for ${student.name}? This cannot be undone.`);
      if (!confirmed) return;
      students = students.filter(item => item.id !== student.id);
      if (saveStudents()) {
        render();
        showToast("Student record deleted.");
      }
    }
  }

  function exportCSV() {
    const rows = [
      ["Name", "Roll Number", "Class", "Marks", "Result"],
      ...filteredStudents().map(student => [
        student.name, student.roll, student.className.replace("-", " "),
        student.marks, getResult(student.marks).toUpperCase()
      ])
    ];
    const csv = rows.map(row => row.map(value => {
      const safeValue = String(value).replace(/"/g, '""');
      return `"${safeValue}"`;
    }).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-results.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("CSV export downloaded.");
  }

  $("#addStudentBtn").addEventListener("click", () => openModal());
  $("#closeModalBtn").addEventListener("click", closeModal);
  $("#cancelModalBtn").addEventListener("click", closeModal);
  elements.form.addEventListener("submit", handleSubmit);
  elements.tableBody.addEventListener("click", handleTableAction);
  elements.search.addEventListener("input", renderTable);
  elements.statusFilter.addEventListener("change", renderTable);
  elements.classFilter.addEventListener("change", renderTable);
  $("#exportBtn").addEventListener("click", exportCSV);
  elements.sortFilter.addEventListener("change", renderTable);
  $("#themeToggle").addEventListener("click", () => {
    const darkModeEnabled = document.body.classList.toggle("dark-mode");
    try { localStorage.setItem("edutrack-theme", darkModeEnabled ? "dark" : "light"); } catch (_) {}
    $("#themeToggle").innerHTML = darkModeEnabled ? "☀ <span>Light mode</span>" : "☾ <span>Dark mode</span>";
    $("#themeToggle").setAttribute("aria-label", darkModeEnabled ? "Switch to light mode" : "Switch to dark mode");
  });
  try {
    if (localStorage.getItem("edutrack-theme") === "dark") {
      document.body.classList.add("dark-mode");
      $("#themeToggle").innerHTML = "☀ <span>Light mode</span>";
      $("#themeToggle").setAttribute("aria-label", "Switch to light mode");
    }
  } catch (_) {}
  $("#resetFiltersBtn").addEventListener("click", () => {
    elements.search.value = "";
    elements.statusFilter.value = "all";
    elements.classFilter.value = "all";
    elements.sortFilter.value = "name-asc";
    renderTable();
  });
  $("#mobileMenu").addEventListener("click", () => elements.sidebar.classList.toggle("open"));
  elements.modal.addEventListener("click", event => {
    if (event.target === elements.modal) closeModal();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !elements.modal.classList.contains("hidden")) closeModal();
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      elements.search.focus();
    }
  });

  render();
})();
