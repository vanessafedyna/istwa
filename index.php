<?php
declare(strict_types=1);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Istwa</title>
    <meta
        name="description"
        content="Istwa est une application éducative multilingue consacrée à l'histoire d'Haïti."
    >
    <link rel="stylesheet" href="style.css?v=<?= filemtime(__DIR__ . '/style.css') ?>">
</head>
<body>
    <div id="sr-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>
    <div class="page-shell">
        <header class="site-header">
            <div class="container header-row">
                <button
                    id="brand-button"
                    class="brand-button"
                    type="button"
                    data-action="change-section"
                    data-section="home"
                >
                    <span class="brand-mark">I</span>
                    <span class="brand-copy">
                        <span id="brand-kicker" class="brand-kicker"></span>
                        <span id="brand-title" class="brand-title"></span>
                    </span>
                </button>

                <div class="header-controls">
                    <nav class="site-nav" aria-label="Navigation principale">
                        <button id="nav-home" class="nav-link" type="button" data-action="change-section" data-section="home"></button>
                        <button id="nav-timeline" class="nav-link" type="button" data-action="change-section" data-section="timeline"></button>
                        <button id="nav-heroes" class="nav-link" type="button" data-action="change-section" data-section="heroes"></button>
                        <button id="nav-quiz" class="nav-link" type="button" data-action="change-section" data-section="quiz"></button>
                        <button id="nav-konnen-rasin-ou" class="nav-link" type="button" data-action="change-section" data-section="konnen-rasin-ou" hidden></button>
                        <button id="nav-profile" class="nav-link" type="button" data-action="change-section" data-section="profile"></button>
                        <button id="nav-diaspora" class="nav-link" type="button" data-action="change-section" data-section="diaspora"></button>
                        <button id="nav-admin" class="nav-link" type="button" data-action="change-section" data-section="admin" hidden></button>
                    </nav>

                    <label class="language-switcher" for="language-select">
                        <span id="language-label" class="language-label"></span>
                        <select id="language-select" class="language-select" aria-label="Choisir une langue">
                            <option value="fr">Français</option>
                            <option value="ht">Kreyòl ayisyen</option>
                            <option value="en">English</option>
                        </select>
                    </label>
                </div>
            </div>
        </header>

        <main id="app-main" class="container main-content">
            <section id="home-section" class="content-section is-active"></section>
            <section id="timeline-section" class="content-section" hidden></section>
            <section id="heroes-section" class="content-section" hidden></section>
            <section id="quiz-section" class="content-section" hidden></section>
            <section id="profile-section" class="content-section" hidden></section>
            <section id="konnen-rasin-ou-section" class="content-section" hidden></section>
            <section id="diaspora-section" class="content-section" hidden></section>
            <section id="admin-section" class="content-section" hidden></section>
        </main>

        <footer class="site-footer">
            <div class="container footer-row">
                <p class="footer-brand">Istwa</p>
                <p id="footer-quote" class="footer-quote"></p>
            </div>
        </footer>
    </div>

    <script defer src="data/translations.js?v=<?= filemtime(__DIR__ . '/data/translations.js') ?>"></script>
    <script defer src="data/heroes.js?v=<?= filemtime(__DIR__ . '/data/heroes.js') ?>"></script>
    <script defer src="data/timeline.js?v=<?= filemtime(__DIR__ . '/data/timeline.js') ?>"></script>
    <script defer src="data/quiz.js?v=<?= filemtime(__DIR__ . '/data/quiz.js') ?>"></script>
    <script defer src="data/modules.js?v=<?= filemtime(__DIR__ . '/data/modules.js') ?>"></script>
    <script defer src="data/diaspora.js?v=<?= filemtime(__DIR__ . '/data/diaspora.js') ?>"></script>
    <script type="module" src="assets/js/app.js?v=<?= filemtime(__DIR__ . '/assets/js/app.js') ?>"></script>
</body>
</html>
