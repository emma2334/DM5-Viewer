// ==UserScript==
// @name         DM5 Viewer
// @version      1.1.2
// @description  A script to expand comic content.
// @author       Emma (emma2334)
// @match        *://www.dm5.com/m*
// @exclude      *://www.dm5.com/manhua-*
// @exclude      *://www.dm5.com/m*-end/
// @match        *://tel.1kkk.com/ch*
// @match        *://tel.1kkk.com/ep*
// @match        *://tel.1kkk.com/other*
// @icon         https://www.google.com/s2/favicons?domain=dm5.com
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/emma2334/DM5-Veiwer/master/DM5Viewer.user.js
// ==/UserScript==

(function() {
  const cookie = document.cookie.split(';').reduce((obj, e) => {
    const [ key, value ] = e.split('=')
    return {
      ...obj,
      [key.replace(/\s/g, '')]: value
    }
  }, {})

  const config = {
    AUTO_SCROLL: false,
    RESIZE: cookie.nautosize,
    NEED_EXPAND: !document.getElementById('barChapter'),
  }

  // modify display
  document.querySelectorAll('.view-comment, .sub-manga').forEach(e => {e.style.display = 'none'})
  document.querySelectorAll('.yddiv').forEach(e => e.remove())
  document.head.insertAdjacentHTML('beforeend', '<style>\
      #showimage.resize img { max-width: 90vw; }\
      #showimage img { margin-bottom: 25px; }\
      .rightToolBar a.text { display: flex; align-items:center; justify-content:center; line-height: 1; }\
      .rightToolBar .text label:hover { cursor: pointer;}\
      #autoNext { position: absolute; visibility: hidden; }\
      #autoNext + label { color: #808080; }\
      #autoNext:checked + label { color: #ffffff; }\
      .white #autoNext:checked + label { color: #212121; }\
    </style>')

  // sync with resize setting in cookie
  const resizeBtn = document.querySelectorAll('.rightToolBar a.logo_3')[0]
  resizeBtn.classList.toggle('active', config.RESIZE === 'true')

  // auto scroll
  let scroll = false, intervalHandle
  const setAutoScroll = (scroll = true) => {
    if (scroll) {
      config.AUTO_SCROLL = true
      intervalHandle = setInterval(() => window.scrollBy(0, 1), 10)
    } else {
      config.AUTO_SCROLL = false
      clearInterval(intervalHandle)
    }
  }

  document.addEventListener('keydown', e => {
    if (e.which === 32) {
      e.preventDefault()
      setAutoScroll(!config.AUTO_SCROLL)
    }
  })

  // change chapter
  document.getElementsByClassName('rightToolBar')[0]
    .insertAdjacentHTML('beforeend',
      '<a class="text">\
        <div class="tip" id="">換章</div>\
        <input type="checkbox" id="autoNext"><label for="autoNext">ᴀᴜᴛᴏ ɴᴇxᴛ</label>\
      </a>'
    )
  document.getElementById('autoNext').checked = localStorage.getItem('autoNext') !== 'false' ? true : false

  let alertWasTriggered = false
  const next = document.querySelectorAll('.rightToolBar a.logo_2')
  window.addEventListener('scroll', () => {
    if(scrollY > document.getElementsByTagName('footer')[0].offsetTop - window.innerHeight){
      if(config.AUTO_SCROLL){
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
            document.getElementById('showimage')
              .insertAdjacentHTML('beforeend', `<img src="${e}" alt="${count}"><br>`)
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
  }
})()
