document.addEventListener("DOMContentLoaded", function () {
  const totalQuestions = 20;
  const questionsPerPage = 10;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);
  let currentPage = 1;

  // Initialize answers array with the correct size, filled with undefined
  let answers = Array.from({ length: totalPages }, () =>
    new Array(questionsPerPage).fill(undefined)
  );

  // DOM Elements
  const progressBar = document.getElementById("progress-bar");
  const progressPercent = document.getElementById("progress-percent");
  const currentStep = document.getElementById("current-step");
  const totalStepsEl = document.getElementById("total-steps");
  const questionContent = document.getElementById("question-content");
  const backBtn = document.getElementById("back-btn");
  const nextBtn = document.getElementById("next-btn");
  const questionNumber = document.getElementById("question-number");
  const answersSection = document.getElementById("answers-section");
  const mainTitle = document.querySelector("h1");
  const progressContainer = document.querySelector(".col-9");
  const questionCard = document.getElementById("question-card");
  const navButtonsContainer = backBtn.parentElement;
  const disclaimerText = document.querySelector("p.small.text-muted.mt-3");

  const questionData = [
    [
      "Apakah anda sering mengalami sakit kepala?",
      "Apakah Anda selalu kurang nafsu makan?",
      "Apakah tidur anda kurang nyenyak?",
      "Apakah anda merasa takut?",
      "Apakah tangan Anda gemetar?",
      "Apakah Anda merasa gugup, tegang, atau khawatir?",
      "Apakah pencernaan Anda kurang baik?",
      "Apakah Anda merasa kesulitan untuk berpikir secara jernih?",
      "Apakah Anda merasa kurang bahagia?",
      "Apakah Anda merasa hidup ini tidak bernilai?",
    ],
    [
      "Apakah Anda merasa tidak ada harapan?",
      "Apakah Anda merasa kehilangan minat pada hal-hal yang dulu menyenangkan?",
      "Apakah Anda merasa mudah tersinggung atau marah?",
      "Apakah Anda merasa cemas tentang kesehatan Anda?",
      "Apakah Anda merasa kesepian?",
      "Apakah Anda merasa tidak mampu mengatasi masalah sehari-hari?",
      "Apakah Anda merasa sulit tidur karena pikiran yang mengganggu?",
      "Apakah Anda merasa tidak nyaman di tempat umum?",
      "Apakah Anda merasa tertekan karena pekerjaan atau studi?",
      "Apakah Anda merasa sulit untuk menikmati aktivitas yang biasanya Anda sukai?",
    ],
  ];

  function setupQuiz() {
    totalStepsEl.textContent = totalPages;
    loadQuestions();
  }

  function loadQuestions() {
    const questions = questionData[currentPage - 1];
    const pageAnswers = answers[currentPage - 1];

    questionContent.innerHTML = questions
      .map((question, index) => {
        const currentAnswer = pageAnswers[index];
        const yesActiveClass = currentAnswer === 1 ? "active" : "";
        const noActiveClass = currentAnswer === 0 ? "active" : "";

        return `
          <div class="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center mb-3" id="question-row-${index}">
            <span class="mb-2 mb-md-0">${
              (currentPage - 1) * questionsPerPage + index + 1
            }. ${question}</span>
            <div class="flex-shrink-0">
              <button class="btn btn-outline-secondary btn-sm ${yesActiveClass}" data-answer="yes" data-index="${index}">Ya</button>
              <button class="btn btn-outline-secondary btn-sm ${noActiveClass}" data-answer="no" data-index="${index}">Tidak</button>
            </div>
          </div>
        `;
      })
      .join("");

    updateUI();
  }

  function selectAnswer(questionIndex, answer) {
    const questionRow = document.getElementById(
      `question-row-${questionIndex}`
    );
    const buttons = questionRow.querySelectorAll(".btn");
    buttons.forEach((button) => button.classList.remove("active"));

    const selectedButton = questionRow.querySelector(
      `button[data-answer="${answer}"]`
    );
    selectedButton.classList.add("active");

    answers[currentPage - 1][questionIndex] = answer === "yes" ? 1 : 0;
    updateUI();
  }

  questionContent.addEventListener("click", function (event) {
    const target = event.target;
    if (target.matches("button[data-answer]")) {
      const questionIndex = parseInt(target.dataset.index, 10);
      const answer = target.dataset.answer;
      selectAnswer(questionIndex, answer);
    }
  });

  function updateUI() {
    updateButtons();
    updateQuestionLabel();
    updateProgress();
  }

  function updateButtons() {
    const allAnswered = answers[currentPage - 1].every(
      (answer) => answer !== undefined
    );
    nextBtn.disabled = !allAnswered;
    backBtn.disabled = currentPage === 1;

    if (currentPage === totalPages) {
      nextBtn.textContent = "Lihat Hasil";
    } else {
      nextBtn.textContent = "Berikutnya";
    }
  }

  function updateQuestionLabel() {
    const startQuestion = (currentPage - 1) * questionsPerPage + 1;
    const endQuestion = Math.min(
      currentPage * questionsPerPage,
      totalQuestions
    );
    questionNumber.textContent = `${startQuestion}-${endQuestion} dari ${totalQuestions}`;
  }

  function updateProgress() {
    const progress = ((currentPage - 1) / totalPages) * 100;
    const answeredOnPage = answers[currentPage - 1].filter(
      (a) => a !== undefined
    ).length;
    const pageProgress = (answeredOnPage / questionsPerPage / totalPages) * 100;
    const totalProgress = progress + pageProgress;

    progressBar.style.width = `${totalProgress}%`;
    progressPercent.textContent = `${Math.round(totalProgress)}%`;
    currentStep.textContent = currentPage;
  }

  function displayResults() {
    let yesCount = 0;
    // Flatten the 2D array and count the 'yes' answers (value 1)
    answers.flat().forEach((answer) => {
      if (answer === 1) yesCount++;
    });

    // Determine recommendation based on score. A common threshold for SRQ-20 is 8.
    let recommendationText = "";
    let alertClass = "";
    if (yesCount >= 8) {
      recommendationText = "Anda butuh evaluasi psikiatrik lebih lanjut";
      alertClass = "alert-warning";
    } else {
      recommendationText =
        "Skor Anda tidak mengindikasikan adanya distres psikologis yang signifikan saat ini. Tetap jaga kesehatan mental Anda.";
      alertClass = "alert-success";
    }

    // The new result layout provided by the user
    const resultLayoutHTML = `
    <div class="row">
        <h1 class="fw-bold">Hasil Screening - SRQ-20</h1>
        <div class="col-lg-8 col-sm-12 mb-3">
          <div class="card">
            <div class="card-body">
              <h3 class="card-title">Ringkasan</h3>
              <div class="row">
                <div class="col-md-8">
                  <p><strong>Skor SRQ-20:</strong> ${yesCount} / ${totalQuestions}</p>
                  <div class="alert ${alertClass}" role="alert">
                    ${recommendationText}
                  </div>
                  <p>
                    <strong>Saran awal:</strong> coba latihan pernapasan 4-7-8,
                    jurnal emosi, dan kelola prioritas. Pertimbangkan konsultasi
                    bila keluhan menetap &gt;2 minggu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kolom untuk catatan & privasi -->
        <div class="col-lg-4 col-sm-12 mb-3">
          <div class="card">
            <div class="card-body">
              <h3>Langkah Selanjutnya</h3>
              <button class="btn btn-primary mb-2 w-100 fw-bold p-2" onclick="window.location.href='konsultasi.html'">
                Buat Janji Konsultasi
              </button>
              <button class="btn btn-success mb-2 w-100 fw-bold p-2" onclick="window.location.href='komunitas.html'">
                Gabung Komunitas
              </button>
              <button class="btn btn-info mb-2 w-100 fw-bold p-2" style="color: #fff" onclick="window.location.href='penyedia.html'">
                Penyedia Layanan Kesehatan Mental Terdekat
              </button>
              <button class="btn btn-danger mb-2 w-100 fw-bold p-2">
                Telpon Darurat 119 ext 8
              </button>
              <button class="btn btn-secondary mb-2 w-100 fw-bold p-2" id="download-pdf-btn">
                Download Hasil PDF
              </button>
            </div>
          </div>
        </div>
        <div class="col-lg-12 mt-4">
        <div class="card">
          <div class="card-body">
            <h3>Catatan &amp; Privasi</h3>
            <ul>
              <li>
                Hasil ini bersifat indikatif (bukan diagnosis). Untuk
                penilaian klinis dan penanganan yang lebih tepat,
                konsultasikan dengan profesional.
              </li>
              <li>
                Dalam kondisi krisis (pikiran untuk menyakiti diri sendiri /
                orang lain), hubungi 119 ext 8 (layanan tidak berbayar).
              </li>
            </ul>
          </div>
        </div>
    </div>
    </div>
    `;

    // Hide quiz elements
    mainTitle.style.display = "none";
    mainTitle.nextElementSibling.style.display = "none"; // Hides the "Jawab Ya/Tidak..." paragraph
    progressContainer.style.display = "none";
    questionCard.style.display = "none";
    navButtonsContainer.style.display = "none";
    disclaimerText.style.display = "none";

    // Display the new result layout
    answersSection.innerHTML = resultLayoutHTML;

    // Add event listener to the newly created download button
    document
      .getElementById("download-pdf-btn")
      .addEventListener("click", generatePdfReport);
  }

  function generatePdfReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 15; // Initial Y position, leaving some top margin
    const margin = 10; // Left/right margin
    const lineHeight = 7; // Approximate line height
    const maxLineWidth = doc.internal.pageSize.width - 2 * margin;

    // Calculate yesCount and recommendation again for self-containment
    let yesCount = 0;
    answers.flat().forEach((answer) => {
      if (answer === 1) yesCount++;
    });

    let recommendationText = "";
    if (yesCount >= 8) {
      recommendationText = "Anda butuh evaluasi psikiatrik lebih lanjut";
    } else {
      recommendationText =
        "Skor Anda tidak mengindikasikan adanya distres psikologis yang signifikan saat ini. Tetap jaga kesehatan mental Anda.";
    }

    // Title
    doc.setFontSize(20);
    doc.text("Hasil Screening SRQ-20", margin, y);
    y += 15;

    // Summary
    doc.setFontSize(12);
    doc.text(`Skor SRQ-20: ${yesCount} / ${totalQuestions}`, margin, y);
    y += lineHeight;
    doc.text(`Rekomendasi: ${recommendationText}`, margin, y);
    y += 15;

    // Questions and Answers
    doc.setFontSize(14);
    doc.text("Detail Jawaban:", margin, y);
    y += 10;

    doc.setFontSize(10); // Smaller font for questions and answers
    answers.forEach((pageAnswers, pageIndex) => {
      pageAnswers.forEach((answer, questionIndex) => {
        const questionNum = pageIndex * questionsPerPage + questionIndex + 1;
        const questionText = questionData[pageIndex][questionIndex];
        const userAnswer = answer === 1 ? "Ya" : "Tidak";

        const line = `${questionNum}. ${questionText}: ${userAnswer}`;
        const splitText = doc.splitTextToSize(line, maxLineWidth); // Handle long lines

        if (
          y + splitText.length * lineHeight >
          doc.internal.pageSize.height - margin
        ) {
          // Check for page break
          doc.addPage();
          y = margin; // Reset Y for new page
        }
        doc.text(splitText, margin, y);
        y += splitText.length * lineHeight; // Increment Y based on number of lines
      });
    });

    // Disclaimer
    y += 10;
    if (y + 3 * lineHeight > doc.internal.pageSize.height - margin) {
      // Estimate space for disclaimer
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(10);
    doc.text("Catatan & Privasi:", margin, y);
    y += lineHeight;
    doc.text(
      doc.splitTextToSize(
        "- Hasil ini bersifat indikatif (bukan diagnosis). Untuk penilaian klinis dan penanganan yang lebih tepat, konsultasikan dengan profesional.",
        maxLineWidth
      ),
      margin,
      y
    );
    y += 2 * lineHeight; // Adjust for multiline text
    doc.text(
      doc.splitTextToSize(
        "- Dalam kondisi krisis (pikiran untuk menyakiti diri sendiri / orang lain), hubungi 119 ext 8 (layanan tidak berbayar).",
        maxLineWidth
      ),
      margin,
      y
    );

    doc.save("Hasil_Screening_SRQ-20.pdf");
  }

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadQuestions();
    } else {
      displayResults();
    }
  });

  backBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadQuestions();
    }
  });

  // Initial setup
  setupQuiz();
});
