const goLoader = () => console.log('called');// location.href = "index.html"


  const languages = [
    { name: "english", code: "en", speechCode: "en-US" },
    { name: "hausa", code: "ha", speechCode: "ha-NG" },
    { name: "yoruba", code: "yo", speechCode: "yo-NG" },
    { name: "igbo", code: "ig", speechCode: "ig-NG" },
    { name: "fulfulde", code: "ff", speechCode: "ff-NG" },
    { name: "kanuri", code: "kr", speechCode: "kr-NG" },
    { name: "arabic", code: "ar", speechCode: "ar-SA" },
    { name: "french", code: "fr", speechCode: "fr-FR" },
    { name: "swahili", code: "sw", speechCode: "sw-KE" },
    { name: "zulu", code: "zu", speechCode: "zu-ZA" },
    { name: "somali", code: "so", speechCode: "so-SO" },
    { name: "amharic", code: "am", speechCode: "am-ET" },
    { name: "portuguese", code: "pt", speechCode: "pt-PT" },
    { name: "spanish", code: "es", speechCode: "es-ES" },
    { name: "german", code: "de", speechCode: "de-DE" },
    { name: "chinese", code: "zh", speechCode: "zh-CN" },
    { name: "hindi", code: "hi", speechCode: "hi-IN" },
    { name: "turkish", code: "tr", speechCode: "tr-TR" },
    { name: "russian", code: "ru", speechCode: "ru-RU" }
  ];

  const getSpeechCode = (code) => {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.speechCode : "en-US";
  };


  let multimodalSession;
  const getMultimodalSession = async () => {
    if (multimodalSession) {
      return multimodalSession;
    }

 const expectedInputs = [
  { 
    type: "text", 
    languages: [
      "en","ha","yo","ig","ff","kr","ar","fr","sw",
      "zu","so","am","pt","es","de","zh","hi","tr","ru"
    ] 
  }
];

const expectedOutputs = [
  { 
    type: "text", 
    languages: [
      "en","ha","yo","ig","ff","kr","ar","fr","sw",
      "zu","so","am","pt","es","de","zh","hi","tr","ru"
    ] 
  }
];


    const availability = await LanguageModel.availability({
      multimodal: true
    });
    
  if (availability !== 'available' && availability !== 'downloadable') return goLoader();

    multimodalSession = await LanguageModel.create({
      expectedInputs,
      expectedOutputs
    });
    return multimodalSession;
  };

  const promptAi = async (prompt, cb, lang) => {
     try {
  if (!window.LanguageModel) return goLoader()
  
  const availability = await LanguageModel.availability();
console.log(availability)
 if (availability !== 'available' && availability !== 'downloadable')
  return goLoader();

  const session = await LanguageModel.create({
    initialPrompts: [
    {
  "role": "system",
  "content": "You are an AI companion for farmers in Nigeria. Your primary role is to provide clear, practical, and localized farming advice based on Nigeria's environment, soil, weather, and common crops. Always respond in the language the user uses — whether it is Hausa, Yoruba, Igbo, Pidgin English, or English. If the user's language is unclear, use simple English by default. Avoid using symbols like **, (), or any punctuation not commonly used in normal speech, especially in voice responses. Keep your language natural and easy to understand., and you must respond base on the input language "
}
 ]
  });
  const result = await session.prompt(prompt);

  if (lang && result) {
    translateText(result, lang.code, (err, res) => {
      if (res) return cb(null, res);
      cb(null, result);
    })
  } else {
    cb(null, result);
  }
  
  
} catch (err) {
  cb(err, null);
}

  };



 const detectLanguage = async (text) => {
  try {
   if(!window.LanguageDetector) return goLoader()
    const avail = await LanguageDetector.availability();
    if(avail !== 'available') throw new Error("Language Detector Not Available")
   const detector = await LanguageDetector.create()
   const detection = await detector.detect(text)
   
    if (detection && detection[0].detectedLanguage) {
      return detection[0].detectedLanguage;
    }
    throw new Error("Language detection failed");
  } catch (err) {
    throw err;
  }
};



const translateText = async (content, targetLang = "en", cb = () => null) => {
  try {
    if(!window.Translator) return goLoader()
     const sourceLang = await detectLanguage(content);
     const availability = await Translator.availability({
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
    });

    if (availability !== "downloadable" && availability !== "available") {
      cb(false, null);
      return;
    }
 console.log(targetLang)
    const translator = await Translator.create({
  sourceLanguage: sourceLang,
  targetLanguage: targetLang
    });
    
   const translatedText = await translator.translate(content);
 console.log(translatedText)
  cb(null, translatedText);
  } catch (error) {
    cb(error, null);
  }
};



  
  const SpeechRecogniser =
    window.SpeechRecognition || window.webkitSpeechRecognition ?
    new(window.SpeechRecognition || window.webkitSpeechRecognition)() :
    false;
    
  const RecogniseSpeech = (cb = () => null, lang = "en") => {
    if (!SpeechRecogniser) {
      cb("unavailable");
      return;
    }
    
    SpeechRecogniser.continuous = true;
    SpeechRecogniser.interimResults = true;
    SpeechRecogniser.lang = lang;
    
    SpeechRecogniser.onstart = () => cb("started");
    SpeechRecogniser.onend = () => cb("ended");
    SpeechRecogniser.onerror = () => cb("ended");
    
    SpeechRecogniser.onresult = (event) => {
      let partial = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        partial += event.results[i][0].transcript;
      }
      cb("result", partial.trim());
    };
    
    SpeechRecogniser.start();
  };

  let SpeechSynthesizer = "speechSynthesis" in window ? window.speechSynthesis : false;
let oldSynthesis = null;

const speak = (text, cb = (state) => null, lang = "en") => {
  if (!SpeechSynthesizer) {
    cb("ended");
    return;
  }

  if (oldSynthesis) {
    SpeechSynthesizer.cancel();
    oldSynthesis = null;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getSpeechCode(lang);

  const setVoiceAndSpeak = () => {
    const voices = SpeechSynthesizer.getVoices();
    const match = voices.find(v => v.lang === utterance.lang) || voices.find(v => v.lang.startsWith(lang));
    if (match) {
      utterance.voice = match;
    }
    SpeechSynthesizer.speak(utterance);
  };

  utterance.onstart = () => cb("speaking");
  utterance.onend = () => cb("ended");
  utterance.onerror = () => cb("ended");

  oldSynthesis = utterance;

  if (SpeechSynthesizer.getVoices().length === 0) {
    SpeechSynthesizer.onvoiceschanged = () => setVoiceAndSpeak();
  } else {
    setVoiceAndSpeak();
  }
};

// main functionality
let messageHistory = getData("messageHistory") || [];
  
   let SelectedLang = getData("selectedLang") ||  {name: "English (United State)", code: "en"}
  
   const Messages = $(".messages");
  
   const Input = $("footer textarea");
  
   const Compose = $("footer .compose")
  
   const Languages = $(".languages");
  
   const ResetBtn = $("header .reset");
  
   const ComposeImg = $(".compose img")
  
   
  
   ResetBtn.onclick = async () => {
  
     const agreement = confirm('Are You Sure You Want To Reset App');
  
     if(agreement){
  
       SelectedLang = {
  
         code: "en",
  
         name: "english"
  
       }
  
       Languages.value = `${SelectedLang.code} ${SelectedLang.name}`
  
       Messages.innerHTML = "";
  
       AiResponding = false;
  
       updateComposer("");
  
       setData("selectedLang", SelectedLang);
  
       messageHistory = [];
  
       setData("messageHistory", messageHistory)
  
     }
  
   }
  
   
  
   
  
   
  
   let AiResponding = false
  
   
  
   let composer = {
  
     prompt: "",
  
     sendAction: "voice", // voice, send
  
     maxPrompt: 2000, // max character
  
     expandBreaks: 3,
  
     listening: false
  
   }
  
   
  
   
  
   // for selecting languages default used for speech recognition and response
  
   languages.forEach(lang => {
  
     const option = createEle("option",{
  
       value: `${lang.code} ${lang.name}`,
  
      }, lang.name)
  
      option.selected = lang.code == SelectedLang.code
  
     
  
      Languages.appendChild(option)
  
   });
  
   
  
   
  

  
   onChange(Languages, v => {
  
      const [code, name] = v.split(" ")
  
      SelectedLang = {
  
        code,
  
        name
  
      }
  
      setData("selectedLang", SelectedLang)
  
   })
  
   
  
   onInput(Input, v => {
  
     composer.prompt = v;
  
     updateComposer(v)
  
   })
  
   
  
   const updateComposer = v => {
  
     const breaks = v.split("\n").length;
  
     Input.style.height = breaks >= composer.expandBreaks ? "80px" : "auto";
  
     const isEmpty = v.trim() == "";
  
     if(!AiResponding || composer.listening) ComposeImg.src = isEmpty && SpeechRecogniser ? "./images/voice.png" : "./images/send.png";
  
     if(AiResponding && !composer.listening) ComposeImg.src = "./images/loader.gif"
  
     composer.sendAction = isEmpty ? "voice" : "text"
  
   }
  
   
  
  
  
   Compose.onclick = () => {
  
     if(AiResponding || composer.listening) return 
  
     if(composer.prompt && composer.sendAction == "text"){
  
       composeMessage(composer)
  
     }else if(SpeechRecogniser){
  
       Compose.style.transform = "scale(.8)";
  
       RecogniseSpeech((state, result) => {
  
         if(state == "started"){
  
           composer.listening = true
  
           Compose.style.background = "lightgreen";
  
           Compose.classList.add("freezed");
  
           Input.placeholder = "listening please speak...";
  
           Input.classList.add("freezed")
  
         }else if(state == "result"){
  
           Input.value += " " + result;
  
           composer.prompt = Input.value;
  
           updateComposer(Input.value)
  
         }else if(state == "ended"){
  
           Compose.style.transform = "scale(1)";
  
           Compose.classList.remove("freezed");
  
           Compose.style.background = "white";
  
           composer.listening = false;
  
           Input.classList.remove("freezed");
  
           Input.placeholder = "ask me anything related to agricultural problems am here to assist you �"
  
         }
  
       }, SelectedLang.code || "en")
  
     }
  
   }
  
   
  
   
  
   
  
   const renderMessage = ({from, translated = {}, lang, image, content, time, _id, responding = true}) => {
  
     const message = createEle('div', {
  
       "class": `message ${from}`
  
     })
  
     
  
     message.innerHTML = `
  
        ${from == "ai" && !responding ? `
  
        <div class="actions">
  
        <select class="translate active-action"> ${Languages.innerHTML} <option value="translating">translating...</option> </select>
  
        ${SpeechSynthesizer ? "<button class='speak'>Speak</button>" : ""}
        
        <button class="copy"> copy </button>
        
        </div>
  
        ` : ""}
  
       <div class="content">
  
       ${content}
  
        </div>
  
        <div class="time">
  
          ${formatTime(time)}
  
        </div>
  
     `
  
     
  
     if(from == "ai" && !responding){
  
       const Speak = message.querySelector(".speak");
  
       const Translate = message.querySelector(".translate")
  
       const Actions = message.querySelector(".actions")
  
       const Content = message.querySelector(".content");
       const Copy = message.querySelector(".copy")
  
       let currentAction = "answer";
      
       Translate.value = `${lang.code} ${lang.name}`
  
       console.log(lang)
   
       
  
       const toggleAction = ele => {
  
         message.querySelectorAll(".actions *").forEach(btn => {
  
           ele == btn ? btn.classList.add("active-action") : btn.classList.remove("active-action");
  
           if(ele == btn) currentAction = btn.textContent.toLowerCase()
  
         })
  
         
  
       }
  
       
  
       Copy.onclick = () => {
         copy(content, s => {
           if(s) alert("message copied")
         })
       }
  
       onChange(Translate, v => {
      
         if(v == "translating") return Translate.value = `${lang.code} ${lang.name}`;
  
           
  
         const [code, name] = v.split(" ");
 
         if(code == lang.code || v == "translating") return 
  
         Actions.classList.add("freezed");
  
         Translate.value = "translating";
  
         toggleAction(Translate)
  
         
  
         const update = (res, err) => {
   
           content = !res ? content : res;
  
           Content.textContent = content;
  
           Actions.classList.remove("freezed");
  
            Translate.value = res ? `${code} ${name}` : `${lang.code} ${lang.name}`
  
           
  
           if(!res) return // stop saving no translation found
            
           lang = { name, code }
  
           translated[code] = res;
  
           
  
           messageHistory = messageHistory.map(m => {
  
             return m._id == _id ? {
  
               from,
  
               _id,
  
               responding, 
  
               lang,
  
               content,
  
               translated,
  
               time,
  
               image
  
             } : m;
  
                  })
  
         }
  
         
  
         if(translated[code]) return update(translated[code])
  
         translateText(content, code, (err, res) => {
  
           update(res, err);
  
         })
  
       })
  
       
  
       
  
      if (SpeechSynthesizer) {
  
       Speak.onclick = () => {
  
         speak(content, state => {
  
           if (state == "speaking") {
  
             Actions.classList.add("freezed");
  
             Speak.textContent = "Speaking..."
  
             toggleAction(Speak)
  
           } else if (state == "ended") {
  
             Actions.classList.remove("freezed");
  
             Speak.textContent = "Speak"
  
             toggleAction(Translate)
  
           }
  
         }, lang.code)
  
       }
  

  
    
  
     }
  
       
  
     }
  
     
  
     
  
     Messages.append(message)
  
     return message
  
   }
  
   
  
   
  
   const composeMessage = async ({prompt, image}) => {
  
     AiResponding = true;
  
     const messageData = {
  
       content: prompt, 
  
       image,
  
       from: "user",
  
       time: Date.now(),
  
       _id: Date.now(),
  
       lang: SelectedLang
  
     }
  
     
  
     Input.value = " ";
  
     renderMessage(messageData);
  
     Compose.classList.add("freezed");
  
     updateComposer("")
  
     
  
     const aiMessageData = {
  
       content: "thinking .....",
  
       from: "ai",
  
       time: Date.now(),
  
       _id: Date.now(),
  
       lang: SelectedLang,
  
       translated: {},
  
       responding: true
  
     }
  
     
  
     const AiMessage = renderMessage(aiMessageData);
  
     
  
     scrollEnd($("main"))
  
     promptAi(messageData.content, async (err, res) => {
  
      console.log(err, res)
  
       if(err){
  
         return
  
       }
  
       
  
      aiMessageData.content = res;
  
      aiMessageData.responding = false;
  
      aiMessageData.translated[aiMessageData.lang.code] = res;
  
      AiMessage.remove();
  
      renderMessage(aiMessageData);
  
      if(messageData.image){
  
        const _id = await saveFile(messageData.image.file, messageData._id)
  
        messageData.image ? messageData.image.url : false
  
      }
  
      messageHistory.push(messageData)
  
      messageHistory.push(aiMessageData)
  
      AiResponding = false;
  
      Compose.classList.remove("freezed");
  
      updateComposer("")
  

  
      const speak = AiMessage.querySelector('.speak')
  
      speak.click() // for early response
  
     }, SelectedLang.code)
  
   }
  
   
  
   
  
   const initChat = async () => {
  
       messageHistory.forEach(async message => {
  
       if(message.image) message.image = {url: "./images/shimmer.gif"}
  
       const Message = renderMessage(message)
  
     })
  
     
  
     setTimeout(() => scrollEnd($("main")), 500)
  
   }
  
   
  
   initChat()
  
   
  
   onunload = () => {
  
     setData("messageHistory", messageHistory)
  
   }
  

  

  
// for pwa 
  
if ("serviceWorker" in navigator) {
  
  window.addEventListener("load", () => {
  
    navigator.serviceWorker
  
      .register("./sw.js")
  
      .then(() => console.log("Service Worker registered"))
  
      .catch(err => console.error("SW registration failed:", err));
  
  });
  
}
  
