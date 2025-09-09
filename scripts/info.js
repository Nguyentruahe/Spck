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
  // Lấy chi tiết phim
  let details = await fetchFromTMDB(`${type}/${id}`);
  // Nếu gọi nhầm type thì thử type còn lại
  if (details.success === false || !details.id) {
    type = type === "movie" ? "tv" : "movie";
    details = await fetchFromTMDB(`${type}/${id}`);
  }

  // Render banner
  document.querySelector(".background-img").style.backgroundImage =
    details.backdrop_path
      ? `url(https://image.tmdb.org/t/p/original${details.backdrop_path})`
      : "none";

  document.querySelector("#preview-img").src =
    details.poster_path
      ? `https://image.tmdb.org/t/p/w300${details.poster_path}`
      : "./assets/no-poster.png";

  document.querySelector("#movie-title").innerText = details.title || details.name || "Unknown title";
  document.querySelector("#movie-description").innerText = details.overview || "No description available.";
  document.querySelector("#release-date").innerText =
    `Release Date: ${details.release_date || details.first_air_date || "Unknown"}`;
  document.querySelector("#watch-now-btn").href = `./watch.html?id=${details.id}&type=${type}`;

  // Genres
  const genresContainer = document.querySelector("#genres");
  genresContainer.innerHTML = "";
  (details.genres || []).forEach((g) => {
    const span = document.createElement("span");
    span.innerText = g.name;
    genresContainer.appendChild(span);
  });

  // Casts
  const credits = await fetchFromTMDB(`${type}/${id}/credits`);
  const castsGrid = document.querySelector(".casts-grid");
  castsGrid.innerHTML = "";
  (credits.cast || []).slice(0, 12).forEach((actor) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w200${actor.profile_path}" alt="${actor.name}" />
      <p>${actor.name}</p>
      <p style="font-size: 14px; opacity: 0.8">${actor.character}</p>
    `;
    castsGrid.appendChild(div);
  });

  // Similar
  const similar = await fetchFromTMDB(`${type}/${id}/similar`);
  const similarContainer = document.querySelector("#similar");
  similarContainer.innerHTML = `
    <h2 style="margin: 40px 80px 20px">Similar ${type === "movie" ? "Movies" : "TV Shows"}</h2>
    <div class="swiper similar-swiper">
      <div class="swiper-wrapper">
        ${(similar.results || [])
          .map(
            (m) => `
          <a href="./info.html?id=${m.id}&type=${type}" class="swiper-slide" style="width: 200px !important">
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
})();
