document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const filterButtonsContainer = document.getElementById("filter-buttons");
  const communityCards = document.querySelectorAll(".community-card");

  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const activeFilterBtn = filterButtonsContainer.querySelector(".btn.active");
    const filterType = activeFilterBtn.dataset.filter;
    const filterValue = activeFilterBtn.dataset.value;

    communityCards.forEach((card) => {
      let isVisible = true;

      // 1. Check search term against name and topic
      const nama = card.dataset.nama.toLowerCase();
      const topik = card.dataset.topik.toLowerCase();
      if (!nama.includes(searchTerm) && !topik.includes(searchTerm)) {
        isVisible = false;
      }

      // 2. Check active filter if still visible
      if (isVisible && filterType) {
        switch (filterType) {
          case "tipe":
            if (card.dataset.tipe !== filterValue) {
              isVisible = false;
            }
            break;
          case "paling-aktif":
            // "Paling Aktif" didefinisikan sebagai >= 5 posting/hari
            if (parseInt(card.dataset.aktivitas) < 5) {
              isVisible = false;
            }
            break;
          // "semua" adalah default, tidak perlu filter tambahan
        }
      }

      card.style.display = isVisible ? "block" : "none";
    });
  }

  // Event listener untuk input pencarian
  searchInput.addEventListener("input", applyFilters);

  // Event listener untuk tombol filter (menggunakan delegasi)
  filterButtonsContainer.addEventListener("click", (event) => {
    const clickedButton = event.target.closest("button");
    if (clickedButton) {
      // Nonaktifkan semua tombol
      filterButtonsContainer
        .querySelectorAll(".btn")
        .forEach((btn) => btn.classList.remove("active"));
      // Aktifkan yang diklik
      clickedButton.classList.add("active");
      applyFilters();
    }
  });
});
