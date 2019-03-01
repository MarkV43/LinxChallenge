const servicoRemoto = 'http://roberval.chaordicsystems.com/challenge/challenge.json?callback=X';

let animationTime = 250;
let content;
let doneInitializing = false;
let doneLoading = false;
let scrollContainer;
let scrollAmount = 300;
let leftBtn, rightBtn;
let maxScroll;

function initialize() {
    let url = new URL(servicoRemoto);
    let callback = url.searchParams.get('callback');
    window[callback] = function(object) {
        content = object.data;
        if (doneLoading) {
            createVitrine();
        } else {
            doneInitializing = true;
        }
    }

    let script = document.createElement("script");
    script.src = servicoRemoto;

    document.getElementsByTagName("head")[0].appendChild(script);
}

function pageLoaded() {
    if (doneInitializing) {
        createVitrine();
    } else {
        doneLoading = true;
    }
}

function itemClicked(link) {
    let win = window.open(link, '_blank');
    win.focus();
}

function createItem(item, className="") {
    let div = document.createElement("div");
    div.classList.add("item", className);

    let img = document.createElement("img");
    img.src = item.imageName;

    div.appendChild(img);

    let desc = document.createElement("label");
    desc.innerHTML = item.name;

    div.appendChild(desc);

    if (item.oldPrice) {
        let de = document.createElement("label");
        de.classList.add("de");
        de.innerHTML = item.oldPrice;

        div.appendChild(de);
    }

    let por = document.createElement("label");
    por.classList.add("por");
    por.innerHTML = item.price;

    div.appendChild(por);

    let cond = document.createElement("label");
    cond.classList.add("info");
    cond.innerHTML = item.productInfo.paymentConditions.replace("de ", "de R$ ").replace(/(?<=\d).(?=\d)/g, ",");

    div.appendChild(cond);

    div.addEventListener("click", ()=>{
        itemClicked(item.detailUrl);
    });

    return div;
}

function createVitrine() {
    doneInitializing = false;
    doneLoading = false;

    let recommendations = document.querySelector("div#vitrine > div.body > div#recommendations");
    let reference = document.querySelector("div#vitrine > div.body > div#reference")
    let last = document.querySelector("div#vitrine > div.body > div#recommendations > div.spacer.last");

    let ref = createItem(content.reference.item, "reference");
    reference.appendChild(ref);

    let recSize = content.recommendation.length;
    for (let i = 0; i < recSize; i++) {
        let rec = createItem(content.recommendation[i], "recommendation");
        recommendations.insertBefore(rec, last);
    }

    leftBtn = document.querySelector("input[type=image]#left");
    rightBtn = document.querySelector("input[type=image]#right");
    leftBtn.addEventListener("click", scrollClick);
    rightBtn.addEventListener("click", scrollClick);

    scrollContainer = document.getElementById("recommendations");
    scrollContainer.scroll(Number.MAX_SAFE_INTEGER, 0);
    maxScroll = scrollContainer.scrollLeft;
    scrollContainer.scroll(0, 0);
}

function easeInOut(t) {
    return t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
}

function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}

let intervalAnim = null;
function scroll(amount) {
    if (intervalAnim === null) {
        let start = scrollContainer.scrollLeft;
        let end = clamp(start + amount, 0, maxScroll);
        let begin = new Date().getTime();
        intervalAnim = setInterval(function() {
            let time = new Date().getTime()
            if (begin + animationTime > time) {
                let deltaTime = time - begin;
                let linear = deltaTime / animationTime;
                let ease = easeInOut(linear);
                scrollContainer.scroll(start + amount * ease, 0);
            } else {
                let left = scrollContainer.scrollLeft;
                if (left > maxScroll) {
                    maxScroll = left;
                    end = clamp(start + amount, 0, maxScroll);
                }
                scrollContainer.scroll(end, 0);
                clearInterval(intervalAnim);
                intervalAnim = null;
            }
        }, 0);
        return end;
    } else {
        return null;
    }
}

function scrollClick() {
    if (!this.classList.contains("disabled")) {
        let r = this.id == "right";
        let scr = scroll(r ? +scrollAmount : -scrollAmount);
        if (scr !== null) {
            if (scr == (r ? maxScroll : 0)) {
                disableBtn(this);
            } else {
                enableBtn(this);
            }
            enableBtn(r ? leftBtn : rightBtn);
        }
    }
}

function enableBtn(btn) {
    btn.classList.remove("disabled");
    btn.src = btn.src.replace("grey", "blue");
}

function disableBtn(btn) {
    btn.classList.add("disabled");
    btn.src = btn.src.replace("blue", "grey");
}















try {
    document.addEventListener('DOMContentLoaded', pageLoaded, false)
} catch(e) {
    try {
    window.addEventListener('load', pageLoaded, false);
    } catch(e) {
        try {
            document.attatchEvent("onreadystatechange", pageLoaded);
        } catch(e) {
            window.attatchEvent("onload", pageLoaded);
        }
    }
}
initialize()
