
const USERS_KEY = "medicare_demo_users";
const SESSION_KEY = "medicare_demo_session";

const ADMIN_EMAIL = "admin@medicare.demo";
const ADMIN_PASSWORD = "Admin@123";

// ================= GET REGISTERED USERS =================

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

// ================= SAVE USERS =================

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ================= REGISTER =================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const age = Number(document.getElementById("age").value);
    const gender = document.getElementById("gender").value;

    const msg = document.getElementById("registerMessage");

    if (!name || !email || !password || !confirmPassword || !gender) {
      msg.style.color = "red";
      msg.textContent = "Please fill all fields!";
      return;
    }

    if (!Number.isInteger(age) || age < 1 || age > 120) {
      msg.style.color = "red";
      msg.textContent = "Please enter a valid age between 1 and 120!";
      return;
    }

    if (password.length < 6) {
      msg.style.color = "red";
      msg.textContent = "Password must be at least 6 characters!";
      return;
    }

    if (password !== confirmPassword) {
      msg.style.color = "red";
      msg.textContent = "Passwords do not match!";
      return;
    }

    if (email === ADMIN_EMAIL) {
      msg.style.color = "red";
      msg.textContent = "This email is reserved for admin!";
      return;
    }

    const users = getUsers();

    if (users.some(user => user.email.toLowerCase() === email)) {
      msg.style.color = "red";
      msg.textContent = "Account already exists. Please login!";
      return;
    }

    // Create new user with pending approval status

    const newUser = {
      name: name,
      email: email,
      password: password,
      age: age,
      gender: gender,
      role: "user",
      status: "pending",
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    msg.style.color = "green";
    msg.textContent =
      "Registration successful! Your account is waiting for admin approval.";

    registerForm.reset();

    setTimeout(() => {
      window.location.href = "login.html";
    }, 3000);
  });
}

// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const msg = document.getElementById("loginMessage");

    // ADMIN LOGIN

    if (role === "admin") {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            email: ADMIN_EMAIL,
            role: "admin"
          })
        );

        window.location.href = "admin-dashboard.html";
      } else {
        msg.style.color = "red";
        msg.textContent = "Invalid admin email or password!";
      }

      return;
    }

    // USER LOGIN

    const users = getUsers();

    const user = users.find(
      u => u.email.toLowerCase() === email &&
           u.password === password
    );

    if (!user) {
      msg.style.color = "red";
      msg.textContent = "Account not found. Please register first!";
      return;
    }

    // Check user approval status

    if (user.status !== "approved") {
      if (user.status === "rejected") {
        msg.style.color = "red";
        msg.textContent =
          "Your registration was rejected. Please contact admin.";
      } else {
        msg.style.color = "orange";
        msg.textContent =
          "Your account is pending admin approval. Please try again later.";
      }

      return;
    }

    // Approved user session

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        role: "user"
      })
    );

    window.location.href = "user-dashboard.html";
  });
}

// ================= DASHBOARD PROTECTION =================

function protectDashboard(requiredRole) {
  const session = JSON.parse(
    localStorage.getItem(SESSION_KEY) || "null"
  );

  if (!session || session.role !== requiredRole) {
    window.location.href = "login.html";
    return null;
  }

  // Verify user approval before allowing dashboard access

  if (requiredRole === "user") {
    const users = getUsers();

    const user = users.find(
      u => u.email.toLowerCase() === session.email.toLowerCase()
    );

    if (!user || user.status !== "approved") {
      localStorage.removeItem(SESSION_KEY);

      alert("Your account is not approved by admin yet!");

      window.location.href = "login.html";
      return null;
    }
  }

  return session;
}

// ================= GET CURRENT USER =================

function getCurrentUser() {
  const session = JSON.parse(
    localStorage.getItem(SESSION_KEY) || "null"
  );

  if (!session || session.role !== "user") {
    return null;
  }

  const users = getUsers();

  const user = users.find(
    u => u.email.toLowerCase() === session.email.toLowerCase()
  );

  return user || session;
}

// ================= ADMIN APPROVE USER =================

function approveUser(email) {
  const session = JSON.parse(
    localStorage.getItem(SESSION_KEY) || "null"
  );

  if (!session || session.role !== "admin") {
    alert("Admin access required!");
    return;
  }

  const users = getUsers();

  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    alert("User not found!");
    return;
  }

  user.status = "approved";
  user.approvedAt = new Date().toISOString();

  saveUsers(users);

  alert("User approved successfully!");

  location.reload();
}

// ================= ADMIN REJECT USER =================

function rejectUser(email) {
  const session = JSON.parse(
    localStorage.getItem(SESSION_KEY) || "null"
  );

  if (!session || session.role !== "admin") {
    alert("Admin access required!");
    return;
  }

  const users = getUsers();

  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    alert("User not found!");
    return;
  }

  user.status = "rejected";

  saveUsers(users);

  alert("User rejected!");

  location.reload();
}

// ================= LOGOUT =================

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}