const html = document.documentElement;


const $ = ele => ele.includes('*') ? 
document.querySelectorAll(ele.replace('*','')) :
document.querySelector(ele);
const appname = "AgriVoice";
const url = location.href
const PRODUCTION_URL = "http://localhost:8080";
const VIEW_URL = new URL(url).origin;
const API_BASE_URL = VIEW_URL == "http://localhost:7700" ? PRODUCTION_URL : VIEW_URL

document.title = `${appname} | ${document.title}`
const createEle = (tagName,attribute,text = "") => {
  const ele = document.createElement(tagName);
  const attributes = [];
  ele.className += "HTML_ELEMENT"
  
  for(name in attribute){
    attributes.push({name,value: attribute[name]})
  }
  
  attributes.forEach(attr => {
    ele.setAttribute(attr.name,attr.value)
  })
  
  ele.textContent = text
  
  return ele
}


const getData = key => {
  let data = localStorage.getItem(key)
  try{
    return data == 'undefined' ? false : JSON.parse(data)
  }catch(er){
    return false
  }
}


const setData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value)) || false
}

const deleteData = key => localStorage.removeItem(key)


 const open = (ele, display = "block") => {
   if(!ele) return
   //ele.style.opacity = 1
   ele.style.display = display;
   ele.style.zIndex = 5;
   ele.style.pointerEvents = "visiblePainted"
 }
 
 const close = ele => {
   if(!ele) return
  // ele.style.opacity = 0;
   ele.style.zIndex = -1;
   ele.style.pointerEvents = "none"
 }
 
 const now = () => Date.now()

const copy = (t, c) => {
  navigator.clipboard.writeText(t)
  .then(() => c(true))
  .catch(() => c(false))
}

const onLongPress = (ele, callback, eventCb = () => null, delay = .2) => {
  let timer;

   let touchend = () => clearTimeout(timer);
   let touchstart = e => {
    timer = setTimeout(() => callback(e), delay * 1000);
    ele.addEventListener('touchend', touchend)
    }
    
   let touchmove = () => clearTimeout(timer)
  
  
  ele.addEventListener("touchstart", touchstart)
  ele.addEventListener("touchmove", touchmove);
  
  eventCb({touchstart, touchend, touchmove})
}


const setContent = (ele, content, selector) => {
  let element;
  if(selector){
   element = selector.includes('*') ?
   ele.querySelectorAll(selector.replace('*', '')) : ele.querySelector(selector);
  }else{
    element = ele
  }
  
  element.textContent = content
}

const onInput = (input, callback) => {
  window.addEventListener('pageshow', function(event) {
    callback(input.value)
});

  input.oninput = () => {
    callback(input.value)
  }
}


function scrollTo(targetElement, parentElement) {
  targetElement.scrollIntoView({
    block: 'center',
    behavior: 'instant'
  });
}


const removeEleById = id => {
  const ele = document.getElementById(id)
  ele.remove()
}



function formatTime(timestamp) {
  const date = new Date(parseInt(timestamp));
  const now = new Date();
  
  // Calculate time difference
  const diffSeconds = Math.floor((now - date) / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  
  // Check if the date is today
  if (date.toDateString() === now.toDateString()) {
    if (diffMinutes < 1) return 'Now';
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours < 12 ? 'am' : 'pm';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}${period}`;
  }
  
  // Check if the date is within the same week
  if (diffDays < 7) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }
  
  // Format date as day/month/year with time
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? 'am' : 'pm';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${day}/${month}/${year} ${formattedHours}:${formattedMinutes}${period}`;
}

// for checking input static val changes eg in settings 
const inputHasChanged = (input, staticAtrr = "staticVal") => {
  const staticVal = input.getAttribute(staticAtrr);
  return (input.value && input.value !== staticVal)
}


// for select etc 
const onChange = (input, cb) => {
  input.addEventListener("change", () => {
    cb(input.value)
  })
}

const scrollEnd = ele => {
  ele.scrollTop = ele.scrollHeight
}






async function getFileMetadata(file, other = { buffer: false, blob: false }) {
    const name = file.name || '';
    const extension = name.split('.').pop()?.toLowerCase() || '';
    const mime = file.type || '';

    let fileTypeCategory;

    if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(extension) || mime.includes("application/x-msdos-program")) {
        fileTypeCategory = 'audio';
    } else if (mime.startsWith('video/') || ['mp4', 'mkv', 'mov', 'avi', 'webm'].includes(extension)) {
        fileTypeCategory = 'video';
    } else if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
        fileTypeCategory = 'image';
    } else {
        fileTypeCategory = 'raw';
    }

    if (other.buffer || other.blob) {
        const buffer = await file.arrayBuffer();
        if (other.buffer) other.buffer = buffer;
        if (other.blob) other.blob = new Blob([buffer], { type: mime || 'application/octet-stream' });
    }

    return {
        name,
        extension,
        mime,
        _id: Date.now(),
        type: fileTypeCategory,
        size: file.size / (1024 * 1024), // MB
        lastModified: file.lastModified,
        lastModifiedDate: file.lastModifiedDate,
        ...other
    };
}


