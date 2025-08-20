document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const filterButtonsContainer = document.getElementById("filter-buttons");
  const providerCards = document.querySelectorAll(".provider-card");

  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    // Select active filters, but exclude the 'all' button from the logic if other filters are active
    const activeSpecificFilters = filterButtonsContainer.querySelectorAll(
      ".btn.active:not([data-filter='all'])"
    );

    providerCards.forEach((card) => {
      let isVisible = true;

      // 1. Check search term against name and services
      const nama = card.dataset.nama.toLowerCase();
      const layanan = card.dataset.layanan.toLowerCase();
      if (!nama.includes(searchTerm) && !layanan.includes(searchTerm)) {
        isVisible = false;
      }

      // 2. Check active filters if still visible and there are any specific filters
      if (isVisible && activeSpecificFilters.length > 0) {
        // Card must match ALL active filters
        activeSpecificFilters.forEach((filterBtn) => {
          const filterType = filterBtn.dataset.filter;
          const filterValue = filterBtn.dataset.value;
          const cardValue = card.dataset[filterType];

          if (!cardValue || !cardValue.toLowerCase().includes(filterValue)) {
            isVisible = false;
          }
        });
      }

      card.style.display = isVisible ? "block" : "none";
    });
  }

  // Event listener for search input
  searchInput.addEventListener("input", applyFilters);

  // Event listener for filter buttons (using delegation)
  filterButtonsContainer.addEventListener("click", (event) => {
    const clickedButton = event.target.closest(".filter-btn");
    if (!clickedButton) return;

    const isAllButton = clickedButton.dataset.filter === "all";
    const allButton = filterButtonsContainer.querySelector(
      '[data-filter="all"]'
    );

    if (isAllButton) {
      // If "Lokasi saya" (all) is clicked, deactivate others and activate it.
      if (!clickedButton.classList.contains("active")) {
        filterButtonsContainer
          .querySelectorAll(".btn.active")
          .forEach((btn) => btn.classList.remove("active"));
        clickedButton.classList.add("active");
      }
    } else {
      // If another filter is clicked, toggle it and deactivate the "all" button.
      clickedButton.classList.toggle("active");
      if (allButton) allButton.classList.remove("active");

      // If no other filters are active, reactivate the "all" button.
      const anyOtherActive = filterButtonsContainer.querySelector(
        ".filter-btn.active:not([data-filter='all'])"
      );
      if (!anyOtherActive && allButton) {
        allButton.classList.add("active");
      }
    }
    applyFilters();
  });

  // Initial filter application on page load
  applyFilters();
});
