
var config = {
    apiKey: "AIzaSyCB_SUb8qxc2iOmNvZnXjoZvbEplKXoIJA",
    authDomain: "rock-paper-scissors-494f4.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-494f4.firebaseio.com",
    projectId: "rock-paper-scissors-494f4",
    storageBucket: "rock-paper-scissors-494f4.appspot.com",
    messagingSenderId: "734106926393"
  };

firebase.initializeApp(config);

var p1Ready = false, p2Ready = false;
var p1Answer = "", p2Answer = "";
var p1Wins = 0, p2Wins = 0, ties = 0;
var winner = "";
var playerNum = 0;

$(".wins1").text(p1Wins);
$(".wins2").text(p2Wins);
$(".ties").text(ties);

var winCases = [
  {
    p1:"rock",
    p2:"scissors"
  },
  {
    p1:"scissors",
    p2:"paper"
  },
  {
    p1:"paper",
    p2:"rock"
  }
];

var database = firebase.database();
var gameDataRef = firebase.database().ref("gameData");
var p1Ref = firebase.database().ref("player1Data");
var p2Ref = firebase.database().ref("player2Data");

var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");

//when client's connection state changes
connectedRef.on("value", function(snap){
  //if they are connected
  if(snap.val()){
    //add user to the connection list
    var con = connectionsRef.push(true);
    //remove user from the connection list when they disconnect
    con.onDisconnect().remove();
  }
});

  //gets the total number of connectioned users by counting
  //how many conenctions are in the 'connections' reference
  connectionsRef.on("value", function(snap) {
    playerNum = snap.numChildren();
  });

  gameDataRef.on("value", function(snapshot){
    var data = snapshot.val();
    p1Wins = data.player1Wins;
    p2Wins = data.player2Wins;
    ties = data.ties;
  });
  
  p1Ref.on("value", function(snapshot){
    var data = snapshot.val();
    p1Answer = data.player1Answer;
    p1Ready = data.player1Ready;
  });
  
  p2Ref.on("value", function(snapshot){
    var data = snapshot.val();
    p2Answer = data.player2Answer;
    p2Ready = data.player2Ready;
  });

$(document).ready(function(){  
  
  //need to somehow retrive values from firebase before this step
  //firebase is waiting until a value is changed before it goes and grabs data
  //from the above snapshot methods
  $(".wins1").text(p1Wins);
  $(".wins2").text(p2Wins);
  $(".ties").text(ties);
  
  console.log("playerNum: " + playerNum);
  if(playerNum === 1 || playerNum === 2){
    $(".player").text(playerNum);
  }
  else{
    $(".player").text("Spectating");
  }
  
  $(document).on("click", function(event){
    console.log("playerNum: " + playerNum);
    var targ = event.target;
    var id = targ.id;
    
    //add (playerNum === 1)
    if(id === "p1" && !p1Ready){
      p1Answer = targ.value;
      p1Ready = true;
      p1Ref.set({
        player1Ready:p1Ready,   
        player1Answer:p1Answer
      });
      $(".info").text("Waiting for Player 2...");
    }
    //add (playerNum === 2)
    else if(id === "p2" && !p2Ready){
      p2Answer = targ.value;
      p2Ready = true;
      p2Ref.set({
        player2Ready:p2Ready,   
        player2Answer:p2Answer
      });
      $(".info").text("Waiting for Player 1...");
    }
    if(p1Ready && p2Ready){
      checkWinner();
    }  
  });
  
  function checkWinner(){
    if(p1Answer === p2Answer){
      winner = "It's a tie"
      ties += 1;
    }
    else{
      var match = false;
      for(key in winCases){
        if(p1Answer === winCases[key].p1 && p2Answer === winCases[key].p2){
          winner = "Point for Player 1!";
          p1Wins += 1;
          match = true;
          break;
        }
      }
      if(!match){
        winner = "Point for Player 2!";
        p2Wins += 1;
      } 
    }
    
    p1Ready = false;
    p2Ready = false;
    $(".info").text(winner);
    $(".wins1").text(p1Wins);
    $(".wins2").text(p2Wins);
    $(".ties").text(ties);
    
    gameDataRef.set({
        player1Wins:p1Wins,
        player2Wins:p2Wins,
        ties:ties
      });
    
    p1Ref.set({
        player1Ready:p1Ready,   
        player1Answer:p1Answer
      });
    
    p2Ref.set({
        player2Ready:p2Ready,   
        player2Answer:p2Answer
      });
   
  }
  
});