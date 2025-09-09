// scripts/watch.js
import { TMDB_API_KEY } from "./config.js";

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");
let type = urlParams.get("type") || "movie";

async function fetchFromTMDB(endpoint) {
  const res = await fetch(
    `https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_API_KEY}&language=en-US`
  );
  return res.json();
}

(async () => {
  // 1. Lấy thông tin phim
  let details = await fetchFromTMDB(`${type}/${id}`);
  if (details.success === false || !details.id) {
    type = type === "movie" ? "tv" : "movie";
    details = await fetchFromTMDB(`${type}/${id}`);
  }

  // 2. Render thông tin phim
  document.getElementById("movie-title").innerText =
    details.title || details.name || "Unknown";
  document.getElementById("movie-description").innerText =
    details.overview || "No description available.";
  document.getElementById("release-date").innerText =
    `Release Date: ${details.release_date || details.first_air_date || "Unknown"}`;

// 3. Render iframe (chỉ dùng TMDB trailer nếu có)
const iframe = document.querySelector("iframe");

// Gọi API videos
const videos = await fetchFromTMDB(`${type}/${id}/videos`);
const trailer = (videos.results || []).find(v => v.type === "Trailer" && v.site === "YouTube");

if (trailer) {
  iframe.src = `https://www.youtube.com/embed/${trailer.key}`;
} else {
  iframe.outerHTML = `<p style="padding:20px; text-align:center">No trailer available for this title.</p>`;
}

  // 4. Similar movies
  const similar = await fetchFromTMDB(`${type}/${id}/similar`);
  const similarContainer = document.querySelector("#similar");
  similarContainer.innerHTML = `
    <h2 style="margin: 40px 80px 20px">Similar ${type === "movie" ? "Movies" : "TV Shows"}</h2>
    <div class="swiper similar-swiper">
      <div class="swiper-wrapper">
        ${(similar.results || [])
          .map(
            (m) => `
          <a href="./watch.html?id=${m.id}&type=${type}" class="swiper-slide" style="width: 200px !important">
            <div class="movie-card">
              <img src="https://image.tmdb.org/t/p/w200${m.poster_path}" alt="${m.title || m.name}" />
              <p class="multiline-ellipsis-2">${m.title || m.name}</p>
            </div>
          </a>
        `
          )
          .join("")}
      </div>
      <div class="swiper-button-prev similar-prev"></div>
      <div class="swiper-button-next similar-next"></div>
    </div>
  `;

  new Swiper(".similar-swiper", {
    spaceBetween: 20,
    slidesPerView: "auto",
    loop: true,
    navigation: {
      prevEl: ".similar-prev",
      nextEl: ".similar-next",
    },
  });

  // 5. Comment box
  renderCommentBox();
  loadComments();
})();

// ================== COMMENT SYSTEM ================== //
function renderCommentBox() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const container = document.getElementById("comment-box-container");

  if (user) {
    container.innerHTML = `
      <form id="comment-form" class="d-flex flex-column gap-2">
        <textarea id="comment-input" rows="3" placeholder="Write your comment..." required></textarea>
        <button type="submit" class="btn">Post Comment</button>
      </form>
    `;
    document.getElementById("comment-form").addEventListener("submit", (e) => {
      e.preventDefault();
      postComment(user.username);
    });
  } else {
    container.innerHTML = `<p><a href="./login.html">Login</a> to post comments.</p>`;
  }
}

// CREATE
function postComment(username) {
  const input = document.getElementById("comment-input");
  const text = input.value.trim();
  if (!text) return;

  const comment = {
    id: Date.now(), // unique id
    user: username,
    text,
    time: new Date().toLocaleString(),
  };

  let comments = JSON.parse(localStorage.getItem(`comments-${id}`)) || [];
  comments.push(comment);
  localStorage.setItem(`comments-${id}`, JSON.stringify(comments));

  input.value = "";
  loadComments();
}

// READ
function loadComments() {
  const comments = JSON.parse(localStorage.getItem(`comments-${id}`)) || [];
  const container = document.getElementById("comments");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  container.innerHTML = comments
    .map((c) => {
      const isOwner = currentUser && currentUser.username === c.user;
      return `
        <div class="comment" data-id="${c.id}">
          <p>
            <strong>${c.user}</strong> 
            <span style="font-size:12px;opacity:0.7">(${c.time})</span>
          </p>
          <p class="comment-text">${c.text}</p>
          ${
            isOwner
              ? `
            <button class="btn-edit" onclick="editComment(${c.id})">Edit</button>
            <button class="btn-delete" onclick="deleteComment(${c.id})">Delete</button>
          `
              : ""
          }
        </div>
      `;
    })
    .join("");
}

// UPDATE
window.editComment = function (commentId) {
  const comments = JSON.parse(localStorage.getItem(`comments-${id}`)) || [];
  const comment = comments.find((c) => c.id === commentId);

  if (!comment) return;

  const newText = prompt("Edit your comment:", comment.text);
  if (newText && newText.trim()) {
    comment.text = newText.trim();
    comment.time = new Date().toLocaleString();
    localStorage.setItem(`comments-${id}`, JSON.stringify(comments));
    loadComments();
  }
};

// DELETE
window.deleteComment = function (commentId) {
  let comments = JSON.parse(localStorage.getItem(`comments-${id}`)) || [];
  comments = comments.filter((c) => c.id !== commentId);
  localStorage.setItem(`comments-${id}`, JSON.stringify(comments));
  loadComments();
};
