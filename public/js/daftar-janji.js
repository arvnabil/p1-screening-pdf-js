document.addEventListener("DOMContentLoaded", function () {
  // --- AUTHENTICATION CHECK ---
  // Jika pengguna belum login, tendang ke halaman login
  if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
    return; // Hentikan eksekusi skrip lebih lanjut
  }

  const tbody = document.getElementById("janji-temu-tbody");
  const loadingState = document.getElementById("loading-state");
  const exportBtn = document.getElementById("export-excel-btn");
  const searchInput = document.getElementById("search-input");
  const profesionalFilter = document.getElementById("profesional-filter");
  const resetBtn = document.getElementById("reset-filter-btn");
  const logoutBtn = document.getElementById("logout-btn");
  let allAppointments = []; // Store data for export
  let uniqueProfesionals = new Set();
  let currentlyDisplayedAppointments = []; // Store currently visible data

  // Logout logic
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("isLoggedIn");
      window.location.href = "login.html";
    });
  }

  function createAppointmentRow(appointment, index) {
    // Menggunakan data 'jadwal' untuk tanggal dan waktu konsultasi
    let jadwalTanggal = "Belum diatur";
    let jadwalWaktu = "-";

    if (appointment.jadwal) {
      const jadwalDate = new Date(appointment.jadwal);

      // Format Tanggal: "Sabtu, 21 Agustus 2025"
      jadwalTanggal = jadwalDate.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Jakarta", // Pastikan timezone konsisten
      });

      // Format Waktu: "10:00 WIB"
      jadwalWaktu =
        jadwalDate.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Jakarta",
        }) + " WIB";
    }
    // Format nomor WhatsApp untuk link wa.me
    let whatsappNumber = appointment.whatsapp || "";
    if (whatsappNumber.startsWith("0")) {
      whatsappNumber = "62" + whatsappNumber.substring(1);
    }
    const whatsappLink = whatsappNumber
      ? `https://wa.me/${whatsappNumber}`
      : "#";
    const whatsappButtonDisabled = !whatsappNumber ? "disabled" : "";

    return `
      <tr id="row-${appointment.id}">
        <th scope="row">${index + 1}</th>
        <td>${appointment.nama_lengkap}</td>
        <td>${appointment.profesional}</td>
        <td>${appointment.tujuan_sesi}</td>
        <td>${jadwalTanggal}</td>
        <td>${jadwalWaktu}</td>
        <td>
          <a href="${whatsappLink}" target="_blank" class="btn btn-success btn-sm" title="Hubungi via WhatsApp" ${whatsappButtonDisabled}>
            <i class="bi bi-whatsapp"></i>
          </a>
          <button class="btn btn-danger btn-sm btn-delete" data-id="${
            appointment.id
          }" title="Hapus Janji Temu">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }

  // Fungsi untuk menangani penghapusan janji temu
  async function deleteAppointment(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus janji temu ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/janji-temu/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.error || `Gagal menghapus. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Jika berhasil, hapus baris dari tabel untuk feedback instan
      const rowToRemove = document.getElementById(`row-${id}`);
      if (rowToRemove) {
        rowToRemove.remove();
      }
    } catch (error) {
      alert(`Terjadi kesalahan: ${error.message}`);
      console.error("Error deleting appointment:", error);
    }
  }

  // Event listener untuk tombol hapus menggunakan event delegation
  tbody.addEventListener("click", function (event) {
    const deleteButton = event.target.closest(".btn-delete");
    if (deleteButton) {
      const appointmentId = deleteButton.dataset.id;
      deleteAppointment(appointmentId);
    }
  });

  // Fungsi untuk mengisi dropdown filter profesional
  function populateProfesionalFilter() {
    profesionalFilter.innerHTML = '<option value="">Semua Profesional</option>'; // Reset
    uniqueProfesionals.forEach((profesional) => {
      const option = document.createElement("option");
      option.value = profesional;
      option.textContent = profesional;
      profesionalFilter.appendChild(option);
    });
  }

  // Fungsi untuk menerapkan filter dan me-render ulang tabel
  function applyFiltersAndRender() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedProfesional = profesionalFilter.value;

    const filteredAppointments = allAppointments.filter((app) => {
      const matchesSearch =
        app.nama_lengkap.toLowerCase().includes(searchTerm) ||
        app.tujuan_sesi.toLowerCase().includes(searchTerm);

      const matchesProfesional =
        !selectedProfesional || app.profesional === selectedProfesional;

      return matchesSearch && matchesProfesional;
    });

    renderTable(filteredAppointments);
  }

  // Fungsi untuk me-render tabel dengan data yang diberikan
  function renderTable(appointments) {
    // Simpan data yang sedang ditampilkan untuk keperluan ekspor
    currentlyDisplayedAppointments = appointments;

    if (appointments.length === 0) {
      // Jika tidak ada data (baik karena filter atau pencarian), tampilkan pesan ini.
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-muted py-4">
            Tidak ada janji temu yang cocok dengan kriteria Anda.
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = appointments
        .map((appointment, index) => createAppointmentRow(appointment, index))
        .join("");
    }
  }

  // Fungsi untuk export data ke Excel
  function exportToExcel() {
    if (currentlyDisplayedAppointments.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    // 1. Siapkan data dengan header yang diinginkan
    const dataForExport = currentlyDisplayedAppointments.map((app) => {
      let jadwalTanggal = "Belum diatur";
      let jadwalWaktu = "-";

      if (app.jadwal) {
        const jadwalDate = new Date(app.jadwal);
        jadwalTanggal = jadwalDate.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "Asia/Jakarta",
        });
        jadwalWaktu = jadwalDate.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Jakarta",
        });
      }

      return {
        "Nama Pasien": app.nama_lengkap,
        Profesional: app.profesional,
        "Tujuan Sesi": app.tujuan_sesi,
        "Tanggal Konsultasi": jadwalTanggal,
        "Waktu Konsultasi": jadwalWaktu,
        Email: app.email,
        WhatsApp: app.whatsapp,
        Biaya: app.biaya,
        "Tanggal Dibuat (Sistem)": new Date(app.created_at).toLocaleString(
          "id-ID"
        ),
      };
    });

    // 2. Buat worksheet dari data JSON
    const worksheet = XLSX.utils.json_to_sheet(dataForExport);

    // 3. Buat workbook baru dan tambahkan worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "JanjiTemu");

    // 4. Atur lebar kolom (opsional, tapi membuat tampilan lebih baik)
    worksheet["!cols"] = [
      { wch: 25 }, // Nama Pasien
      { wch: 25 }, // Profesional
      { wch: 30 }, // Tujuan Sesi
      { wch: 30 }, // Tanggal Konsultasi
      { wch: 20 }, // Waktu Konsultasi
      { wch: 25 }, // Email
      { wch: 15 }, // WhatsApp
      { wch: 15 }, // Biaya
      { wch: 25 }, // Tanggal Dibuat (Sistem)
    ];

    // 5. Tulis file dan trigger download
    XLSX.writeFile(workbook, "Daftar_Janji_Temu.xlsx");
  }

  // Event listener untuk tombol export
  if (exportBtn) {
    exportBtn.addEventListener("click", exportToExcel);
  }

  // Fungsi untuk memuat semua janji temu dari server
  async function loadAppointments() {
    loadingState.innerHTML = `<p class="text-center">Memuat data janji temu...</p>`;
    tbody.innerHTML = ""; // Kosongkan tabel sebelum memuat data baru
    try {
      const response = await fetch("/api/janji-temu");
      if (!response.ok) {
        throw new Error(`Gagal mengambil data: ${response.statusText}`);
      }
      allAppointments = await response.json(); // Simpan data ke variabel
      loadingState.innerHTML = ""; // Hapus pesan loading

      // Kumpulkan nama profesional yang unik untuk filter
      allAppointments.forEach((app) => uniqueProfesionals.add(app.profesional));
      populateProfesionalFilter();

      if (allAppointments.length === 0) {
        loadingState.innerHTML = `<div class="alert alert-info">Belum ada janji temu yang dibuat.</div>`;
      } else {
        renderTable(allAppointments);
      }
    } catch (error) {
      loadingState.innerHTML = `<div class="alert alert-danger">Terjadi kesalahan: ${error.message}</div>`;
      console.error("Error loading appointments:", error);
    }
  }

  // Tambahkan event listeners untuk filter
  searchInput.addEventListener("input", applyFiltersAndRender);
  profesionalFilter.addEventListener("change", applyFiltersAndRender);
  resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    profesionalFilter.value = "";
    renderTable(allAppointments);
  });

  // Panggil fungsi untuk memuat data saat halaman pertama kali dibuka
  loadAppointments();
});
