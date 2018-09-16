
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

//playerNum will only change when playerLocked is false
//once it is set to true (happens in connectionRef), the player will be locked in 
var playerLocked = false;

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
var infoRef = firebase.database().ref("info");
var chatRef = firebase.database().ref("chat");

var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");



$(document).ready(function(){  
  
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
        if(!playerLocked){
            console.log("connectsRef child added");
            playerNum = snap.numChildren();
            console.log("playerNum: " + playerNum);
            if(playerNum === 1 || playerNum === 2){
                $(".player").text("Player " + playerNum);
            }
            else{
                $(".player").text("Spectating");
            }
            playerLocked = true;
        }
        //when the number of players drops down to 1, the stored chat and info being displayed is cleared
        if(snap.numChildren() === 1){
            $(".chatBox").val("");
            chatRef.set({
                comment:""
            });
            infoRef.set({
                info:""
            });
        }
    });
  
    gameDataRef.on("value", function(snapshot){
      console.log("gameDataRef child added");
      var data = snapshot.val();
      p1Wins = data.player1Wins;
      p2Wins = data.player2Wins;
      ties = data.ties;
      console.log("p1Wins: " + p1Wins);
      console.log("p2Wins: " + p2Wins);
      console.log("ties: " + ties);
      $(".wins1").text(p1Wins);
      $(".wins2").text(p2Wins);
      $(".ties").text(ties);
    });
    
    p1Ref.on("value", function(snapshot){
      console.log("p1Ref child added");
      var data = snapshot.val();
      p1Answer = data.player1Answer;
      p1Ready = data.player1Ready;
      console.log("p1Answer: " + p1Answer);
      console.log("p1Ready: " + p1Ready);
      /*if(p1Ready && !p2Ready){
        $(".info").text("Waiting for Player 2...");
      }*/
    });
    
    p2Ref.on("value", function(snapshot){
      console.log("p2Ref child added");
      var data = snapshot.val();
      p2Answer = data.player2Answer;
      p2Ready = data.player2Ready;
      console.log("p2Answer: " + p2Answer);
      console.log("p2Ready: " + p2Ready);
      /*if(!p1Ready && p2Ready){
        $(".info").text("Waiting for Player 1...");
      }*/
    });

    infoRef.on("value", function(snapshot){
        var data = snapshot.val();
        $(".info").text(data.info);
    });

    chatRef.on("child_added", function(snapshot){
        var data = snapshot.val();
        console.log("comment: " + data.comment);
        if(data.comment){
            $(".chatBox").val($(".chatBox").val() + data.comment + "\n");
        }
    });
  
  $(document).on("click", function(event){
    if(playerNum === 1 || playerNum === 2){
        console.log("click");
        console.log("playerNum: " + playerNum);
        var targ = event.target;
        var id = targ.id;
        
        //add (playerNum === 1)
        if(id === "p1" && !p1Ready && playerNum === 1){
        console.log("p1 click");
        p1Answer = targ.value;
        p1Ready = true;
        p1Ref.set({
            player1Ready:p1Ready,   
            player1Answer:p1Answer
        });
        infoRef.set({
            info:"Waiting for Player 2..."  
            });
        //$(".info").text("Waiting for Player 2...");
        }
        //add (playerNum === 2)
        else if(id === "p2" && !p2Ready && playerNum === 2){
        console.log("p2 click");
        p2Answer = targ.value;
        p2Ready = true;
        p2Ref.set({
            player2Ready:p2Ready,   
            player2Answer:p2Answer
        });
        infoRef.set({
            info:"Waiting for Player 1..."  
            });
        //$(".info").text("Waiting for Player 1...");
        }
        if(p1Ready && p2Ready){
        checkWinner();
        }  
    }
  });
  
  function checkWinner(){
    if(p1Answer === p2Answer){
      winner = "It's a tie"
      ties += 1;
      infoRef.set({
        info:winner   
        });
    }
    else{
      var match = false;
      for(key in winCases){
        if(p1Answer === winCases[key].p1 && p2Answer === winCases[key].p2){
          winner = "Point for Player 1!";
          p1Wins += 1;
          match = true;
          infoRef.set({
            info:winner   
            });
          break;
        }
      }
      if(!match){
        winner = "Point for Player 2!";
        p2Wins += 1;
        infoRef.set({
            info:winner   
            });
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

$(".chat").keyup(function(event) {
    if(playerNum === 1 || playerNum === 2){
        let user = "";
        if(playerNum === 1){
            user = "Player1: ";
        }
        else{
            user = "Player2: ";
        }
        if (event.keyCode === 13) {
            let inp = user + $(".chat").val();
            chatRef.push({
                comment:inp
            });
            $(".chat").val("");
        }
    }
});

});