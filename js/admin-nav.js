(function () {
  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem("user_info") || "null");
    } catch (error) {
      return null;
    }
  }

  function isAdmin(user) {
    return (user && String(user.role || "").toUpperCase() === "ADMIN") || tokenRole() === "ADMIN";
  }

  function tokenRole() {
    var token = localStorage.getItem("jwt_token");
    if (!token || token.split(".").length < 2) return "";
    try {
      var payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return String(payload.role || "").toUpperCase();
    } catch (error) {
      return "";
    }
  }

  function injectStyle() {
    if (document.getElementById("admin-nav-style")) return;
    var s = document.createElement("style");
    s.id = "admin-nav-style";
    // The shared #responsive-menu .submenu.dropdown > a rule forces
    // text-transform: uppercase on every nav entry. "Admin Panel" is an
    // English label that should stay in title case, so we override it here.
    s.textContent = "#responsive-menu li[data-admin-nav] > a.admin-nav-entry { text-transform: none !important; }";
    document.head.appendChild(s);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!isAdmin(getStoredUser())) return;

    injectStyle();

    // Single global dedup: even if multiple elements share id="responsive-menu"
    // (e.g., after slicknav clones the desktop menu), only add the Admin Panel
    // entry to the first one that doesn't already have it. Prevents the same
    // link rendering twice in the same visible navbar.
    if (document.querySelector("[data-admin-nav]")) return;

    var menu = document.querySelector("#responsive-menu");
    if (!menu) return;

    var item = document.createElement("li");
    item.className = "submenu dropdown px-2";
    item.setAttribute("data-admin-nav", "true");
    item.innerHTML = '<a href="admin/analytics.html" class="admin-nav-entry">Admin Panel</a>';
    menu.appendChild(item);
  });
})();
