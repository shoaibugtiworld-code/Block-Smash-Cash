/* ================================================================
   INSTALL APP BANNER
   Shows a "Download App" banner ONLY when the site is opened in a
   normal mobile browser. Automatically hides itself when the site
   is opened INSIDE the installed APK (TWA), because TWA always sets
   document.referrer to "android-app://<package-name>".
   ================================================================ */
(function () {
    'use strict';

    // ---- EDIT THESE FOR YOUR APP ----
    const APP_NAME = 'Block Smash Cash';
    const APP_SUBTITLE = '10,000+ Installs';
    const APK_DOWNLOAD_URL = 'https://block-smash-cash.vercel.app/Smashcash.apk'; // your APK file link
    const APP_ICON_URL = '/192.png';
    const APK_PACKAGE_NAME = 'app.vercel.block_smash_cash.twa'; // your TWA package name
    // ------------------------------------------

    function isInsideInstalledApp() {
        // TWA (Trusted Web Activity) sets this referrer automatically to
        // "android-app://<package-name>" when launched from the installed APK.
        // We check for YOUR exact package so the banner only hides inside
        // your own app — never inside some other browser/app.
        if (document.referrer === ('android-app://' + APK_PACKAGE_NAME)) return true;
        return false;
    }

    function wasDismissedRecently() {
        const dismissedAt = parseInt(localStorage.getItem('install_banner_dismissed') || '0');
        const oneDay = 24 * 60 * 60 * 1000;
        return Date.now() - dismissedAt < oneDay;
    }

    function showBanner() {
        const banner = document.createElement('div');
        banner.id = 'installAppBanner';
        banner.innerHTML = `
            <button id="installBannerClose" aria-label="Close">&times;</button>
            <img src="${APP_ICON_URL}" alt="${APP_NAME}" id="installBannerIcon">
            <div id="installBannerText">
                <div id="installBannerTitle">${APP_NAME}</div>
                <div id="installBannerSub">${APP_SUBTITLE}</div>
            </div>
            <a href="${APK_DOWNLOAD_URL}" id="installBannerBtn">Install</a>
        `;
        document.body.prepend(banner);

        document.getElementById('installBannerClose').addEventListener('click', function () {
            banner.remove();
            localStorage.setItem('install_banner_dismissed', Date.now().toString());
        });
    }

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #installAppBanner {
                display: flex;
                align-items: center;
                gap: 10px;
                background: #14142c;
                border-bottom: 1px solid #2a2a5a;
                padding: 10px 12px;
                position: relative;
                z-index: 9999;
                font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            }
            #installBannerClose {
                background: none;
                border: none;
                color: #8888bb;
                font-size: 22px;
                line-height: 1;
                cursor: pointer;
                padding: 0 4px;
            }
            #installBannerIcon {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                flex-shrink: 0;
            }
            #installBannerText { flex: 1; min-width: 0; }
            #installBannerTitle {
                color: #fff;
                font-weight: bold;
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            #installBannerSub { color: #8888bb; font-size: 11px; }
            #installBannerBtn {
                background: #0088ff;
                color: #fff;
                text-decoration: none;
                font-size: 13px;
                font-weight: bold;
                padding: 8px 16px;
                border-radius: 8px;
                flex-shrink: 0;
            }
        `;
        document.head.appendChild(style);
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (isInsideInstalledApp()) return;   // hide inside the APK
        if (wasDismissedRecently()) return;    // respect the user's close tap
        injectStyles();
        showBanner();
    });
})();
