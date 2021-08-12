// ==UserScript==
// @name         DM5 Viewer
// @version      1.2.1
// @description  A script to expand comic content.
// @author       Emma (emma2334)
// @include      /^http[s]?\:\/\/.*(dm5|1kkk|online).*\/m[0-9]+/
// @exclude      /^http[s]?\:\/\/.*dm5.*\/manhua-.*/
// @exclude      /^http[s]?\:\/\/m.dm5.*\/m[0-9]+/
// @include      /^http[s]?\:\/\/.*1kkk.*\/(ch|ep|other).+/
// @exclude      /^http[s]?\:\/\/m.1kkk.*/
// @icon         https://www.google.com/s2/favicons?domain=dm5.com
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/emma2334/DM5-Veiwer/master/DM5Viewer.user.js
// ==/UserScript==

document.onreadystatechange = function() {
  if(document.readyState !== 'complete') return

  const cookie = document.cookie.split(';').reduce((obj, e) => {
    const [ key, value ] = e.split('=')
    return {
      ...obj,
      [key.replace(/\s/g, '')]: value
    }
  }, {})

  const config = {
    SCROLL: false,
    SCROLL_SPEED: 0,
    RESIZE: cookie.nautosize,
    NEED_EXPAND: !document.getElementById('barChapter'),
  }

  // modify display
  document.querySelectorAll('.view-comment, .sub-manga').forEach(e => {e.style.display = 'none'})
  document.querySelectorAll('.yddiv').forEach(e => e.remove())
  document.head.insertAdjacentHTML('beforeend', `<style>
      #showimage.resize img {
        max-width: 90vw;
      }
      #showimage img {
        display: block;
        margin: 0 auto 25px;
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

  // sync with resize setting in cookie
  const resizeBtn = document.querySelectorAll('.rightToolBar a.logo_3')[0]
  resizeBtn.classList.toggle('active', config.RESIZE === 'true')

  // auto scroll
  document.getElementsByClassName('rightToolBar')[0]
    .insertAdjacentHTML('beforeend',
      '<a class="text">\
        <div class="tip">捲動</div>\
        <div id="speed" data-speed="0" data-scroll="false"><br />⟱</div>\
      </a>'
    )
  let intervalHandle
  const setAutoScroll = (speed = 0, scroll = true) => {
    config.SCROLL_SPEED = speed % 6
    config.SCROLL = config.SCROLL_SPEED && scroll
    clearInterval(intervalHandle)
    intervalHandle = setInterval(() => window.scrollBy(0, scroll ? config.SCROLL_SPEED : 0), 10)
    document.getElementById('speed').setAttribute('data-speed', config.SCROLL_SPEED)
    document.getElementById('speed').setAttribute('data-scroll', config.SCROLL)
  }

  document.addEventListener('keydown', e => {
    if (e.which === 32) {
      e.preventDefault()
      setAutoScroll(config.SCROLL_SPEED || 1, !config.SCROLL)
    }
  })

  document.getElementById('speed').parentElement.addEventListener('click', () => {
    setAutoScroll(++config.SCROLL_SPEED)
  })

  // change chapter
  document.getElementsByClassName('rightToolBar')[0]
    .insertAdjacentHTML('beforeend',
      '<a class="text">\
        <div class="tip">換章</div>\
        <input type="checkbox" id="autoNext"><label for="autoNext">ᴀᴜᴛᴏ ɴᴇxᴛ</label>\
      </a>'
    )
  document.getElementById('autoNext').checked = localStorage.getItem('autoNext') !== 'false' ? true : false

  let alertWasTriggered = false
  const next = document.querySelectorAll('.rightToolBar a.logo_2')
  window.addEventListener('scroll', () => {
    if(scrollY > document.getElementsByTagName('footer')[0].offsetTop - window.innerHeight){
      if(config.SCROLL_SPEED){
        setAutoScroll(false)
      }
      if(!alertWasTriggered && localStorage.getItem('autoNext') !== 'false'){
        alertWasTriggered = true
        setTimeout(() => {
          next.length ? window.location.href = next[0].href : alert('目前為最新章節')
        }, 500);
      }
    } else {
      alertWasTriggered = false
    }
  })

  document.getElementById('autoNext').addEventListener('change', e => {
    localStorage.setItem('autoNext', e.target.checked)
  })


  // current page
  document.querySelector('.rightToolBar').insertAdjacentHTML('beforebegin', `<div id="page"><span class="cur">1</span>/${DM5_IMAGE_COUNT}<div>`)
  const visibility = []
  const observe = new IntersectionObserver((e, o) => {
    e.forEach(img => {
      visibility[img.target.dataset.page] = img.isIntersecting
    })
    document.querySelector('#page .cur').innerHTML = visibility.indexOf(true)
  }, {
    rootMargin: `-33% 0px 0px 0px`,
    threshold: 0
  })


  if(config.NEED_EXPAND) {
    document.querySelectorAll('.view-paging').forEach(e => {e.style.display = 'none'})
    document.getElementById('showimage').innerHTML = ''
    document.getElementById('showimage').style.minHeight = '150vh'

    // expand content
    const getImg = (count = 1) => {
      fetch(`chapterfun.ashx?cid=${DM5_CID}&page=${count}&language=${1}&gtk=${6}&_cid=${DM5_CID}&_mid=${DM5_MID}&_dt=${DM5_VIEWSIGN_DT}&_sign=${DM5_VIEWSIGN}`)
        .then(res => res.text())
        .then(res => {
          eval(res).forEach(e => {
            const img = document.createElement('img')
            img.src = e
            img.dataset.page = count
            observe.observe(img)
            document.getElementById('showimage')
              .insertAdjacentElement('beforeend', img)
            count++
          })
          if (count <= DM5_IMAGE_COUNT) getImg(count)
        })
    }
    setTimeout(() => getImg(), 500)

    // setup resizing
    document.getElementById('showimage').classList.toggle('resize', config.RESIZE === 'true')
    resizeBtn.addEventListener('click', () => {
      document.getElementById('showimage').classList.toggle('resize')
    })
  } else {
    document.querySelectorAll('#barChapter > img').forEach((e, i) => {
      e.dataset.page = i + 1
      observe.observe(e)
    })
  }
}
