// ==UserScript==
// @name         DM5 Viewer
// @version      2.1.0
// @description  A script to expand comic content.
// @author       Emma (emma2334)
// @homepage     https://emma2334.github.io
// @include      /^http[s]?\:\/\/.*(dm5|1kkk|online).*\/m[0-9]+/
// @exclude      /^http[s]?\:\/\/.*dm5.*\/manhua-.*/
// @exclude      /^http[s]?\:\/\/m.dm5.*\/m[0-9]+/
// @include      /^http[s]?\:\/\/.*1kkk.*\/(ch|ep|other).+/
// @exclude      /^http[s]?\:\/\/m.1kkk.*/
// @icon         https://www.google.com/s2/favicons?domain=dm5.com
// @grant        none
// @downloadURL  https://github.com/emma2334/DM5-Viewer/raw/master/DM5Viewer.user.js
// ==/UserScript==

const dom = {
  all: (selector, cb = function () {}) => {
    document.querySelectorAll(selector).forEach((e, i) => cb(e, i))
  },
  find: (selector, index = 0) => document.querySelectorAll(selector)[index],
}

Object.entries({
  before: 'beforebegin',
  prepend: 'afterbegin',
  append: 'beforeend',
  after: 'afterend',
}).forEach(e => {
  HTMLElement.prototype[e[0]] = function (html) {
    typeof html instanceof Element || html instanceof HTMLElement
      ? this.insertAdjacentElement(e[1], html)
      : this.insertAdjacentHTML(e[1], html)
  }
})

const DM5Viewer = {
  config: {
    SCROLL: false,
    SCROLL_SPEED: 0,
    RESIZE: document.cookie.match('nautosize=([^;]+)')?.[1],
    IS_WEBTOON: dom.find('#barChapter'),
  },
  expandContent: ({ total = 0, imgControl = () => {} }) => {
    let count = 1
    ;(function getImg() {
      fetch(
        `chapterfun.ashx?cid=${DM5_CID}&page=${count}&language=1&gtk=6&_cid=${DM5_CID}&_mid=${DM5_MID}&_dt=${DM5_VIEWSIGN_DT}&_sign=${DM5_VIEWSIGN}`
      )
        .then(res => res.text())
        .then(res => {
          eval(res).forEach(e => {
            const img = document.createElement('img')
            img.src = e
            img.classList.add('loading')
            img.dataset.page = count
            img.onload = function () {
              img.classList.remove('loading')
            }
            dom.find('#showimage').append(img)
            imgControl(img)
            count++
          })
          if (count <= total) getImg(count)
        })
    })()
  },
  addBtn: ({ tip, content }) => {
    dom.find('.rightToolBar').append(
      `<a class="text">
        <div class="tip">${tip}</div>
        ${content}
      </a>`
    )
  },
  addAutoScrollEvent: ({ keydown, click }) => {
    !dom.find('#speed') &&
      DM5Viewer.addBtn({
        tip: '捲動',
        content:
          '<div id="speed" data-speed="0" data-scroll="false"><br />⟱</div>',
      })

    // keyboard event
    let controled
    document.addEventListener('keyup', e => {
      if (e.which === 18 || e.which === 91 || e.which === 93) controled = false
    })
    document.addEventListener('keydown', e => {
      if (e.which === 18 || e.which === 91 || e.which === 93) controled = true
      keydown(e, controled)
    })

    // click event
    dom.find('#speed').parentElement.addEventListener('click', e => click(e))

    const config = DM5Viewer.config
    let handler
    return (speed = 0, scroll = true) => {
      config.SCROLL_SPEED = speed % 6
      config.SCROLL = config.SCROLL_SPEED && scroll
      clearInterval(handler)
      handler = setInterval(
        () => window.scrollBy(0, scroll ? config.SCROLL_SPEED : 0),
        10
      )
      dom.find('#speed').setAttribute('data-speed', config.SCROLL_SPEED)
      dom.find('#speed').setAttribute('data-scroll', config.SCROLL)
    }
  },
  observeCurrentPage: () => {
    dom
      .find('.rightToolBar')
      .before(
        `<div id="page"><span class="cur">1</span>/${DM5_IMAGE_COUNT}<div>`
      )
    const visibility = []
    return new IntersectionObserver(
      (e, o) => {
        e.forEach(img => {
          visibility[img.target.dataset.page] = img.isIntersecting
        })
        dom.find('#page .cur').innerHTML = visibility.indexOf(true)
      },
      { rootMargin: '-33% 0px 0px 0px', threshold: 0 }
    )
  },
}

document.onreadystatechange = function () {
  if (document.readyState !== 'complete') return
  const config = DM5Viewer.config

  /* modify display */
  dom.all('.yddiv, .view-comment, .sub-manga', e => {
    e.style.display = 'none'
  })
  dom.find('head').append(`<style>
    body {
      overflow: auto !important;
    }
    #showimage.resize img {
      max-width: 90vw;
    }
    #showimage img {
      display: block;
      margin: 0 auto 25px;
    }
    #showimage img.loading {
      position: relative;
      min-height: 800px;
      background-color: grey;
    }
    #showimage img.loading:before {
      content: attr(data-page);
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      color: #fff;
      font-size: 72px;
    }
    #showimage, #barChapter {
      min-height: 200vh;
    }
    .rightToolBar,
    #page {
      color: #808080;
    }
    .rightToolBar a.text {
      display: flex;
      align-items:center;
      justify-content:center;
      line-height: 1;
    }
    .rightToolBar a.text *:hover {
      cursor: pointer;
    }
    .rightToolBar a.text:hover,
    #speed[data-scroll="true"]:not([data-speed="0"]),
    #autoNext:checked + label {
      color: #ffffff;
    }
    .white .rightToolBar a:hover,
    .white #speed[data-scroll="true"]:not([data-speed="0"]),
    .white #autoNext:checked + label {
      color: #212121;
    }
    #autoNext {
      position: absolute;
      visibility: hidden;
    }
    #speed {
      width: 100%;
      text-align: center;
    }
    #speed:before {
      content: attr(data-speed)"x";
    }
    #page {
      position: fixed;
      right: 25px;
      bottom: 80px;
    }
    #page .cur {
      font-size: 1.5em;
      font-weight: bold;
      color: #ffffff;
    }
    .white #page .cur {
      color: #f7545a;
    }
  </style>`)

  /* sync with resize setting in cookie */
  const resizeBtn = dom.find('.rightToolBar a.logo_3')
  resizeBtn.classList.toggle('active', config.RESIZE === 'true')

  /* auto scroll */
  const setAutoScroll = DM5Viewer.addAutoScrollEvent({
    keydown: (e, controled) => {
      // white space
      if (e.which === 32) {
        e.preventDefault()
        setAutoScroll(config.SCROLL_SPEED || 1, !config.SCROLL)
      }
      // up key
      else if (!controled && e.which === 38) {
        e.preventDefault()
        config.SCROLL_SPEED = Math.min(++config.SCROLL_SPEED, 5)
        setAutoScroll(config.SCROLL_SPEED, config.SCROLL)
      }
      // down key
      else if (!controled && e.which === 40) {
        e.preventDefault()
        config.SCROLL_SPEED = Math.max(--config.SCROLL_SPEED, 0)
        setAutoScroll(config.SCROLL_SPEED, config.SCROLL)
      }
    },
    click: e => {
      setAutoScroll(++config.SCROLL_SPEED)
    },
  })

  /* trun to next chapter */
  DM5Viewer.addBtn({
    tip: '換章',
    content:
      '<input type="checkbox" id="autoNext"><label for="autoNext">ᴀᴜᴛᴏ ɴᴇxᴛ</label>',
  })
  dom.find('#autoNext').checked = localStorage.getItem('autoNext') !== 'false'

  dom.find('#autoNext').addEventListener('change', e => {
    localStorage.setItem('autoNext', e.target.checked)
  })

  new IntersectionObserver(e => {
    const { isIntersecting } = e[0]
    setAutoScroll(0)
    if (isIntersecting && localStorage.getItem('autoNext') !== 'false') {
      const next = dom.find('.rightToolBar a.logo_2')
      setTimeout(() => {
        next ? (window.location.href = next.href) : alert('目前為最新章節')
      }, 500)
    }
  }).observe(dom.find('footer'))

  /* current page */
  const observe = DM5Viewer.observeCurrentPage()

  if (!config.IS_WEBTOON) {
    dom.all('.view-paging', e => {
      e.style.display = 'none'
    })
    dom.find('#showimage').innerHTML = ''
    dom.find('#showimage').style.minHeight = '200vh'

    // expand content
    DM5Viewer.expandContent({
      total: DM5_IMAGE_COUNT,
      imgControl: img => {
        observe.observe(img)
      },
    })

    // setup resizing
    dom.find('#showimage').classList.toggle('resize', config.RESIZE === 'true')
    resizeBtn.addEventListener('click', () => {
      dom.find('#showimage').classList.toggle('resize')
    })
  } else {
    dom.all('#barChapter > img', (e, i) => {
      e.dataset.page = i + 1
      observe.observe(e)
    })
  }
}
