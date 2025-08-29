export const TMDB_API_KEY = "9b7c3ede447b14c5e0e9d33a137ddac9";

addEventListener("scroll", () => {
  if (window.scrollY === 0) {
    document
      .querySelector(".navbar")
      .classList.remove("navbar-background-visible");
  } else {
    document
      .querySelector(".navbar")
      .classList.add("navbar-background-visible");
  }
});

// Kiểm tra tình trạng người dùng để hiển thị và user hiện tại.
window.handleSignOut = () => {
  localStorage.removeItem("currentUser");
  location.reload();
};

window.signIn = () => {};

//// Nếu người dùng đăng đăng nhập.
if (localStorage.getItem("currentUser")) {
  document.querySelector("#avatar-action-container").innerHTML += /*html*/ `
    <div tabindex="0" class="avatar-action">
      <img src="${`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        JSON.parse(localStorage.getItem("currentUser")).username
      )}`}" />
      <div class="popup">
        <button class="action-button" onclick="handleSignOut()">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span> Logout</span>
        </button>
      </div>
    </div>
  `;
} else {
  document.querySelector("#avatar-action-container").innerHTML += /*html*/ `
    <a style="font-size: 25px" href="./login.html">
      <i class="fa-solid fa-right-to-bracket"></i>
    </a>
  `;
}

