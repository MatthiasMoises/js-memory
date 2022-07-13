/**
 * Created by Psychobear on 05.02.2017.
 */

jQuery(document).ready(function() {

  var difficultySetting = getUrlParameter('difficulty');
  var timeLimit;
  var completeTurnsLeft;
  var playfieldWidth;
  var playfieldNumber;
  var zonkCard = 'zonk';
  var zonkCount;
  var cardLimit = 12;
  var turnCounter = 0;
  var gameWasStarted = true;
  var score = 0;
  var endResult;

  if (difficultySetting == "hard") {
    playfieldWidth = 5;
    timeLimit = 180;
    completeTurnsLeft = 30;
    playfieldNumber = 25;
    zonkCount = 3;
  }
  else if (difficultySetting == "medium") {
    playfieldWidth = 4;
    timeLimit = 120;
    completeTurnsLeft = 20;
    playfieldNumber = 16;
    zonkCount = 2;
  }
  else if (difficultySetting == "easy") {
    playfieldWidth = 3;
    timeLimit = 60;
    completeTurnsLeft = 10;
    playfieldNumber = 9;
    zonkCount = 1;
  }
  else {
    difficultySetting = "easy";
    gameWasStarted = false;
  }

  if (gameWasStarted == false) {
    jQuery('#endGame').hide();
    jQuery('#statistics-container').hide();
    turnCounter = 0;
  }
  else {
    turnCounter = 2;
    jQuery('#game-container').show();
  }

  var myVar = setInterval(function(){ myTimer() }, 1000);

  function myTimer() {
    timeLimit--;

    if (timeLimit <= 10) {
      jQuery('#timeLeft').removeClass('statistic-green');
      jQuery('#timeLeft').addClass('statistic-red');
    }

    document.getElementById("timeLeft").innerHTML = timeLimit;
    if (timeLimit == 0) {
      clearInterval(myVar);
      turnCounter = gameOver(5, 'ZEIT ABGELAUFEN!');
    }
  }

  jQuery('#game-container').addClass('difficulty-'+difficultySetting);
  jQuery('#difficultySelect').val(difficultySetting);

  var cardPairs = (playfieldNumber-zonkCount) / 2;
  var pairsCorrect = 0;
  var pairsWrong = 0;

  var cardSet = [];
  var cardSetDouble;
  var cardSetFinal;
  var success = false;
  var card1ID = 0;
  var card2ID = 0;
  var currCardValue;
  var card1Value;
  var card2Value;


  // Prepare Cards
  while (cardSet.length < cardPairs) {
    var getCard = generateRandomNumber(1, (cardLimit));
    if (jQuery.inArray(getCard, cardSet) == -1) {
      cardSet.push(getCard);
    }
  }

  cardSetDouble = cardSet.slice(0);
  cardSetFinal = cardSet.concat(cardSetDouble);

  for  (var i = 1; i <= zonkCount; i++) {
    cardSetFinal = cardSetFinal.concat(zonkCard);
  }

  //cardSetFinal.sort(function(a, b){return 0.5 - Math.random()});

  shuffle(cardSetFinal);

  // Prepare Playfield
  jQuery(cardSetFinal).each(function (index, element) {
    index += 1;
    var cardImage = '<div class="cardBlock clickable" id="card_'+ index + '"><img src="assets/img/cards/' + element + '.png" alt="' + element + '" />' +
        '<div class="overlay"><img class="img-responsive" src="assets/img/other/question_mark_background.jpg" title="Click me!" alt="Fragezeichen" /></div></div>';
    if (index % playfieldWidth == 0) {
      cardImage += '<div class="clear"></div>';
    }
    jQuery(cardImage).appendTo('#game-container');
  });

  // Prepare Statistics
  writeStatistics(pairsCorrect, pairsWrong, completeTurnsLeft, score);

  // Hide Cards
  var $overlay = $('<div class="overlay"><img src="assets/img/other/question_mark_background.jpg" title="Click me!" alt="Fragezeichen" /></div>');

  // Play Game
  jQuery(".cardBlock").click(function(){
    if (turnCounter > 0 && jQuery(this).hasClass("clickable")) {
      jQuery(this).find('.overlay').slideUp("slow");
      jQuery(this).removeClass("clickable");

      turnCounter -= 1;
      currCardValue = jQuery(this).find('img').attr('alt');
      // Zonk? -> Game Over!
      if (currCardValue == zonkCard) {
        clearInterval(myVar);
        jQuery(this).find('.overlay').slideUp("slow", function () {
          turnCounter = gameOver(4, 'GAME OVER!');
        });
      }

      if (turnCounter == 1) {
        card1ID = jQuery(this).attr('id');
        card1Value = jQuery(this).find('img').attr('alt');
      }
      else if (turnCounter == 0) {
        completeTurnsLeft--;



        if (completeTurnsLeft <= 3) {
          jQuery('#completeTurnsLeft').removeClass('statistic-green');
          jQuery('#completeTurnsLeft').addClass('statistic-red');
        }

        card2ID = jQuery(this).attr('id');
        card2Value = jQuery(this).find('img').attr('alt');



        if (card1Value == card2Value) {
          success = true;
          pairsCorrect++;
          score += 200;
          if (pairsCorrect == cardPairs) {
            jQuery(this).find('.overlay').slideUp("slow", function () {
              clearInterval(myVar);
              endResult = calculcateEndresult(score, timeLimit, completeTurnsLeft);
              turnCounter = gameWin(3, '<br/>YOU WIN!<br/><br/>' + endResult);
            });
          }
          else {
            turnCounter = 2;
            jQuery('#audio_1')[0].play();
          }
        }
        else {
          // Reset both cards
          jQuery('#'+card1ID).addClass("clickable");
          jQuery('#'+card2ID).addClass("clickable");
          pairsWrong++;
          success = false;
        }



        if (success == false && currCardValue != zonkCard) {
          if (completeTurnsLeft == 0) {
            clearInterval(myVar);
            turnCounter = gameOver(5, 'KEINE ZÜGE MEHR');
          }
          else {
            jQuery('#audio_2')[0].play();
            setTimeout(function(){
              jQuery('#'+card1ID).find('.overlay').slideDown("slow").delay(500);
              jQuery('#'+card2ID).find('.overlay').slideDown("slow", function () {
                turnCounter = 2;
              }).delay(500);
            },2000);
          }
        }
      }
    }
    // Update statistics
    writeStatistics(pairsCorrect, pairsWrong, completeTurnsLeft, score);
  });

  // Restart Button
  jQuery('#restartButton').click(function () {
    jQuery('#difficultySetting').val(jQuery('#difficultySelect').val());
    jQuery('#menuForm').submit();
  });

  // End game button
  jQuery('#endGame').click(function () {
    location.href = 'index.html';
  });

});

function generateRandomNumber(minimum, maximum) {
  randomnumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
  return randomnumber;
}

function gameWin(soundID,message) {
  jQuery('#audio_'+soundID)[0].play();
  jQuery("#dialog-winner").css('display', 'block');
  jQuery('#message-winner').html(message);
  jQuery("#dialog-winner").dialog({
    position: { my: 'center', at: 'center', of:'#game-container' }
  });
  return -1;
}

function gameOver(soundID,message) {
  jQuery('#audio_'+soundID)[0].play();
  jQuery("#dialog-loser").css('display', 'block');
  jQuery('#message-loser').html(message);
  jQuery("#dialog-loser").dialog({
    position: { my: 'center', at: 'center', of:'#game-container' }
  });
  return -1;
}

function calculcateEndresult(currentScore, restTime, restTurns) {
  finalscore = 0;
  timeBonus = 0;
  turnBonus = 0;
  timeBonus = restTime * 50;
  turnBonus = restTurns * 100;
  finalscore += currentScore;
  finalscore += timeBonus;
  finalscore += turnBonus;

  //return finalscore;
  return 'Punktzahl: ' + currentScore + '<br/>Zeitbonus: ' + timeBonus + '<br/>Zugbonus: ' + turnBonus + '<br/>--------------------------<br/><b>Endpunktzahl: ' + finalscore + '</b>';
}

function writeStatistics(a, b, c, d) {
  jQuery('#pairsCorrect').text(a);
  jQuery('#pairsWrong').text(b);
  jQuery('#completeTurnsLeft').text(c);
  jQuery('#score').text(d);
}

function shuffle (array) {
  var i = 0
    , j = 0
    , temp = null;

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};
