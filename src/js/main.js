// dependencies and imports
import 'jquery';
import './jquery.flip';
import '../sass/main.scss';

// wrap whole code in an IIFE to isolate scope
(($) => {


    // constants decleration
  const $txt = $('#en'), // English input textarea
        $transBtn = $('#translationBtn'), // translate button
        $out = $('#output'), // element (div) that displays the translation
        $uAlrt = $('#userAlerts'), // user laerts popup element
        $clearTxt = $('#clearTxt'), // 'X' button to clear textarea manually
        $bMenuIcon = $('#burger_menu_icon'), // burger menu icon element to open menu on smaller screens view
        $closeMenuBtn = $('#xMenuBtn'), // close menu button to close. (also when on smaller screens)
        $mainNav = $('#mainNav'), // main navigation menu element
        socialLinks = { // links to social accounts Object for dynamic linking
            fb: 'https://www.facebook.com/NashMoe',
            in : 'https://www.linkedin.com/in/mohammednashashibi/'
        },
        bBgOp = 0.4, // opacity of bar line background colors
        skillsData = [ // skills data array
            { skill: 'Adobe Creative Suite', barColor: 'rgb(124,109,151)', bgColor: `rgba(124,109,151, ${bBgOp})`, width: '93' },
            { skill: 'UI design', barColor: 'rgb(18,186,167)', bgColor: `rgba(18,186,167, ${bBgOp})`, width: '90' },
            { skill: 'UX design', barColor: 'rgb(119,133,194)', bgColor: `rgba(119,133,194, ${bBgOp})`, width: '84' },
            { skill: 'HTML5/CSS3', barColor: 'rgb(192,61,66)', bgColor: `rgba(192,61,66, ${bBgOp})`, width: '90' },
            { skill: 'JavaScript', barColor: 'rgb(255,200,0)', bgColor: `rgba(255,200,0, ${bBgOp})`, width: '85' },
            { skill: 'Responsive design', barColor: 'rgb(221,94,132)', bgColor: `rgba(221,94,132, ${bBgOp})`, width: '88' },
            { skill: 'JSON / AJAX (AJAJ)', barColor: 'rgb(89,147,245)', bgColor: `rgba(89,147,245, ${bBgOp})`, width: '70' },
            { skill: 'Angular JS', barColor: 'rgb(84,92,159)', bgColor: `rgba(84,92,159, ${bBgOp})`, width: '60' },
            { skill: 'Git', barColor: 'rgb(216,93,128)', bgColor: `rgba(216,93,128, ${bBgOp})`, width: '67' },
            { skill: 'Webpack', barColor: 'rgb(113,190,255)', bgColor: `rgba(113,190,255, ${bBgOp})`, width: '50' }
        ];
    // scope variables decleration
    let prevTxt = '', // last En text inserted in textarea 
        alerts = {}, // user alerts object. Initialized below
        blinkOut; // timeout variable for output div Blink effect

    // apply colors to back-side of card where it shows the skills
    (() => {
        let i, loops, el;
        // loop through the skills array and append data to view
        for (i = 0, loops = skillsData.length; i < loops; i++) {
            el = `<div class="bar_line" style="background-color: ${skillsData[i].bgColor}; width: ${skillsData[i].width}%">
                    <label class="lbl">${skillsData[i].skill}</label>
                    <div class="status" style="background-color: ${skillsData[i].barColor}"></div>
                </div>`;

            $('#bars').append(el);
        }
    })();

    // check time span of the day and display greetings accordingly
    const currentTimeSpan = () => {
        const date = new Date(),
            h = date.getHours();
        if (h >= 6 && h < 12) {
            return 'Morning';
        } else if (h >= 12 && h < 17) {
            return 'Afternoon';
        } else if (h >= 17 && h < 20) {
            return 'Evening';
        } else {
            return 'Night';
        }
    };
    // display time span
    $('#timeNow').text(currentTimeSpan());

    // burger menu open button
    $bMenuIcon.click(function() {
        $mainNav.addClass('burger_nav_open');
        $(this).addClass('hide');
        $closeMenuBtn.removeClass('hide');
    });
    // burger menu close button
    $closeMenuBtn.click(function() {
        $mainNav.removeClass('burger_nav_open');
        $(this).addClass('hide');
        $bMenuIcon.removeClass('hide');
    });


    // flip card init.
    $('#card_1').flip({
        trigger: 'manual',
        front: '.front-flipper',
        back: '.back-flipper'
    });

    // flip buttons action
    $("#flipCard_1_btn").click(() => {
        $("#card_1").flip(true);
    });

    $("#unflipCard_1_btn").click(() => {
        $("#card_1").flip(false);
    });

    // convert button click event
    $transBtn.click(() => {
        translate($txt.val());
    });

    // when click on social icon
    $('.social').click(function() {
        window.open(socialLinks[$(this).attr('data-target')]);
    });

    // smooth scroll to article
    $('#readArticle').click(function() {
        document.querySelector('#resourcesArticle').scrollIntoView({
            behavior: 'smooth'
        });
    });


    // hide alert popup on key press if it is visible
    /* this also can be enhanced by adding an event listener only 
       when popup is showing, and remove event listnter when popup is hidden.
       For app this size this is ok */
    $txt.on('keypress', () => {
        if ($uAlrt.css('display', 'none')) {
            alerts.hideAlert();
        }
    });

    // show clear 'X' button only when textarea is not empty.
    $txt.bind('input propertychange', function() {
        $clearTxt.hide();
        if (this.value.length) {
            $clearTxt.show();
        }
    });

    

    // clear text area
    $clearTxt.click(function() {
        $txt.val('');
        $txt.focus();
        $(this).hide();
    });

    // translate text code chain starts here
    const translate = enTxt => {
        if (enTxt != '' && enTxt != prevTxt) {

            let translation = processText(enTxt); // translation result formatted in HTML string
            prevTxt = enTxt; // setting this to check next translation if it was the same text or a new input
            $out.html(translation); // append translation HTML text to page

            highlightOutput(); // highlight output box on each translation to indicate it is working (simple UX feature)
        } else {
            // show user alert
            switch (enTxt) {
                case '':
                    alerts.showAlert('noText');
                    break;
                case prevTxt:
                    alerts.showAlert('sameText');
                    break;
            }
        }
    }; // end of translate

    // split text to lines and process each line then combine back the text (lines will passed 'processWords' function further processing)
    const processText = enTxt => {
        let sepLines = enTxt.replace(/^\s+|\s+$/g, '').split('\n'), // separate the inputed text into lines (in case text has line breaks)
            plArr = [], // An array of the translated pig latin words resulting from the first for loop below
            result = '', // An HTML formatted string of the pig lating translation resulting from the second for loop
            i, loops; // declare the for loop vars here for better persormance

        // 1st for loop
        for (i = 0, loops = sepLines.length; i < loops; i++) {
            if (sepLines[i] != '') {
                plArr = plArr.concat(processWords(sepLines[i]).join(""));
            } else {
                plArr.push(sepLines[i]);
            }
        }

        // 2nd for loop - take translated array and return it to string
        for (i = 0, loops = plArr.length; i < loops; i++) {
            // Add a line-break after each line.
            result += plArr[i] + '\n';
        }
        return result;
    }; // end of processText

    // split English lines received from 'processText' function to an array or words, pass each word to the 'convert' function and return
    const processWords = enLine => {
        let enWords = enLine.trim().split(/([^a-zA-Z'])/),
            plWords = [],
            i, loops;

        for (i = 0, loops = enWords.length; i < loops; i++) {
            plWords.push(convert(enWords[i]));
        }

        return plWords;
    }; // end of processWords


    // convert English word to Pig Latin
    const convert = word => {
        // check if argument is not a separator and doesn't contain alphabetic letters. In this case the word is returned as is as there is no need to process and translate
        if (word == '' || word.match(/[_\W0-9]/) && !word.match(/[a-z]/i)) {
            return word;
        } else {
            // scope variables
            let flCap = /[A-Z]/.test(word[0]) ? true : false, // Check if first letter is a capital letter and update the flCap domain variable.
                wordCap = word === word.toUpperCase() && word.length > 1 ? true : false, // Check if the whole word is capitalized and update the wordCap domain variable.
                wordL = word.toLowerCase(), // Transform word to lowercase before translation.
                vows = 'aeiou'.split(''), // Array contains vowels (Using split() on a string for ease of editing instead of writing an array).
                vowsY = vows.concat('y'), // Defining another vowels array which includes the letter Y.
                sepLetters = wordL.split(''), // Split the passed English word to an array of letter
                plWord = '', // Updated during processing (translation) below
                consonantCluster,
                remainingLetters,
                i, loops;

            // Pig Latin translation rules are applied here.
            // Check if the first letter is a vowel and return the word with 'way' at the end of it.
            if (vows.includes(wordL.charAt(0))) {
                // Function call to check if word contains any capital letters before returning it to match original text format.
                plWord = reformat(wordL, 'way');
                return plWord;
                // Check to see if word doesn't contain vowels including letter 'Y' except for it starts with the letter 'Y'. This is to treat the letter 'Y' as a consonant only if the word starts with it. 
            } else if (!hasVowels(vowsY, sepLetters) || (!hasVowels(vows, sepLetters) && sepLetters[0] === 'y')) {
                // Functin call to check if word contains any capital letters before returning it to match original text format.
                plWord = reformat(wordL, 'ay');
                return plWord;
            } else {
                // Check if the first letter is 'Y' and move it to the end of the array. When 'Y' is the first letter it is dealt with as a consonant
                if (wordL[0] === 'y') {
                    sepLetters.push(sepLetters.shift());
                }
                // Check if the word starts with 'qu' and move it to the end of the array as a cluster.
                if (sepLetters[0] + sepLetters[1] === 'qu') {
                    sepLetters = (sepLetters.slice(2).concat(sepLetters.slice(0, 2)));
                }
                // loop through the letters. When reaches the first vowel it splites the consonant cluster before that vowel into an array, and concatenate it with an array that consists of the remaining letters 
                for (i = 0, loops = sepLetters.length; i < loops; i++) {
                    if (vowsY.includes(sepLetters[i])) {
                        consonantCluster = sepLetters.slice(0, i); // Array of all letters before first vowels
                        remainingLetters = sepLetters.slice(i); // Array of remaining letters starting from the first vowel till the end
                        // Function call to check if word contains any capital letters before returning it to match original text format.
                        plWord = reformat(remainingLetters.concat(consonantCluster).join(""), 'ay');
                        return plWord;
                    }
                }
            }

            // Checks if the passed word contains capital letters and returns it matching the original text formatting.
            function reformat(str, tale) {
                console.log(flCap);
                console.log(wordCap);
                // str is the passed word.
                // tale is the added string at the end of the word (e.g. 'way' or 'ay').
                // Check if first letter of the En word was capital only and not the whole word is capitalized, and return the word with the first letter capitalized followed by 'way' at the end of it.
                if (flCap && !wordCap) {
                    // Capitalize first letter and return it
                    return capitalize(str) + tale;
                    // Check if the whole word is capitalized and return as is with 'WAY' at the end of it.
                } else if (wordCap) {
                    // Capitalize whole word and return it
                    return (str + tale).toUpperCase();
                } else {
                    // No capital letters in this word so return word plus tale only
                    return str + tale;
                };
            } // End of reformat function
        }

    }; // end of convert

    // check if an array contains vowels
    const hasVowels = (vowels, letters) => {
        return letters.some(function(i) {
            return vowels.indexOf(i) >= 0;
        });
    };

    // capitalize word
    const capitalize = w => {
        return w.charAt(0).toUpperCase() + w.slice(1);
    }

    // highlight output box after every translation
    const highlightOutput = () => {
        // clear timers (reset when 'Translate' button is clicked while timer and/or transition are still running)
        clearTimeout(blinkOut);
        $out.addClass('blink');
        blinkOut = setTimeout(() => {
            $out.removeClass('blink');
        }, 2000);
    };


    // user alerts object
    alerts = {
        msgs: {
            "noText": "There's nothing to translate",
            "sameText": "You've just translated this"
        },
        showAlert: function(msg) {
            $uAlrt.css('display', 'table');
            $uAlrt.text(this.msgs[msg] + this.checkCase(this.msgs[msg]));
            setTimeout(function() {
                $uAlrt.css('opacity', '1');
            }, 1);
        },
        hideAlert: function() {
            $uAlrt.css('opacity', '0');
            setTimeout(function() {
                $uAlrt.css('display', 'none');
            }, 200);
        },
        checkCase: function(msg) {
            const cMsg = this.msgs;
            switch (msg) {
                case cMsg[Object.keys(cMsg)[0]]:
                    return '';
                case cMsg[Object.keys(cMsg)[1]]:
                    return this.checkIfSentence();
                default:
                    return '';
            }
        },
        checkIfSentence: function() {
            const length = $txt.val().trim().split(' ').length;
            return length === 1 ? ' word' : ' sentence';
        }
    };

})(jQuery);
