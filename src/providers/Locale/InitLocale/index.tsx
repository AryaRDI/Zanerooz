import Script from 'next/script'
import React from 'react'

export const InitLocale: React.FC = () => {
  return (
    <Script
      id="locale-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  var COOKIE_NAME = 'payload-locale';
  var LOCALES = ['en', 'fa'];
  var DEFAULT_LOCALE = 'fa';
  var RTL_LOCALES = ['fa'];

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function getBrowserLocale() {
    var browserLang = navigator.language.split('-')[0];
    return LOCALES.indexOf(browserLang) !== -1 ? browserLang : null;
  }

  var cookieLocale = getCookie(COOKIE_NAME);
  var browserLocale = getBrowserLocale();
  var locale = cookieLocale || browserLocale || DEFAULT_LOCALE;

  // Validate locale
  if (LOCALES.indexOf(locale) === -1) {
    locale = DEFAULT_LOCALE;
  }

  var isRTL = RTL_LOCALES.indexOf(locale) !== -1;

  document.documentElement.lang = locale;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

  // Save to cookie if not already set
  if (!cookieLocale) {
    var maxAge = 60 * 60 * 24 * 365;
    document.cookie = COOKIE_NAME + '=' + locale + '; path=/; max-age=' + maxAge + '; SameSite=Lax';
  }
})();
        `,
      }}
    />
  )
}
