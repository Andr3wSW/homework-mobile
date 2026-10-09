
# Mobile / Bookmarklet

`mobile.html` is a mobile-friendly version of Screen Assistant. It lets users choose a screenshot from their phone and send it with a prompt to Gemini.

## GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Deploy the repository root from your main branch.
4. Your mobile page will be:

`https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/mobile.html`

## Bookmarklet

Replace the URL in `bookmarklet.txt` with your GitHub Pages URL.

Then create a bookmark on your phone with the bookmarklet code as its URL.

The bookmarklet opens the mobile assistant and passes the current page URL. The phone's screenshot picker is used because mobile browsers do not allow bookmarklets to capture the device screen directly.
