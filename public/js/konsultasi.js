// Wait for the DOM to be fully loaded before running scripts
document.addEventListener("DOMContentLoaded", function () {
  // --- SECTION VISIBILITY MANAGEMENT ---
  const konsultanListSection = document.getElementById(
    "konsultan-list-section"
  );
  const konfirmasiSection = document.getElementById("konfirmasi-section");
  const receiptSection = document.getElementById("receipt-section");
  const kembaliBtn = document.getElementById("btn-kembali");

  // Inisialisasi instance Modal Bootstrap
  const processingModal = new bootstrap.Modal(
    document.getElementById("processingModal")
  );
  const successModal = new bootstrap.Modal(
    document.getElementById("successModal")
  );
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // Inisialisasi Toast untuk notifikasi validasi
  const validationToastEl = document.getElementById("validationToast");
  const validationToast = new bootstrap.Toast(validationToastEl);

  function showValidationToast(message) {
    validationToastEl.querySelector(".toast-body").textContent = message;
    validationToast.show();
  }

  function showConfirmationForm(nama, tarif, durasi) {
    if (konsultanListSection && konfirmasiSection) {
      konsultanListSection.style.display = "none";
      konfirmasiSection.style.display = "block";
    }

    document.getElementById("summary-profesional").textContent = nama;
    document.getElementById("summary-durasi").textContent = durasi;
    document.getElementById("summary-biaya").textContent =
      new Intl.NumberFormat("id-ID").format(tarif);

    window.scrollTo(0, 0);
  }

  function hideConfirmationForm() {
    if (konfirmasiSection && konsultanListSection) {
      konfirmasiSection.style.display = "none";
      konsultanListSection.style.display = "block";
    }
  }

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Menampilkan halaman struk setelah data janji temu disimpan ke Supabase.
   *
   * @async
   * @function
   * @returns {Promise<void>}
   */
  /*******  5151be4d-4a70-43e6-be07-3b1a521e7424  *******/
  async function showReceipt() {
    const namaInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const tujuanSelect = document.getElementById("tujuan");
    const consultationDateInput = document.getElementById("consultationDate");
    const consultationTimeInput = document.getElementById("consultationTime");
    if (namaInput.value.trim() === "") {
      showValidationToast("Nama lengkap tidak boleh kosong.");
      namaInput.focus();
      return;
    }
    if (emailInput.value.trim() === "") {
      showValidationToast("Email tidak boleh kosong.");
      emailInput.focus();
      return;
    }
    if (tujuanSelect.value === "") {
      showValidationToast("Silakan pilih tujuan sesi.");
      tujuanSelect.focus();
      return;
    }
    if (consultationDateInput.value.trim() === "") {
      showValidationToast("Tanggal konsultasi tidak boleh kosong.");
      consultationDateInput.focus();
      return;
    }
    if (consultationTimeInput.value.trim() === "") {
      showValidationToast("Waktu konsultasi tidak boleh kosong.");
      consultationTimeInput.focus();
      return;
    }

    const tanggalValue = consultationDateInput.value;
    const waktuValue = consultationTimeInput.value;

    // Validasi rentang waktu
    if (waktuValue < "10:00" || waktuValue > "22:00") {
      showValidationToast(
        "Waktu konsultasi hanya tersedia pukul 10:00 dan 22:00 WIB."
      );
      consultationTimeInput.focus();
      return;
    }

    const nama = namaInput.value;
    const email = emailInput.value;
    const whatsapp = document.getElementById("whatsapp").value;
    const profesional = document.getElementById(
      "summary-profesional"
    ).textContent;
    const tujuanText = tujuanSelect.options[tujuanSelect.selectedIndex].text;
    const biaya = document.getElementById("summary-biaya").textContent;
    // Format the date for display on the receipt, avoiding timezone shifts
    const dateParts = tanggalValue.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const displayDate = new Date(Date.UTC(year, month, day));
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    };
    const tanggalFormatted = displayDate.toLocaleDateString("id-ID", options);
    const jadwalLengkap = `${tanggalFormatted}, pukul ${waktuValue} WIB`;

    // Data yang akan dikirim ke Supabase
    const appointmentData = {
      nama_lengkap: nama,
      email: email,
      whatsapp: whatsapp,
      profesional: profesional,
      tujuan_sesi: tujuanText,
      biaya: "Rp " + biaya,
      jadwal: `${tanggalValue} ${waktuValue}`,
    };

    try {
      // Tampilkan modal pemrosesan HANYA SETELAH semua validasi berhasil
      processingModal.show();
      const processingStartTime = Date.now(); // Catat waktu mulai

      const response = await fetch("/api/janji-temu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        // Coba baca pesan error dari body response server jika ada
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.error ||
          `Server merespon dengan status: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Pastikan modal proses tampil minimal 3 detik
      const processingTimeElapsed = Date.now() - processingStartTime;
      const remainingProcessingTime = 3000 - processingTimeElapsed;
      if (remainingProcessingTime > 0) {
        await delay(remainingProcessingTime);
      }

      // Jika berhasil, sembunyikan modal proses dan tampilkan modal sukses
      processingModal.hide();
      successModal.show();

      // Tunggu 5 detik
      await delay(5000);

      // Sembunyikan modal sukses, lalu tunggu sebentar untuk efek fade out
      successModal.hide();
      await delay(400);

      // Isi dan tampilkan halaman struk
      document.getElementById("receipt-nama").textContent = nama;
      document.getElementById("receipt-email").textContent = email;
      document.getElementById("receipt-whatsapp").textContent = whatsapp;
      document.getElementById("receipt-profesional").textContent = profesional;
      document.getElementById("receipt-biaya").textContent = "Rp " + biaya;
      document.getElementById("receipt-tujuan").textContent = tujuanText;
      document.getElementById("receipt-jadwal").textContent = jadwalLengkap;

      if (konfirmasiSection && receiptSection) {
        konfirmasiSection.style.display = "none";
        receiptSection.style.display = "block";
      }

      window.scrollTo(0, 0);
    } catch (error) {
      // Jika gagal, sembunyikan modal proses dan tampilkan alert error
      processingModal.hide();
      await delay(200); // Beri jeda agar modal hilang sebelum alert muncul
      alert("Terjadi kesalahan saat menyimpan janji temu. Silakan coba lagi.");
      console.error("Error saving appointment:", error);
      return; // Hentikan proses jika gagal menyimpan
    }
  }

  // --- EVENT LISTENERS ---

  // Event listener for all "Lihat Jadwal" buttons
  document.querySelectorAll(".btn-lihat-jadwal").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".provider-card");
      if (card) {
        const nama = card.dataset.nama;
        const tarif = parseInt(card.dataset.tarif, 10);
        const durasi = parseInt(card.dataset.durasi, 10);
        showConfirmationForm(nama, tarif, durasi);
      }
    });
  });

  // Event listener for "Kembali" button
  if (kembaliBtn) {
    kembaliBtn.addEventListener("click", hideConfirmationForm);
  }

  // --- LOGIC FOR INSIDE THE CONFIRMATION FORM ---
  const termsCheck = document.getElementById("termsCheck");
  const submitButton = document.getElementById("submit-button");
  const paymentMethods = document.getElementById("payment-methods");
  const tujuanSelect = document.getElementById("tujuan");
  const summaryTujuan = document.getElementById("summary-tujuan");
  const consultationDateInput = document.getElementById("consultationDate");
  const consultationTimeInput = document.getElementById("consultationTime");
  const summaryTanggal = document.getElementById("summary-tanggal");

  if (termsCheck && submitButton) {
    termsCheck.addEventListener("change", function () {
      submitButton.disabled = !this.checked;
    });
  }

  if (submitButton) {
    submitButton.addEventListener("click", function (event) {
      event.preventDefault();
      showReceipt();
    });
  }

  if (paymentMethods) {
    paymentMethods.addEventListener("click", function (event) {
      const clickedButton = event.target.closest("button");
      if (clickedButton) {
        for (const button of paymentMethods.children) {
          button.classList.remove("active");
        }
        clickedButton.classList.add("active");
      }
    });
  }

  if (tujuanSelect && summaryTujuan) {
    tujuanSelect.addEventListener("change", function () {
      const selectedOption = this.options[this.selectedIndex];
      summaryTujuan.textContent = selectedOption.value
        ? selectedOption.text
        : "Belum dipilih";
    });
  }

  function updateSummaryTanggal() {
    const tanggalValue = consultationDateInput.value;
    const waktuValue = consultationTimeInput.value;

    if (!tanggalValue) {
      summaryTanggal.textContent = "Belum dipilih";
      return;
    }

    // To prevent timezone issues, we treat the date as UTC
    const dateParts = tanggalValue.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const displayDate = new Date(Date.UTC(year, month, day));

    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    };
    const tanggalFormatted = displayDate.toLocaleDateString("id-ID", options);

    summaryTanggal.textContent = `${tanggalFormatted}, ${
      waktuValue || "--:--"
    }`;
  }

  if (consultationDateInput && consultationTimeInput && summaryTanggal) {
    consultationDateInput.addEventListener("input", updateSummaryTanggal);
    consultationTimeInput.addEventListener("input", updateSummaryTanggal);
  }

  // --- DYNAMIC FILTER LOGIC ---
  const searchInput = document.getElementById("search-input");
  const filterButtonsContainer = document.getElementById("filter-buttons");
  const providerCards = document.querySelectorAll(".provider-card");

  function applyFilters() {
    if (!searchInput || !filterButtonsContainer) return;

    const searchTerm = searchInput.value.toLowerCase();
    const activeFilters =
      filterButtonsContainer.querySelectorAll(".btn.active");

    providerCards.forEach((card) => {
      let isVisible = true;

      const nama = card.dataset.nama.toLowerCase();
      const fokus = card.dataset.fokus ? card.dataset.fokus.toLowerCase() : "";
      if (!nama.includes(searchTerm) && !fokus.includes(searchTerm)) {
        isVisible = false;
      }

      if (isVisible && activeFilters.length > 0) {
        activeFilters.forEach((filterBtn) => {
          const filterType = filterBtn.dataset.filter;
          const filterValue = filterBtn.dataset.value;
          const cardValue = card.dataset[filterType];

          switch (filterType) {
            case "metode":
            case "bahasa":
            case "ketersediaan":
              if (cardValue !== filterValue) isVisible = false;
              break;
            case "tarif":
              if (parseInt(cardValue) >= parseInt(filterValue))
                isVisible = false;
              break;
          }
        });
      }
      card.style.display = isVisible ? "block" : "none";
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (filterButtonsContainer) {
    filterButtonsContainer.addEventListener("click", (event) => {
      if (event.target.classList.contains("filter-btn")) {
        event.target.classList.toggle("active");
        applyFilters();
      }
    });
  }
});
