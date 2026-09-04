// #999 — share landing behaviour, shared by /shared/ and 404.html (which
// serves /s/CODE on GitHub Pages until the SWA cutover adds a real rewrite).
//
// Reads the per-share code the inline parser left on window.__rvRef, rewrites
// the four store anchors to carry it, and captures two counts-only events.
// Every posthog call is guarded: ad blockers remove the SDK and this must
// degrade to a plain landing page, never a broken one.
(function () {
  var ua = navigator.userAgent || "";
  var isAndroid = /Android/i.test(ua);
  var isIOS = /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); // iPadOS desktop-mode
  var platform = isAndroid ? "android" : (isIOS ? "ios" : "desktop");
  document.body.setAttribute("data-platform", platform);

  // On a phone, hide the store link that duplicates the visible badge.
  if (platform === "ios") {
    var l = document.querySelector(".link-ios"); if (l) l.style.display = "none";
    var s = document.querySelector(".sep"); if (s) s.style.display = "none";
  }
  if (platform === "android") {
    var la = document.querySelector(".link-android"); if (la) la.style.display = "none";
    var s2 = document.querySelector(".sep"); if (s2) s2.style.display = "none";
  }

  // The code identifies a MESSAGE, never a person: random per share, set by
  // the sender's app, validated by the inline parser (4 chars, Crockford
  // base32 minus i/l/o/u). null means "no valid code on this visit".
  var ref = (typeof window.__rvRef === "string" && window.__rvRef) ? window.__rvRef : null;

  if (ref) {
    // App Store: the campaign token becomes the code (aggregate-only on ASC).
    [".apple-badge", ".link-ios"].forEach(function (sel) {
      var a = document.querySelector(sel);
      if (a) a.href = a.href.replace("ct=rtv-shared", "ct=" + ref);
    });
    // Play: utm_content=CODE rides INSIDE the URL-encoded referrer value, so
    // the Install Referrer API hands it back to the app deterministically.
    [".play-badge", ".link-android"].forEach(function (sel) {
      var a = document.querySelector(sel);
      if (a && a.href.indexOf("utm_content") === -1) {
        a.href = a.href.replace(/(referrer=[^&#]*)/, "$1%26utm_content%3D" + ref);
      }
    });
  }

  // Coarse landing bucket, never the raw path: 404.html serves EVERY missing
  // URL, and an arbitrary path is not something to put in an event.
  var landing = /^\/s\//i.test(location.pathname) ? "s"
    : (location.pathname.replace(/\/$/, "") === "/shared" ? "shared" : "other");

  function ph(fn) {
    try {
      if (window.posthog && typeof window.posthog.capture === "function") fn(window.posthog);
    } catch (e) { /* analytics must never break the page */ }
  }

  var base = { landing: landing, platform: platform, ref_valid: !!ref };
  if (ref) base.ref = ref;
  ph(function (p) { p.capture("share_link_landed", base); });

  // Badge taps — sendBeacon so a same-tab navigation to the store cannot
  // lose the event.
  [[".apple-badge", "ios", "badge"], [".play-badge", "android", "badge"],
   [".link-ios", "ios", "other-store"], [".link-android", "android", "other-store"]]
    .forEach(function (t) {
      var a = document.querySelector(t[0]);
      if (!a) return;
      a.addEventListener("click", function () {
        var props = { store: t[1], placement: t[2], platform: platform };
        if (ref) props.ref = ref;
        ph(function (p) { p.capture("share_badge_tapped", props, { transport: "sendBeacon" }); });
      });
    });
})();
