# Copenhagen + PostHog — live help-center theme source

Zendesk Guide theme for help.returnvisits.org, set live 2026-08-03 (#748,
DustinTrap/FSC). Base: standard Copenhagen 4.47.0 (downloaded copy — the
new no-code Copenhagen cannot be code-edited in place, so changes go
download → edit → re-import).

Delta vs stock: `templates/document_head.hbs` appends the PostHog snippet —
same project + config as the marketing site's index.html, registered with
`source: 'helpcenter', site: 'help.returnvisits.org'` — so site and
help-center pageviews unify in one $pageview stream (feeds the Pi kiosk
"Top pages" band).

To update: edit here, zip the DIRECTORY CONTENTS (manifest.json at zip
root), Guide admin → Add theme → Import theme, then Set as live. The
prior theme stays in the library as rollback.
