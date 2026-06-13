/*
	Kroncke Laboratory — modern refresh behaviors (2026)
	Vanilla JS, runs after the template's jQuery (does not depend on it).
	- scroll progress bar
	- back-to-top button
	- on-scroll reveal animations (IntersectionObserver)
	Honors prefers-reduced-motion.
*/
(function () {
	"use strict";

	var reduce = window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---- scroll progress bar + back-to-top ------------------------- */
	var progress = document.createElement("div");
	progress.id = "scroll-progress";
	document.body.appendChild(progress);

	var toTop = document.createElement("button");
	toTop.id = "to-top";
	toTop.setAttribute("aria-label", "Back to top");
	toTop.innerHTML = "↑";
	toTop.addEventListener("click", function () {
		window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
	});
	document.body.appendChild(toTop);

	var ticking = false;
	function onScroll() {
		if (ticking) return;
		ticking = true;
		window.requestAnimationFrame(function () {
			var doc = document.documentElement;
			var scrollTop = window.pageYOffset || doc.scrollTop;
			var height = doc.scrollHeight - doc.clientHeight;
			var pct = height > 0 ? (scrollTop / height) * 100 : 0;
			progress.style.width = pct + "%";
			toTop.classList.toggle("show", scrollTop > 600);
			ticking = false;
		});
	}
	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	/* ---- reveal-on-scroll ------------------------------------------ */
	var selectors = [
		"[data-reveal]",
		".box",
		".thrust",
		".stat",
		".callout",
		".wrapper > .inner > header.align-center"
	];
	var targets = [];
	selectors.forEach(function (sel) {
		Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
			if (targets.indexOf(el) === -1) targets.push(el);
		});
	});

	if (reduce || !("IntersectionObserver" in window)) {
		targets.forEach(function (el) { el.classList.add("reveal", "is-visible"); });
		return;
	}

	targets.forEach(function (el) {
		el.classList.add("reveal");
		// gentle stagger for grouped cards
		var parent = el.parentNode;
		if (parent && (parent.classList.contains("lab-grid") ||
		               parent.classList.contains("stats") ||
		               parent.classList.contains("grid-style"))) {
			var idx = Array.prototype.indexOf.call(parent.children, el);
			if (idx > 0) el.style.transitionDelay = Math.min(idx * 90, 360) + "ms";
		}
	});

	var io = new IntersectionObserver(function (entries) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				entry.target.classList.add("is-visible");
				io.unobserve(entry.target);
			}
		});
	}, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

	targets.forEach(function (el) { io.observe(el); });
})();
