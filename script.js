word = null;
var i = 0;
let numlist = []
let cn = 0;
var gamefound = false;
var enemi = 0;
var enemcn = 0;

$("gameoverscreen").click(function() {
    location.reload();
});

function showenem(letter) {
    var deplet = String.fromCharCode(letter).toUpperCase();
    if (deplet.match(/^[a-zA-Z]$/) && enemcn < 5) {
        $('#enem .grid > div:eq(' + (enemcn + enemi) + ')').text(deplet);
        enemcn += 1;
    }
    if (letter === 13 || enemcn === 5) {
        enemi += 5; 
        enemcn = 0; 
    }

}
function editgrid(letter, ws) {
    if (letter === 13) {
        let jnum = 0;
        if (cn == 5){
            correctguess = 0;
            numlist.forEach((elem, index) => {
                if (word[index] === elem) {
                    $('.grid > div:eq('+(jnum + i)+')').css('background-color', "green");
                    correctguess += 1;
                }
                else if (word.includes(elem)) {
                    $('.grid > div:eq('+(jnum + i)+')').css('background-color', "grey");
                    correctguess += 1;
                }
                jnum += 1;
            })
            if (correctguess == 5) {
                console.log("OVERR");
                ws.close()
                $("#gameoverscreen").show();
            }
            numlist = [];
            cn = 0;
            i += 5;

        } else {
            console.log("not remainder")
        }
        // console.log("i is "+i);

    }

    var letter = String.fromCharCode(letter).toUpperCase();

    if (letter.match(/^[a-zA-Z]+$/)) {
        ws.send(letter);
        if (cn == 5) {
            console.log("atfix");
        } else {
            $('.grid > div:eq('+(cn + i)+')').text(letter);
            cn += 1;
            numlist.push(letter);
        };
    } 
    else if (letter === 'Enter'){
        console.log('enter clicked')
    }
    else {
        console.log("not letter");     
    }
}



$(document).ready(function() {
    $("#gameoverscreen").hide();

    function kbden(ws) {
        $("kbd").click(function(){
            var letter = $(this).text();
            var letter = letter.charCodeAt(0);

            var isInEnemkdTab = $(this).closest('#enemkd').length > 0;
            if(isInEnemkdTab) {
                console.log("The clicked element is inside the #enemkd tab.");
                ws.send(String("int "+letter));
            } else {
                editgrid(letter, ws);
            }
        })
        $(document).on("keypress", function (e) {
            ws.send(e.which)
            editgrid(e.which, ws)
        });
    }

    $('#qbtn').click(function() {
        var ws = new WebSocket("ws://localhost:8080");
        console.log("queing");
        var dotamt = '.';
        var intervalId = null;
        var elem = $(this);
        if (!gamefound) {
            intervalId = setInterval(function(){ 
                if (dotamt.length === 3) {
                    dotamt = '.';
                } else {
                    dotamt += '.';
                }
                elem.text("queuing now" + dotamt);
            }, 300);
        }
        ws.onopen = function() {
            console.log("hello connected");
            ws.send("hello");

        };
        ws.onmessage = function(event) {
            var dat = event.data;
            if (dat.includes("word")) {
                gamefound = true;
                if (intervalId) {
                    clearInterval(intervalId);
                }
                
                elem.text("matched");
                setTimeout(function(){
                    elem.hide();
                  }, 3000);
                kbden(ws);
                let intrwrd = dat.split(" ")[1].split('');
                word = intrwrd;
            }
            console.log(dat);
            if (dat.includes("int")) {
                let intrwrd = dat.split(" ");
                console.log(intrwrd[1]);
                editgrid(intrwrd[1]);
            } else if (dat.includes("over")) {
                console.log("hi")
                $("gameoverscreen").show();
            }
            else {
                showenem(dat);
            }
           
        };
        ws.onclose = function(event) {
            $("#gameoverscreen").show();
            console.log("left");
        }
    })

});

