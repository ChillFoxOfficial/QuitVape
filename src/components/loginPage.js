import { t, getLanguage, getAllLanguages, getLanguageName, setLanguage } from '../lib/i18n.js';

function renderLanguageSelector() {
  const currentLang = getLanguage();
  const languages = getAllLanguages();
  return `
    <div class="absolute top-4 right-4">
      <select id="loginLanguageSelect" class="bg-slate-900 text-white hover:bg-slate-800 px-2 py-1 rounded-full text-xs transition-all">
        ${languages.map(lang => `<option value="${lang}" ${lang === currentLang ? 'selected' : ''}>${getLanguageName(lang)}</option>`).join('')}
      </select>
    </div>
  `;
}

export function renderLoginPage(appState) {
  const isLogin = appState.authMode === 'login';
  const isForgot = appState.authMode === 'forgot';
  const isReset = appState.authMode === 'reset';

  if (isReset) {
    return `
      <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 relative">
        ${renderLanguageSelector()}
        <div class="max-w-md w-full">
          <div class="text-center mb-8">
            <div class="flex items-center justify-center mb-4">
              <div class="h-12 w-12 text-green-600 mr-2 flex items-center justify-center">
                <svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h1 class="text-3xl font-bold text-gray-800">QuitVape</h1>
            </div>
            <p class="text-gray-600 text-lg">${t('resetPassword')}</p>
          </div>

          <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="flex items-center justify-center gap-1.5 mb-5">
              <svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <p class="text-xs text-gray-500">${t('enterNewPassword')}</p>
            </div>

            <form id="resetPasswordForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${t('newPassword')}</label>
                <input
                  type="password"
                  name="newPassword"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minlength="6"
                />
                <p class="text-xs text-gray-500 mt-1">${t('passwordMinChars')}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${t('confirmPassword')}</label>
                <input
                  type="password"
                  name="confirmPassword"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minlength="6"
                />
              </div>

              <div data-error style="display: none;" class="bg-red-50 border border-red-200 rounded-lg p-3">
                <p class="text-red-600 text-sm"></p>
              </div>

              <div data-success style="display: none;" class="bg-green-50 border border-green-200 rounded-lg p-3">
                <p class="text-green-600 text-sm"></p>
              </div>

              <button
                type="submit"
                class="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ${t('resetPasswordBtn')}
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  if (isForgot) {
    return `
      <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 relative">
        ${renderLanguageSelector()}
        <div class="max-w-md w-full">
          <div class="text-center mb-8">
            <div class="flex items-center justify-center mb-4">
              <div class="h-12 w-12 text-green-600 mr-2 flex items-center justify-center">
                <svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h1 class="text-3xl font-bold text-gray-800">QuitVape</h1>
            </div>
            <p class="text-gray-600 text-lg">${t('recover')}</p>
          </div>

          <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="flex items-center justify-center gap-1.5 mb-5">
              <svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <p class="text-xs text-gray-500">${t('sendRecoveryLink')}</p>
            </div>

            <form id="forgotForm" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${t('email')}</label>
                <input
                  type="email"
                  name="email"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="${t('enterEmail')}"
                  required
                />
              </div>

              <div data-error style="display: none;" class="bg-red-50 border border-red-200 rounded-lg p-3">
                <p class="text-red-600 text-sm"></p>
              </div>

              <div data-success style="display: none;" class="bg-green-50 border border-green-200 rounded-lg p-3">
                <p class="text-green-600 text-sm"></p>
              </div>

              <button
                type="submit"
                class="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ${t('sendLink')}
              </button>
            </form>

            <div class="mt-4 text-center">
              <button class="toggleAuth text-sm text-green-600 hover:text-green-700 font-medium transition-colors" data-mode="login">
                ${t('backToLogin')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  }

  return `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4 relative">
      ${renderLanguageSelector()}
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <div class="flex items-center justify-center mb-4">
            <div class="h-12 w-12 text-green-600 mr-2 flex items-center justify-center">
              <svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-gray-800">QuitVape</h1>
          </div>
          <p class="text-gray-600 text-lg">
            ${t('journeyVapeFree')}
          </p>

          <div class="grid grid-cols-1 gap-4 mt-6 mb-8">
            <div class="flex items-center text-sm text-gray-600">
              <svg class="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8L5.586 19.414M19 7v8m0 0H5"></path>
              </svg>
              <span>${t('trackProgress')}</span>
            </div>
            <div class="flex items-center text-sm text-gray-600">
              <svg class="h-5 w-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <span>${t('saveMoney')}</span>
            </div>
            <div class="flex items-center text-sm text-gray-600">
              <svg class="h-5 w-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>${t('personalMotivation')}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="flex mb-2">
            <button class="toggleAuth flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              isLogin ? 'bg-green-600 text-white shadow-lg' : 'text-gray-600 hover:text-green-600'
            }" data-mode="login">
              ${t('login')}
            </button>
            <button class="toggleAuth flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              !isLogin ? 'bg-green-600 text-white shadow-lg' : 'text-gray-600 hover:text-green-600'
            }" data-mode="register">
              ${t('register')}
            </button>
          </div>
          <div class="flex items-center justify-center gap-1.5 mb-5">
            <svg class="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <p class="text-xs text-gray-500">${t('passwordSecure')}</p>
          </div>

          <form id="authForm" data-is-login="${isLogin}" class="space-y-4">
            ${!isLogin ? `
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  ${t('name')}
                </label>
                <input
                  type="text"
                  name="name"
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="${t('enterName')}"
                  required
                />
              </div>
            ` : ''}

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ${t('email')}
              </label>
              <input
                type="email"
                name="email"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="${t('enterEmail')}"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ${t('password')}
              </label>
              <input
                type="password"
                name="password"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="${t('enterPassword')}"
                required
                minlength="6"
              />
              <p class="text-xs text-gray-500 mt-1">${t('passwordMinChars')}</p>
            </div>

            ${isLogin ? `
              <div class="text-right">
                <button type="button" class="toggleAuth text-sm text-green-600 hover:text-green-700 font-medium transition-colors" data-mode="forgot">
                  ${t('forgotPassword')}
                </button>
              </div>
            ` : ''}

            <div data-error style="display: none;" class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-red-600 text-sm"></p>
            </div>

            <button
              type="submit"
              class="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ${isLogin ? t('enter') : t('createAccount')}
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}
