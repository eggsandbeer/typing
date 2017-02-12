/**
  * Typing
  * @author Cameron Strandberg (http://cameronstrandberg.com)
  * @version 1.0.0
  * @copyright 2017 Cameron Stranberg
  * @description Types out a given string or strings using only Javascript.
*/

/**
  * based on:
  * jQuery TypeIt
  * @author Alex MacArthur (http://macarthur.me)
  * @version 4.3.0
  * @copyright 2016 Alex MacArthur
  * @description Types out a given string or strings.
*/

const Typing = {
  start() {
    this.queue = [];
    this.queueIndex = 0;
    this.hasStarted = false;
    this.inTag = false;
    this.stringsToDelete = '';
    this.style = {
      display: 'inline',
      position: 'relative',
      font: 'inherit',
      color: 'inherit'
    }
    // this.style = 'style="display:inline;position:relative;font:inherit;color:inherit;"';
    this.el = document.querySelector(this.el);
    this.strings = this._toArray(this.options.strings);

    this._elCheck();

    this.el.innerHTML = `<i class="ti-placeholder" style="display:inline-block;width:0;line-height:0;overflow:hidden;">.</i><span class="ti-container"></span>`;

    this.tel = this.el.querySelector('span');

    Object.assign(this.tel.style, this.style)

    if (this.options.startDelete) {
      this.tel.innerHTML = this.stringsToDelete;
      this.queue.push([this._delete]);
    }

    this._generateQueue();
    this._kickOff();

    return this;
  },
  startTyping(string) {
    this.options = Object.assign(this.options, {strings: string});

    this.strings = this._toArray(this.options.strings)

    this._generateQueue();

    return this;
  },
  deleteText(num) {
    this.queue.push([this._delete, num]);
    return this;
  },
  insertBreak() {
    this.queue.push([this._break]);
    return this;
  },
  setPause(time) {
    this.queue.push([this._pause, time]);
    return this;
  },
  changeSettings(options) {
    this.queue.push([this._mergeSet, options]);

    return this;
  },
  _generateQueue() {
    for(let i = 0; i < this.strings.length; i++){

      this.queue.push([this._type, this.strings[i]])

      if(i < (this.strings.length - 1)) {
        const curPos = this.queue.length;
        const delay = this.options.breakLines ? this.options.breakDelay : this.options.deleteDelay;
        this.queue.push([this.options.breakLines ? this._break : this._delete]);
        this.queue.splice(curPos, 0, [this._pause, delay / 2]);
        this.queue.splice(curPos + 2, 0, [this._pause, delay / 2]);
      }
    }
  },
  _kickOff() {
    this._cursor();

    if (this.options.autoStart) {
      this._startQueue();
    } else {
      if (this._isVisible()) {
        this.hasStarted = true;
        this._startQueue();
      } else {
        window.document.addEventListener('scroll', function() {
          if (this._isVisible() && !this.hasStarted) {
            this.hasStarted = true;
            this._startQueue();
          }
        }.bind(this));
      }
    }
  },
  _startQueue() {
    this._to(function() {
      this._executeQueue();
    }.bind(this), this.options.startDelay);
  },
  _executeQueue() {
    if (this.queueIndex < this.queue.length) {
      var thisFunc = this.queue[this.queueIndex];
      this.queueIndex++;

      // delay execution if looping back to the beginning of the queue.
      if (this.isLooping && this.queueIndex === 1) {
        this._to(function() {
          thisFunc[0].bind(this)(thisFunc[1]);
        }.bind(this), this.options.loopDelay / 2);
      } else {
        thisFunc[0].bind(this)(thisFunc[1]);
      }
    } else {
      if (this.options.loop) {
        this.queueIndex = 0;
        this.isLooping = true;
        this._to(function() {
          this._delete();
        }.bind(this), this.options.loopDelay / 2);
      } else {
        this.options.callback();
      }
    }
  },
  _to: function(fn, time) {
    setTimeout(function() {
      fn();
    }.bind(this), time);
  },
  _mergeSet: function(options) {
    this.options = Object.assign(this.options, options)
    this._executeQueue();
  },
  _cursor() {
    if (this.options.cursor) {

      var cursorSpan = document.createElement('span');

      cursorSpan.className = 'ti-cursor';
      cursorSpan.innerHTML = '|';
      Object.assign(cursorSpan.style, this.style);

      this.el.appendChild(cursorSpan);

      function fade(element) {
        var op = 1;  // initial opacity
        var timer = setInterval(function () {
          if (op <= 0.1){
            clearInterval(timer);
          }
          element.style.opacity = op;
          element.style.filter = 'alpha(opacity=' + op * 100 + ")";
          op -= op * 0.1;
        }, 10);
      }

      function unfade(element) {
        var op = 0.1;  // initial opacity
        var timer = setInterval(function () {
          if (op >= 1){
            clearInterval(timer);
          }
          element.style.opacity = op;
          element.style.filter = 'alpha(opacity=' + op * 100 + ")";
          op += op * 0.1;
        }, 10);
      }
      (function callFade(){
        fade(cursorSpan);
        setTimeout(callFade, 1000);
      })();
      setTimeout(function(){
        (function callUnfade(){
          unfade(cursorSpan);
          setTimeout(callUnfade, 1000);
        })();
      }, 500);
    }
  },
  _insert(el){
    console.log(el)
    this.tel.appendChild(el);
  },
  _insertChar(el){
    if(typeof el === 'string'){
      this.tel.innerHTML += el;
    } else {
      this.tel.appendChild(el.item(0));
    }
  },
  _toArray(str) {
    return str.constructor === Array ? str.slice(0) : str.split('<br>');
  },
  _setPace: function() {
    var typeSpeed = this.options.speed;
    var deleteSpeed = this.options.deleteSpeed !== undefined ? this.options.deleteSpeed : this.options.speed / 3;
    var typeRange = typeSpeed / 2;
    var deleteRange = deleteSpeed / 2;

    this.typePace = this.options.lifeLike ? this._randomInRange(typeSpeed, typeRange) : typeSpeed;
    this.deletePace = this.options.lifeLike ? this._randomInRange(deleteSpeed, deleteRange) : deleteSpeed;
  },

  _randomInRange: function(value, range) {
    return Math.abs(Math.random() * ((value + range) - (value - range)) + (value - range));
  },

  _print: function(chr) {
    if (this.inTag) {
      this.tel.lastChild.innerHTML += chr;
      if (this.tagCount < this.tagDuration) {
        this.tagCount++;
      } else {
        this.inTag = false;
      }
    } else {
      this._insertChar(chr);
    }
  },
  _type(string, rake) {

    // set default 'rake' value
    rake = typeof rake === 'undefined' ? true : rake;

    // convert to array
    string = this._toArray(string);

    // if it's designated, rake that bad boy for HTML tags and stuff
    if (rake) {
      string = this._rake(string);
      string = string[0];
    }

    // do the work that matters
    this.tTO = setTimeout(function() {

      // randomize the timeout each time, if that's your thing
      this._setPace(this);

      // "_print" the character
      // if an opening HTML tag is found and we're not already pringing inside a tag
      if (this.options.html && (string[0].indexOf('<') !== -1 && string[0].indexOf('</') === -1) && (!this.inTag)) {

        // loop the string to find where the tag ends
        for (var i = string.length - 1; i >= 0; i--) {
          if (string[i].indexOf('</') !== -1) {
            this.tagCount = 1;
            this.tagDuration = i;
          }
        }

        this._makeNode(string[0]);
      } else {
        this._print(string[0]);
      }

      // shorten it
      string.splice(0, 1);

      // if there's more to it, run again until fully printed
      if (string.length) {
        this._type(string, false);
      } else {
        this._executeQueue();
      }

    }.bind(this), this.typePace);
  },
  _rake: function(array) {
    for (var i = 0; i < array.length; i++) {
      array[i] = array[i].split('');

      if (this.options.html) {
        this.tPos = [];
        var p = this.tPos;
        var tag;
        var en = false;
        for (var j = 0; j < array[i].length; j++) {

          if (array[i][j] === '<' || array[i][j] === '&') {
            p[0] = j;
            en = array[i][j] === '&' ? true : false;
          }

          if (array[i][j] === '>' || (array[i][j] === ';' && en)) {
            p[1] = j;
            j = 0;
            tag = (array[i].slice(p[0], p[1] + 1)).join('');
            array[i].splice(p[0], (p[1] - p[0] + 1), tag);
            en = false;
          }
        }
      }
    }

    return array;
  },
  _pause: function(time) {
    time = time === undefined ? this.breakDelay : time;
    this._to(function() {
      this._executeQueue();
    }.bind(this), time);
  },
  _break() {
    this._insertChar('<br>');
    this._executeQueue();
  },
  _delete(chars) {
    this.deleteTimeout = setTimeout(function() {

      this._setPace();

      var a = this.tel.innerHTML.split("");

      var amount = chars === undefined || chars === null ? a.length - 1 : chars + 1;

      // cut the array by a character
      for (var n = a.length - 1; n > -1; n--) {

        if ((a[n] === '>' || a[n] === ';') && this.options.html) {
          for (var o = n; o > -1; o--) {

            if (a.slice(o - 3, o + 1).join('') === '<br>') {
              a.splice(o - 3, 4);
              break;
            }

            if (a[o] === '&') {
              a.splice(o, n - o + 1);
              break;
            }

            if (a[o] === '<') {
              if (a[o - 1] !== '>') {
                if (a[o - 1] === ';') {
                  for (var p = o - 1; p > -1; p--) {
                    if (a[p] === '&') {
                      a.splice(p, o - p);
                      break;
                    }
                  }
                }

                a.splice(o - 1, 1);
                break;
              }
            }
          }
          break;
        } else {
          a.pop();
          break;
        }

      }

      // if we've found an empty set of HTML tags...
      if (this.tel.innerHTML.indexOf('></') > -1) {
        for (var i = this.tel.innerHTML.indexOf('></') - 2; i >= 0; i--) {
          if (a[i] === '<') {
            a.splice(i, a.length - i);
            break;
          }
        }
      }

      this.tel.innerHTML = a.join('');

      // characters still in the string.
      if (amount > (chars === undefined ? 0 : 2)) {
        this._delete(chars === undefined ? undefined : chars - 1);
      } else {
        this._executeQueue();
      }
    }.bind(this), this.deletePace);
  },
  _elCheck() {
    if (!this.options.startDelete && this.el.innerHTML.replace(/(\r\n|\n|\r)/gm,"").length > 0) {
      this.strings = this.el.innerHTML.trim();
    } else if (this.options.startDelete) {
      this.stringsToDelete = this.el.innerHTML;
    }
  },
  _makeNode: function(char) {

    var parseHTML = function(str) {
      var tmp = document.implementation.createHTMLDocument();
      tmp.body.innerHTML = str;
      return tmp.body.children;
    };

    this.tag = parseHTML(char);
    this._print(this.tag);
    this.inTag = true;
  }
};

function TypingFactory (el, opt) {
  let secret = 'secret agent';

  return Object.assign(Object.create(Typing), {
    el : el,
    options: Object.assign({
      autoStart: true,
      breakLines: true,
      breakDelay: 750,
      cursor: true,
      deleteDelay: 750,
      deleteSpeed: 100,
      html: true,
      lifeLike: true,
      loop: false,
      loopDelay: 750,
      speed: 100,
      startDelay: 250,
      startDelete: false,
      strings: [],
      callback: function() {},
    }, opt),
    profession () {
      return secret;
    }
  })
}
