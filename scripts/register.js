const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const usernameInput = document.getElementById('username')
document.getElementById('userForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const username = usernameInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (username.length <6){
        alert("Username must be at least 6 characters");
        return
    }
    if (!emailRegex.test(email)) {
        alert('Email is not in correct format!');
        return;
    }
    if (password.length < 8 || password.length > 20) {
        alert('Password must be longer than 8 and shorter than 20');
        return;
    } else {
    if (localStorage.getItem("users")) {
      let users = JSON.parse(localStorage.getItem("users"));

      users.push({
        email,
        password,
        username,
      });

      localStorage.setItem("users", JSON.stringify(users));
    } else {
      localStorage.setItem(
        "users",
        JSON.stringify([
          {
            email,
            password,
            username,
          },
        ])
      );
    }

    alert("User created successfully, please login");
    location.href = "./login.html";
  }
});