import { TMDB_API_KEY } from "./config.js";

(async () => {
  const HomeAPIRoutes = {
    "Trending Movies": { url: "/trending/all/week" }, // trending có thể là movie, tv, person
    "Popular Movies": { url: "/movie/popular" },
    "Top Rated Movies": { url: "/movie/top_rated" },
    "Now Playing at Theatres": { url: "/movie/now_playing" },
    "Upcoming Movies": { url: "/movie/upcoming" },
  };

  const promises = await Promise.all(
    Object.keys(HomeAPIRoutes).map(
      async (item) =>
        await (
          await fetch(
            `https://api.themoviedb.org/3${HomeAPIRoutes[item].url}?api_key=${TMDB_API_KEY}&language=en-US`
          )
        ).json()
    )
  );

  const data = promises.reduce((final, current, index) => {
    final[Object.keys(HomeAPIRoutes)[index]] = current.results;
    return final;
  }, {});

  // Lấy random 1 phim từ trending để làm hero
  const trending = data["Trending Movies"].filter((item) => item.media_type !== "person");
  const main = trending[new Date().getDate() % trending.length];

  document.querySelector("#hero-image").src =
    `https://image.tmdb.org/t/p/original${main.backdrop_path}`;
  document.querySelector("#hero-preview-image").src =
    `https://image.tmdb.org/t/p/w300${main.poster_path}`;
  document.querySelector("#hero-title").innerText = main.title || main.name;
  document.querySelector("#hero-description").innerText = main.overview;
  document.querySelector("#watch-now-btn").href = `./watch.html?id=${main.id}&type=${main.media_type || "movie"}`;
  document.querySelector("#view-info-btn").href = `./info.html?id=${main.id}&type=${main.media_type || "movie"}`;

  // Render các section
  Object.keys(data).map((key, index) => {
    document.querySelector("main").innerHTML += /*html*/ `
    <div class="section">
      <h2>${key}</h2>
      <div class="swiper-${index} swiper">
        <div class="swiper-wrapper">
          ${data[key]
            .filter((item) => item.media_type !== "person") // bỏ person
            .map(
              (item) => /*html*/ `
          <a href="./info.html?id=${item.id}&type=${item.media_type || "movie"}"
             class="swiper-slide" style="width: 200px !important">
            <div class="movie-card">
              <img
                class="fade-in"
                onload="this.style.opacity = '1'"
                src="https://image.tmdb.org/t/p/w200${item.poster_path}"
                alt=""
              />
              <p class="multiline-ellipsis-2">
                ${item.title || item.name}
              </p>
            </div>
          </a>
        `
            )
            .join("\n")}
        </div>
        <div class="swiper-button-prev swiper-button-prev-${index}"></div>
        <div class="swiper-button-next swiper-button-next-${index}"></div>
      </div>
    </div>
    `;
  });

  // Khởi tạo Swiper
  Object.keys(data).map((key, index) => {
    new Swiper(`.swiper-${index}`, {
      spaceBetween: 20,
      slidesPerView: "auto",
      loop: true,
      navigation: {
        prevEl: `.swiper-button-prev-${index}`,
        nextEl: `.swiper-button-next-${index}`,
      },
    });
  });
})();
