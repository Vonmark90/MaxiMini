var searchbar = require('searchbar/searchbar.js')
var webviews = require('webviews.js')
var modalMode = require('modalMode.js')
var urlParser = require('util/urlParser.js')
var keyboardNavigationHelper = require('util/keyboardNavigationHelper.js')
var bookmarkStar = require('navbar/bookmarkStar.js')
var contentBlockingToggle = require('navbar/contentBlockingToggle.js')

const tabEditor = {
  container: document.getElementById('tab-editor'),
  input: document.getElementById('tab-editor-input'),
  securityIcon: document.getElementById('address-bar-security-icon'),
  star: null,
  contentBlockingToggle: null,
  isShown: false,
  show: function (tabId, editingValue, showSearchbar) {
    /* Edit mode is not available in modal mode. */
    if (modalMode.enabled()) {
      return
    }

    tabId = tabId || tabs.getSelected()
    tabEditor.isShown = true

    if (tabEditor.star) {
      bookmarkStar.update(tabId, tabEditor.star)
    }
    if (tabEditor.contentBlockingToggle) {
      contentBlockingToggle.update(tabId, tabEditor.contentBlockingToggle)
    }

    var currentTab = tabs.get(tabId)
    tabEditor.updateSecurity(currentTab)

    document.body.classList.add('is-edit-mode')

    var currentURL = currentTab ? urlParser.getSourceURL(currentTab.url) : ''
    if (currentURL === 'min://newtab') {
      currentURL = ''
    }

    tabEditor.input.value = editingValue !== undefined && editingValue !== null ? editingValue : currentURL
    tabEditor.input.focus()
    if (!editingValue) {
      tabEditor.input.select()
    }
    tabEditor.input.scrollLeft = 0

    searchbar.show(tabEditor.input)

    if (showSearchbar !== false) {
      if (editingValue) {
        searchbar.showResults(editingValue, null)
      } else {
        searchbar.showResults(tabEditor.input.value, null)
      }
    }
  },
  hide: function () {
    tabEditor.isShown = false

    tabEditor.input.blur()
    searchbar.hide()

    document.body.classList.remove('is-edit-mode')
    webviews.hidePlaceholder('editMode')

    // Immediately sync the displayed URL to the current page after dismissal
    var tabId = tabs.getSelected()
    if (tabId) {
      var tab = tabs.get(tabId)
      if (tab) {
        var currentURL = urlParser.getSourceURL(tab.url)
        tabEditor.input.value = (currentURL === 'min://newtab' || !currentURL) ? '' : currentURL
      }
    }
  },
  updateSecurity: function (tab) {
    if (!tabEditor.securityIcon) {
      tabEditor.securityIcon = document.getElementById('address-bar-security-icon')
    }
    if (!tabEditor.securityIcon) {
      return
    }

    var currentURL = tab ? tab.url : ''
    var isNewTab = !currentURL || currentURL === '' || currentURL === urlParser.parse('min://newtab')

    tabEditor.securityIcon.className = 'i'
    if (isNewTab) {
      tabEditor.securityIcon.classList.add('carbon:search')
      tabEditor.securityIcon.title = l('searchbarPlaceholder')
    } else if (tab && tab.secure === true) {
      tabEditor.securityIcon.classList.add('carbon:locked', 'secure-icon')
      tabEditor.securityIcon.title = 'Connection is secure'
    } else if (tab && tab.secure === false) {
      tabEditor.securityIcon.classList.add('carbon:unlocked', 'insecure-icon')
      tabEditor.securityIcon.title = l('connectionNotSecure')
    } else {
      tabEditor.securityIcon.classList.add('carbon:locked', 'secure-icon')
      tabEditor.securityIcon.title = 'MaxiMini'
    }
  },
  update: function (tabId) {
    tabId = tabId || tabs.getSelected()
    if (!tabId) {
      return
    }
    var tab = tabs.get(tabId)
    if (!tab) {
      return
    }

    if (tabEditor.star) {
      bookmarkStar.update(tabId, tabEditor.star)
    }
    if (tabEditor.contentBlockingToggle) {
      contentBlockingToggle.update(tabId, tabEditor.contentBlockingToggle)
    }

    tabEditor.updateSecurity(tab)

    // Always update the URL unless the user is actively typing in the address bar
    if (!tabEditor.isShown || document.activeElement !== tabEditor.input) {
      var currentURL = urlParser.getSourceURL(tab.url)
      if (currentURL === 'min://newtab' || !currentURL) {
        tabEditor.input.value = ''
      } else {
        tabEditor.input.value = currentURL
      }
    }
  },
  initialize: function () {
    tabEditor.container.hidden = false
    tabEditor.input.setAttribute('placeholder', l('searchbarPlaceholder'))

    tabEditor.star = bookmarkStar.create()
    tabEditor.container.appendChild(tabEditor.star)

    tabEditor.contentBlockingToggle = contentBlockingToggle.create()
    tabEditor.container.appendChild(tabEditor.contentBlockingToggle)

    keyboardNavigationHelper.addToGroup('searchbar', tabEditor.container)

    let selectAllOnNextMouseUp = false

    tabEditor.input.addEventListener('focus', function () {
      if (!tabEditor.isShown) {
        selectAllOnNextMouseUp = true
        tabEditor.show(tabs.getSelected(), null, true)
      }
    })

    tabEditor.input.addEventListener('mouseup', function (e) {
      if (selectAllOnNextMouseUp) {
        selectAllOnNextMouseUp = false
        e.preventDefault()
        tabEditor.input.select()
      }
    })

    tabEditor.input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        tabEditor.hide()
        tabEditor.update(tabs.getSelected())
        webviews.focus()
        e.preventDefault()
      }
    })

    tabEditor.input.addEventListener('input', function (e) {
      if (e.isComposing) {
        return
      }

      searchbar.showResults(this.value, {
        isDeletion: e.inputType ? e.inputType.includes('delete') : false
      })
    })

    tabEditor.input.addEventListener('compositionend', function (e) {
      searchbar.showResults(this.value)
    })

    tabEditor.input.addEventListener('keypress', function (e) {
      if (e.keyCode === 13) { // return key pressed; update the url
        if (this.getAttribute('data-autocomplete-text') && this.getAttribute('data-autocomplete-text').toLowerCase() === this.value.toLowerCase()) {
          searchbar.openURL(this.getAttribute('data-autocomplete-ref') || this.getAttribute('data-autocomplete-text'), e)
        } else {
          searchbar.openURL(this.value, e)
        }
        e.preventDefault()
      }

      if (e.key && this.selectionEnd === this.value.length && this.value[this.selectionStart] === e.key) {
        this.selectionStart += 1
        e.preventDefault()
        searchbar.showResults(this.value.substring(0, this.selectionStart), {})
      }
    })

    document.getElementById('webviews').addEventListener('click', function () {
      tabEditor.hide()
      tabEditor.update(tabs.getSelected())
    })

    tasks.on('tab-selected', function (id) {
      tabEditor.update(id)
    })

    tasks.on('tab-updated', function (id, key) {
      if (id === tabs.getSelected() && ['url', 'secure', 'title'].includes(key)) {
        tabEditor.update(id)
      }
    })

    webviews.bindEvent('did-navigate', function (tabId) {
      if (tabId === tabs.getSelected()) {
        tabEditor.update(tabId)
      }
    })

    webviews.bindEvent('did-navigate-in-page', function (tabId) {
      if (tabId === tabs.getSelected()) {
        tabEditor.update(tabId)
      }
    })
  }
}

tabEditor.initialize()

module.exports = tabEditor
