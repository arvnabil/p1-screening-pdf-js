document.addEventListener("DOMContentLoaded", function () {
  // Jika pengguna sudah login, langsung arahkan ke daftar janji
  if (sessionStorage.getItem("isLoggedIn") === "true") {
    window.location.href = "daftar-janji.html";
    return;
  }

  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Data sampel untuk login admin
    const ADMIN_EMAIL = "admin@ruangsejiwa.com";
    const ADMIN_PASSWORD = "eyJhbGciOiJIU";

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Jika login berhasil, simpan status di sessionStorage
      sessionStorage.setItem("isLoggedIn", "true");
      window.location.href = "daftar-janji.html";
    } else {
      alert("Email atau password salah. Silakan coba lagi.");
    }
  });
});
