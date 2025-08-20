document.addEventListener("DOMContentLoaded", function () {
  const btnStart = document.getElementById("btnStart");

  if (btnStart) {
    btnStart.addEventListener(
      "click",
      () => (window.location.href = "screening.html")
    );
  }
});
