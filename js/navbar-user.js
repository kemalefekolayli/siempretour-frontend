(function () {
  var STYLE_ID = "navbar-user-style";
  var STYLE = [
    ".trip-button.nav-user-item { position: relative; padding: 0; background: transparent; }",
    ".trip-button.nav-user-item .nav-user-btn {",
    "  background-color: #000; color: #fff; font-size: 14px; line-height: 20px;",
    "  padding: 0.5rem 1rem; text-transform: none; display: inline-flex; align-items: center;",
    "  gap: 0.5rem; cursor: pointer; border: 0; width: auto;",
    "}",
    ".trip-button.nav-user-item .nav-user-btn:hover { background-color: #333; color: #fff; }",
    ".nav-user-avatar {",
    "  display: inline-flex; align-items: center; justify-content: center;",
    "  width: 28px; height: 28px; border-radius: 50%; background: #96c43f;",
    "  color: #fff; font-weight: 600; font-size: 12px; letter-spacing: 0.5px;",
    "}",
    ".nav-user-name { font-weight: 500; }",
    ".nav-user-caret { font-size: 10px; opacity: 0.8; }",
    ".nav-user-dropdown {",
    "  position: absolute; top: 100%; right: 0; min-width: 220px; background: #fff;",
    "  color: #222; box-shadow: 0 6px 24px rgba(0,0,0,0.15); border: 1px solid #eee;",
    "  border-radius: 6px; padding: 8px 0; margin-top: 6px; z-index: 1050; display: none;",
    "  text-align: left;",
    "}",
    ".nav-user-dropdown.open { display: block; }",
    ".nav-user-dropdown .nav-user-head {",
    "  padding: 10px 14px; border-bottom: 1px solid #f0f0f0; line-height: 1.3;",
    "}",
    ".nav-user-dropdown .nav-user-head strong { display: block; font-size: 14px; color: #215093; }",
    ".nav-user-dropdown .nav-user-head small { color: #777; font-size: 12px; word-break: break-all; }",
    ".nav-user-dropdown a, .nav-user-dropdown button {",
    "  display: block; width: 100%; text-align: left; padding: 9px 14px;",
    "  background: transparent; border: 0; color: #222; font-size: 14px; text-decoration: none;",
    "  cursor: pointer; font-family: inherit;",
    "}",
    ".nav-user-dropdown a:hover, .nav-user-dropdown button:hover {",
    "  background: #f5f7fb; color: #215093;",
    "}",
    ".nav-user-dropdown .nav-user-logout { color: #c0392b; border-top: 1px solid #f0f0f0; }",
    ".nav-user-dropdown .nav-user-logout:hover { color: #c0392b; background: #fdecea; }",
    /* Mobile menu profile entry */
    ".log-reg-button-mobile.nav-user-mobile > a, .log-reg-button-mobile.nav-user-mobile .nav-user-mobile-row {",
    "  background: transparent;",
    "}",
    ".log-reg-button-mobile.nav-user-mobile .nav-user-mobile-row {",
    "  display: flex; align-items: center; gap: 10px; color: #fff; padding: 12px 16px;",
    "  width: 100%; justify-content: flex-start;",
    "}",
    ".log-reg-button-mobile.nav-user-mobile .nav-user-mobile-logout {",
    "  display: block; width: 100%; text-align: center; padding: 10px 16px; color: #fff;",
    "  background: rgba(255,255,255,0.08); text-decoration: none; border: 0;",
    "  font-family: inherit; font-size: 14px;",
    "}",
    ".log-reg-button-mobile.nav-user-mobile .nav-user-mobile-logout:hover { background: rgba(255,255,255,0.15); }"
  ].join("\n");

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function getToken() {
    return localStorage.getItem("jwt_token");
  }

  function getStoredUser() {
    try {
      return JSON.parse(localStorage.getItem("user_info") || "null");
    } catch (e) {
      return null;
    }
  }

  function tokenPayload() {
    var token = getToken();
    if (!token || token.split(".").length < 2) return null;
    try {
      return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    } catch (e) {
      return null;
    }
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function safe(v) {
    return (typeof v === "string" && v.trim()) ? v.trim() : "";
  }

  function displayName(user) {
    user = user || {};
    var payload = tokenPayload() || {};
    var full = safe(user.fullName) || safe(user.name);
    if (!full) {
      var first = safe(user.firstName);
      var last = safe(user.lastName);
      if (first || last) full = (first + " " + last).trim();
    }
    if (!full) full = safe(payload.fullName) || safe(payload.name);
    if (!full) full = safe(user.username) || safe(payload.username);
    if (!full) {
      var email = safe(user.email) || safe(payload.sub) || safe(payload.email);
      if (email && email.indexOf("@") > 0) full = email.split("@")[0];
    }
    return full || "Profil";
  }

  function userEmail(user) {
    user = user || {};
    var payload = tokenPayload() || {};
    return safe(user.email) || safe(payload.email) || (safe(payload.sub).indexOf("@") > 0 ? payload.sub : "");
  }

  function initialsFromName(name) {
    if (!name) return "P";
    var parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "P";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function logout() {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_info");
    // Redirect home (existing app pattern post-login redirects to index.html)
    window.location.href = "index.html";
  }

  function buildDesktopMarkup(name, email, initials) {
    var safeName = escapeHtml(name);
    var safeEmail = escapeHtml(email);
    var safeInitials = escapeHtml(initials);
    return ''
      + '<button type="button" class="trip-button nav-user-btn" aria-haspopup="true" aria-expanded="false" data-nav-user-toggle="1">'
      +   '<span class="nav-user-avatar">' + safeInitials + '</span>'
      +   '<span class="nav-user-name">' + safeName + '</span>'
      +   '<span class="nav-user-caret">&#9662;</span>'
      + '</button>'
      + '<div class="nav-user-dropdown" data-nav-user-dropdown>'
      +   '<div class="nav-user-head">'
      +     '<strong>' + safeName + '</strong>'
      +     (safeEmail ? '<small>' + safeEmail + '</small>' : '')
      +   '</div>'
      +   '<a href="#" data-nav-user-action="profile">Profilim</a>'
      +   '<a href="#" data-nav-user-action="settings">Profil Ayarları</a>'
      +   '<button type="button" class="nav-user-logout" data-nav-user-action="logout">Çıkış Yap</button>'
      + '</div>';
  }

  function buildMobileMarkup(name, initials) {
    var safeName = escapeHtml(name);
    var safeInitials = escapeHtml(initials);
    return ''
      + '<div class="nav-user-mobile-row">'
      +   '<span class="nav-user-avatar">' + safeInitials + '</span>'
      +   '<span class="text-center">' + safeName + '</span>'
      + '</div>'
      + '<button type="button" class="nav-user-mobile-logout" data-nav-user-action="logout">Çıkış Yap</button>';
  }

  function bindDropdown(container) {
    var btn = container.querySelector("[data-nav-user-toggle]");
    var dropdown = container.querySelector("[data-nav-user-dropdown]");
    if (!btn || !dropdown) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var isOpen = dropdown.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!container.contains(e.target)) {
        dropdown.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        dropdown.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  function bindActions(root) {
    root.querySelectorAll("[data-nav-user-action]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        var action = el.getAttribute("data-nav-user-action");
        if (action === "logout") {
          e.preventDefault();
          logout();
        } else if (action === "profile" || action === "settings") {
          // No dedicated profile page yet — keep links inert to avoid 404s.
          // When a profile route is added later, swap these for real hrefs.
          e.preventDefault();
        }
      });
    });
  }

  function renderDesktop(name, email, initials) {
    var loginItems = document.querySelectorAll("li.trip-button");
    loginItems.forEach(function (item) {
      if (item.getAttribute("data-nav-user") === "1") return;
      var anchor = item.querySelector("a");
      // Only replace items that point at the login page (avoid hijacking unrelated trip-button uses).
      if (!anchor || !/login\.html$/i.test(anchor.getAttribute("href") || "")) return;
      item.setAttribute("data-nav-user", "1");
      item.classList.add("nav-user-item");
      item.innerHTML = buildDesktopMarkup(name, email, initials);
      bindDropdown(item);
      bindActions(item);
    });
  }

  function renderMobile(name, initials) {
    var mobileItems = document.querySelectorAll("li.log-reg-button-mobile");
    mobileItems.forEach(function (item) {
      if (item.getAttribute("data-nav-user") === "1") return;
      item.setAttribute("data-nav-user", "1");
      item.classList.add("nav-user-mobile");
      item.innerHTML = buildMobileMarkup(name, initials);
      bindActions(item);
    });
  }

  function apply() {
    if (!isLoggedIn()) return;
    injectStyle();
    var user = getStoredUser() || {};
    var name = displayName(user);
    var email = userEmail(user);
    var initials = initialsFromName(name);
    renderDesktop(name, email, initials);
    renderMobile(name, initials);
  }

  // Expose for other scripts (e.g., post-login flows) that want to re-render.
  window.NavbarUser = {
    apply: apply,
    logout: logout,
    isLoggedIn: isLoggedIn,
    displayName: function () { return displayName(getStoredUser()); },
    initials: function () { return initialsFromName(displayName(getStoredUser())); }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
