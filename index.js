import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getDatabase, ref, push, set, runTransaction , get, onValue } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

//firebase
const appSettings = {
    databaseURL: "https://test-game-d4c8e-default-rtdb.firebaseio.com"
}

const app = initializeApp(appSettings);
const database = getDatabase(app);

let blueAlliance = false;

//base app consts
const setupSection = document.getElementById("setup");
const scoringSection = document.getElementById("scoring");
const submissionSection = document.getElementById("submission");
//setup buttons
const allianceButton = document.getElementById("alliance");
const confirmButton = document.getElementById("confirmAlliance");
//scoring buttons
const addLeaveButton = document.getElementById("addLeave");
const removeLeaveButton = document.getElementById("removeLeave");
//separate scrap buttons for auto b/c points are different and ranking points are different
const addHighScrapButtonAuto = document.getElementById("addHighScrapAuto");
const removeHighScrapButtonAuto = document.getElementById("removeHighScrapAuto");
const addLowScrapButtonAuto = document.getElementById("addLowScrapAuto");
const removeLowScrapButtonAuto = document.getElementById("removeLowScrapAuto");
const addHighScrapButton = document.getElementById("addHighScrap");
const removeHighScrapButton = document.getElementById("removeHighScrap");
const addLowScrapButton = document.getElementById("addLowScrap");
const removeLowScrapButton = document.getElementById("removeLowScrap");
const addVaultScrapButton = document.getElementById("addVaultScrap");
const removeVaultScrapButton = document.getElementById("removeVaultScrap");
const addCorePointsButton = document.getElementById("addCorePoints");
const removeCorePointsButton = document.getElementById("removeCorePoints");
const addParkPointsButton = document.getElementById("addParkPoints");
const removeParkPointsButton = document.getElementById("removeParkPoints");
//awards foul points to other team for your team commiting fouls
const addFoulButton = document.getElementById("addFoul");
const removeFoulButton = document.getElementById("removeFoul");
const submitDataButton = document.getElementById("submitData");

allianceButton.addEventListener("click", function(){
    blueAlliance = !blueAlliance;
    if(blueAlliance){
        allianceButton.textContent = "Blue";
        allianceButton.classList = [];
        allianceButton.classList.add("BlueClass");
    }
    else{
        allianceButton.textContent = "Red";
        allianceButton.classList = [];
        allianceButton.classList.add("RedClass");
    }
});
confirmButton.addEventListener("click", function(){
    //bind the score listeners once the alliance is selected
    bindScoreListeners();
    setupSection.style.display = "none";
    scoringSection.style.display = "block";
    if(blueAlliance)
        scoringSection.classList.add("BlueClass");
    else    
        scoringSection.classList.add("RedClass");
});

//score constants
const leavePoints = 2;
const lowScrapPoints = 3;
const highScrapPoints = 5;
//points added if scrap was scored in auto
const autoScrapExtraPoints = 1;
const vaultPoints = 2;
const corePoints = 3;
const parkingPoints = 2;
const foulPoints = 4;

//data comes from firebase
//event listeners set the local variables when the data is updated
// RED ALLIANCE
const redLeaveScoreRef = ref(database, "redLeaveScore");
const redAutoScrapsRef = ref(database, "redAutoScraps");
const redHighBinScrapScoreRef = ref(database, "redHighBinScrapScore");
const redLowBinScrapScoreRef = ref(database, "redLowBinScrapScore");
const redVaultScrapScoreRef = ref(database, "redVaultScrapScore");
const redCoreScoreRef = ref(database, "redCoreScore");
const redParkScoreRef = ref(database, "redParkScore");
const redFoulsRef = ref(database, "redFouls");

// BLUE ALLIANCE
const blueLeaveScoreRef = ref(database, "blueLeaveScore");
const blueAutoScrapsRef = ref(database, "blueAutoScraps");
const blueHighBinScrapScoreRef = ref(database, "blueHighBinScrapScore");
const blueLowBinScrapScoreRef = ref(database, "blueLowBinScrapScore");
const blueVaultScrapScoreRef = ref(database, "blueVaultScore");
const blueCoreScoreRef = ref(database, "blueCoreScore");
const blueParkScoreRef = ref(database, "blueParkScore");
const blueFoulsRef = ref(database, "blueFouls");

//submit data refs
const redDataRef = ref(database, "redData");
const blueDataRef = ref(database, "blueData");

//current score variables
//once alliance is selected they will be for the seleced alliance
let totalScore = 0;
let leaveScore = 0;
//counts the number of scraps in auto for RP, not a point value
let autoScraps = 0;
let highBinScrapScore = 0;
let lowBinScrapScore = 0;
let vaultScrapScore = 0;
let coreScore = 0;
let parkScore = 0;
let fouls = 0;

//interval for timer system
let countdownInterval = 0;

//a listener to update locally stored values to the database data when it is updated
function bindListener(reference, callback){
    onValue(reference, (snapshot) => {callback(snapshot.val());});
}

function bindScoreListeners(){
    if(blueAlliance){
        bindListener(blueLeaveScoreRef, (val) => leaveScore = val);
        bindListener(blueAutoScrapsRef, (val) => autoScraps = val);
        bindListener(blueHighBinScrapScoreRef, (val) => highBinScrapScore = val);
        bindListener(blueLowBinScrapScoreRef, (val) => lowBinScrapScore = val);
        bindListener(blueVaultScrapScoreRef, (val) => vaultScrapScore = val);;
        bindListener(blueCoreScoreRef, (val) => coreScore = val);
        bindListener(blueParkScoreRef, (val) => parkScore = val);
        bindListener(blueFoulsRef, (val) => fouls = val);
        bindListener(blueDataRef, (val) => changeMode(val));
    }
    else{
        bindListener(redLeaveScoreRef, (val) => leaveScore = val);
        bindListener(redAutoScrapsRef, (val) => autoScraps = val);
        bindListener(redHighBinScrapScoreRef, (val) => highBinScrapScore = val);
        bindListener(redLowBinScrapScoreRef, (val) => lowBinScrapScore = val);
        bindListener(redVaultScrapScoreRef, (val) => vaultScrapScore = val);;
        bindListener(redCoreScoreRef, (val) => coreScore = val);
        bindListener(redParkScoreRef, (val) => parkScore = val);
        bindListener(redFoulsRef, (val) => fouls = val);
        bindListener(redDataRef, (val) => changeMode(val));
    }
}

//if datasubmitted is false a new match started so go to scoring section
//if datasubmitted is true the data has been submitted so go to submission screen
function changeMode(dataSubmitted){
    if(dataSubmitted == true){
        submissionSection.style.display = "block";
        scoringSection.style.display = "none";
    }
    else{
        submissionSection.style.display = "none";
        scoringSection.style.display = "block";
        updateData();
    }
}

//increment the data point by the amount
function incrementData(reference, amount){
    runTransaction(reference, (currentValue) => {
        // currentValue may be null if not set yet
        return (currentValue || 0) + amount;
    })
    .then(() => {
        updateData(); // update UI after the transaction
    })
    .catch((error) => {
        console.error("Transaction failed:", error);
    }); 
}

//view a single data point from firebase reference
//returns 0 if no data is found
function viewData(reference){
    return get(reference).then((snapshot) => {
        if(snapshot.exists())
            return snapshot.val();
        else return 0;
    })
    .catch((error) => {
        console.log("data viewing failed: ", error);
    });
}

//sets the new data directly to the value inputted
function setData(reference, newValue){
    set(reference, newValue)
    .catch((error) =>{
    console.log("setting data failed: ", error)});
}
//Auto scrap scoring
addLowScrapButtonAuto.addEventListener("click", function(){
    //need two references, one for the score and one to keep track if any scraps are scored in auto for RP calculation
    var scoreReference = redLowBinScrapScoreRef;
    var autoTrackReference = redAutoScrapsRef;
    if(blueAlliance){
        //set them to the blue alliance ones if on blue alliance
        scoreReference = blueLowBinScrapScoreRef;
        autoTrackReference = blueAutoScrapsRef;
    }
    var inc = lowScrapPoints + autoScrapExtraPoints;
    //increment the auto tracker
    incrementData(autoTrackReference, 1);
    //update the score
    incrementData(scoreReference, inc);
});
removeLowScrapButtonAuto.addEventListener("click", function(){
    //need two references, one for the score and one to keep track if any scraps are scored in auto for RP calculation
    var scoreReference = redLowBinScrapScoreRef;
    var autoTrackReference = redAutoScrapsRef;
    if(blueAlliance){
        //set them to the blue alliance ones if on blue alliance
        scoreReference = blueLowBinScrapScoreRef;
        autoTrackReference = blueAutoScrapsRef;
    }
    //increment by negative score to remove
    var inc = -lowScrapPoints - autoScrapExtraPoints;
    //increment the auto tracker by -1
    incrementData(autoTrackReference, -1);
    //update the score
    incrementData(scoreReference, inc);
});
addHighScrapButtonAuto.addEventListener("click", function(){
    //need two references, one for the score and one to keep track if any scraps are scored in auto for RP calculation
    var scoreReference = redHighBinScrapScoreRef;
    var autoTrackReference = redAutoScrapsRef;
    if(blueAlliance){
        //set them to the blue alliance ones if on blue alliance
        scoreReference = blueHighBinScrapScoreRef;
        autoTrackReference = blueAutoScrapsRef;
    }
    var inc = highScrapPoints + autoScrapExtraPoints;
    //increment the auto tracker
    incrementData(autoTrackReference, 1);
    //increment the score
    incrementData(scoreReference, inc);
});
removeHighScrapButtonAuto.addEventListener("click", function(){
    //need two references, one for the score and one to keep track if any scraps are scored in auto for RP calculation
    var scoreReference = redHighBinScrapScoreRef;
    var autoTrackReference = redAutoScrapsRef;
    if(blueAlliance){
        //set them to the blue alliance ones if on blue alliance
        scoreReference = blueHighBinScrapScoreRef;
        autoTrackReference = blueAutoScrapsRef;
    }
    //increment by negative score to remove
    var inc = -highScrapPoints - autoScrapExtraPoints;
    //increment the auto tracker by -1
    incrementData(autoTrackReference, -1);
    //increment the score
    incrementData(scoreReference, inc);
});


//Teleop scrap scoring
addLowScrapButton.addEventListener("click", function(){
    var scoreReference = redLowBinScrapScoreRef;
    if(blueAlliance){
        //set reference to the blue alliance ones if on blue alliance
        scoreReference = blueLowBinScrapScoreRef;
    }
    var inc = lowScrapPoints;
    //update the score
    incrementData(scoreReference, inc);
});
removeLowScrapButton.addEventListener("click", function(){
    var scoreReference = redLowBinScrapScoreRef;
    if(blueAlliance){
        //set reference to the blue alliance ones if on blue alliance
        scoreReference = blueLowBinScrapScoreRef;
    }
    //increment by negative score to remove
    var inc = -lowScrapPoints;
    //update the score
    incrementData(scoreReference, inc);
});
addHighScrapButton.addEventListener("click", function(){
    var scoreReference = redHighBinScrapScoreRef;
    if(blueAlliance){
        //set reference to the blue alliance ones if on blue alliance
        scoreReference = blueHighBinScrapScoreRef;
    }
    var inc = highScrapPoints;
    //increment the score
    incrementData(scoreReference, inc);
});
removeHighScrapButton.addEventListener("click", function(){
    var scoreReference = redHighBinScrapScoreRef;
    if(blueAlliance){
        //set reference to the blue alliance ones if on blue alliance
        scoreReference = blueHighBinScrapScoreRef;
    }
    //increment by negative score to remove
    var inc = -highScrapPoints;
    //increment the score
    incrementData(scoreReference, inc);
});
addVaultScrapButton.addEventListener("click", function(){
    var scoreReference = redVaultScrapScoreRef;
    if(blueAlliance){
        //set refernce to the blue alliance ones if on blue alliance
        scoreReference = blueVaultScrapScoreRef;
    }
    var inc = vaultPoints;
    //increment the score
    incrementData(scoreReference, inc);
});
removeVaultScrapButton.addEventListener("click", function(){
    var scoreReference = redVaultScrapScoreRef;
    if(blueAlliance){
        //set reference to the blue alliance ones if on blue alliance
        scoreReference = blueVaultScrapScoreRef;
    }
    //increment by negative score to remove points
    var inc = -vaultPoints;
    //increment the score
    incrementData(scoreReference, inc);
});

addLeaveButton.addEventListener("click", function(){
    var leaveReference = redLeaveScoreRef;
    if(blueAlliance){
        //set reference to the blue alliance ones if on blue alliance
        leaveReference = blueLeaveScoreRef;
    }
    var inc = leavePoints;
    //increment the score
    incrementData(leaveReference, inc);
});

removeLeaveButton.addEventListener("click", function(){
    var leaveReference = redLeaveScoreRef;
    if(blueAlliance){
        //set reference to the blue alliance ones if on blue alliance
        leaveReference = blueLeaveScoreRef;
    }
    //increment by negative score to remove points
    var inc = -leavePoints;
    //increment the score
    incrementData(leaveReference, inc);
});

addCorePointsButton.addEventListener("click", function(){
    var coreReference = redCoreScoreRef;
    if(blueAlliance){
        //set reference to the blue alliance ones if on blue alliance
        coreReference = blueCoreScoreRef;
    }
    var inc = corePoints;
    //increment the score
    incrementData(coreReference, inc);
});

removeCorePointsButton.addEventListener("click", function(){
    var coreReference = redCoreScoreRef;
    if(blueAlliance){
        //set reference to the blue alliance ones if on blue alliance
        coreReference = blueCoreScoreRef;
    }
    //increment by negative score to remove points
    var inc = -corePoints;
    //increment the score
    incrementData(coreReference, inc);
});

addParkPointsButton.addEventListener("click", function(){
    var parkReference = redParkScoreRef;
    if(blueAlliance){
        //set reference to the blue alliance ones if on blue alliance
        parkReference = blueParkScoreRef;
    }
    var inc = parkingPoints;
    //increment the score
    incrementData(parkReference, inc);
});

removeParkPointsButton.addEventListener("click", function(){
    var parkReference = redParkScoreRef;
    if(blueAlliance){
        //set reference to the blue alliance ones if on blue alliance
        parkReference = blueParkScoreRef;
    }
    //increment by negative score to remove points
    var inc = -parkingPoints;
    //increment the score
    incrementData(parkReference, inc);
});

addFoulButton.addEventListener("click", function(){
    var foulReference = redFoulsRef;
    if(blueAlliance){
        //set reference to the blue alliance ones if on blue alliance
        foulReference = blueFoulsRef;
    }
    var inc = foulPoints;
    //increment the score
    incrementData(foulReference, inc);
});

removeFoulButton.addEventListener("click", function(){
    var foulReference = redFoulsRef;
    if(blueAlliance){
        //set reference to the blue alliance ones if on blue alliance
        foulReference = blueFoulsRef;
    }
    //increment by negative to remove fouls (remove points from other team)
    var inc = -foulPoints;
    //increment the score
    incrementData(foulReference, inc);
});

submitDataButton.addEventListener("click", function(){
    if(blueAlliance){
        setData(blueDataRef, true);
    }
    else{
        setData(redDataRef, true);
    }
});

function updateData(){
    //displays the amount of times something is scored so divide by the point value
    document.getElementById("leaveDescription").textContent = "Leave: " + leaveScore / leavePoints;
    document.getElementById("autoScrap").textContent = "times scored in auto: " + autoScraps;
    document.getElementById("highDescription").textContent = "High: " + Math.floor(highBinScrapScore / highScrapPoints);
    document.getElementById("lowDescription").textContent = "Low: " + Math.floor(lowBinScrapScore / lowScrapPoints);
    document.getElementById("vaultDescription").textContent = "Vault: " + vaultScrapScore / vaultPoints;
    document.getElementById("coresDescription").textContent = "Core Intake/Outake: " + coreScore / corePoints;
    document.getElementById("parkDescription").textContent = "Park: " + parkScore / parkingPoints;
    document.getElementById("foulsDescription").textContent = "Foul: " + fouls / foulPoints;
}