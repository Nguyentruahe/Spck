// scripts/search.js
import { TMDB_API_KEY } from "./config.js";

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("q") || "";

const input = document.getElementById("q");
input.value = query;

const movieGrid = document.getElementById("movie-grid");
const backdrop = document.querySelector(".backdrop");

async function searchMovies(q) {
  if (!q) {
    movieGrid.innerHTML = "<p>Please enter a search term.</p>";
    backdrop.classList.add("backdrop-hidden");
    return;
  }

  backdrop.classList.remove("backdrop-hidden");

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(
        q
      )}&page=1&include_adult=false`
    );

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    console.log("Search results:", data);

    if (!data.results || data.results.length === 0) {
      movieGrid.innerHTML = "<p>No results found.</p>";
    } else {
      movieGrid.innerHTML = data.results
        .filter((item) => item.poster_path) // bỏ item không có poster
        .map(
          (item) => /*html*/ `
          <a href="./info.html?id=${item.id}" class="movie-card">
            <img
              class="fade-in"
              onload="this.style.opacity = '1'"
              src="https://image.tmdb.org/t/p/w200${item.poster_path}"
              alt="${item.title || item.name}"
            />
            <p class="multiline-ellipsis-2">
              ${item.title || item.name}
            </p>
          </a>
        `
        )
        .join("");
    }
  } catch (error) {
    console.error("Search error:", error);
    movieGrid.innerHTML = "<p>Error while fetching results.</p>";
  } finally {
    backdrop.classList.add("backdrop-hidden"); // đảm bảo luôn ẩn loading
  }
}

// Sự kiện submit form
document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = input.value.trim();
  if (q) {
    window.location.href = `./search.html?q=${encodeURIComponent(q)}`;
  }
});

// Nếu URL có ?q= thì tự động search
if (query) {
  searchMovies(query);
} else {
  movieGrid.innerHTML = "<p>Type something above to search.</p>";
  backdrop.classList.add("backdrop-hidden"); // tránh stuck loading
}