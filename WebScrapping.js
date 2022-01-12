// node WebScrapping.js --excel=worldCup.csv --dataDir=worldCup --source="https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results"

let minimist = require("minimist");
let axios = require("axios");
let jsdom = require("jsdom");
let excel4node = require("excel4node");
let pdf = require("pdf-lib");
let fs = require("fs");
let path = require("path");



// convert matches to teams 
//save teams to excel using excel4node
// create folders and save pdf using pdf-lib

let args = minimist(process.argv);


// download html using axios 
let responsePromise = axios.get(args.source);
responsePromise.then(function(response){
    let html = response.data;
   
    let dom = new jsdom.JSDOM(html);
    let document = dom.window.document;
    let matchScoreDivs = document.querySelectorAll("div.match-score-block");
    let matches = [];

    for(let i = 0  ; i < matchScoreDivs.length ; i++){
        let match = {
            t1 : "",
            t2 : "",
            t1s : "",
            t2s : " ",
            result : ""

        };
     
    let teamParas = matchScoreDivs[i].querySelectorAll("div.name-detail > p.name");
    match.t1 = teamParas[0].textContent;
    match.t2 = teamParas[1].textContent;

    let scoreSpans = matchScoreDivs[i].querySelectorAll("div.score-detail > span.score");
    if(scoreSpans.length == 2){
        match.t1s = scoreSpans[0].textContent;
        match.t2s = scoreSpans[1].textContent;
    }
    else if (scoreSpans.length == 1){
        match.t1s = scoreSpans[0].textContent;

    }
    let resultSpan = matchScoreDivs[i].querySelector("div.status-text > span");
    match.result = resultSpan.textContent;

    matches.push(match);

    }

    let matcheskaJSON = JSON.stringify(matches);
    fs.writeFileSync("matches.json",matcheskaJSON ,"utf-8");

    let teams = [];
    //push team 
    for(let i = 0 ; i < matches.length ; i++){
        pushTeam(teams,matches[i].t1);
        pushTeam(teams,matches[i].t2);
    }

 //   push matches array
 for(let i = 0 ; i < matches.length ; i++){
    pushMatch(teams,matches[i].t1,matches[i].t2,matches[i].t1s,matches[i].t2s,matches[i].result);
    pushMatch(teams,matches[i].t2,matches[i].t1,matches[i].t2s,matches[i].t1s,matches[i].result);
}

    let teamsJSON = JSON.stringify(teams);
    fs.writeFileSync("teams.json",teamsJSON,"utf-8");

    prepareExcel(teams , args.excel);
    prepareFoldersAndPdfs(teams , args.dataDir);
    


})
function  prepareFoldersAndPdfs(teams , dataDir){
    if(fs.existsSync(dataDir) == true){
        fs.rmdirSync(dataDir , {recursive: true});
    }
    fs.mkdirSync(dataDir);

    for(let i = 0 ; i < teams.length ; i++){
        let teamFolderName = path.join(dataDir , teams[i].name);
        
            fs.mkdirSync(teamFolderName )
        

        for(let j = 0 ; j < teams[i].matches.length ; j++){
            let match = teams[i].matches[j];
            createMatchScorecardPdf(teamFolderName ,teams[i].name, match );

        }
    }
}

function  createMatchScorecardPdf(teamFolderName ,hometeam ,  match ){
    let matchFileName = path.join(teamFolderName,match.vs );

    let templateFileBytes = fs.readFileSync("Template.pdf");
    let pdfdockaPromise = pdf.PDFDocument.load(templateFileBytes);
     pdfdockaPromise.then(function(pdfdoc){
         let page = pdfdoc.getPage(0);
         page.drawText(hometeam, {
             x: 320 , 
             y: 675 ,
             size : 8
         });
         page.drawText(match.vs, {
            x: 320 , 
            y: 655,
            size : 8
        });
        page.drawText(match.homeScore, {
            x: 320 , 
            y: 630 ,
            size : 8
        });
        page.drawText(match.oppScore, {
            x: 320 , 
            y: 605 ,
            size : 8
        });
        page.drawText(match.result, {
            x: 320 , 
            y: 580 ,
            size : 8
        });
         let changedByteskaPromise = pdfdoc.save();
         changedByteskaPromise.then(function(changedBytes){

            if(fs.existsSync(matchFileName + ".pdf") == true){
                fs.writeFileSync(matchFileName+"2.pdf",changedBytes);
            }else{
                fs.writeFileSync(matchFileName+".pdf",changedBytes);
            }
            
         })
     })
}
function prepareExcel(teams , excelFileName){
    let wb = new excel4node.Workbook();

    for(let i = 0 ; i < teams.length ; i++){
        let tsheet  = wb.addWorksheet(teams[i].name);

        tsheet.cell(1,1).string("Vs");
        tsheet.cell(1,2).string("Self score");
        tsheet.cell(1,3).string("opp Score");
        tsheet.cell(1,4).string("Result");

        for(let j = 0 ; j < teams[i].matches.length  ; j++){
            tsheet.cell(2+j,1).string(teams[i].matches[j].vs);
            tsheet.cell(2+j,2).string(teams[i].matches[j].homeScore);
            tsheet.cell(2+j,3).string(teams[i].matches[j].oppscore);
            tsheet.cell(2+j,4).string(teams[i].matches[j].result);
        }
    }
     wb.write(excelFileName);
}


function pushMatch(teams , hometeam , oppteam , homescore , oppscore , result ){
    let tidx = -1;
    for(let j = 0 ; j < teams.length ; j++){
        if(teams[j].name == hometeam){
            tidx = j;
        }
    }

    teams[tidx].matches.push({
        vs: oppteam,
        homeScore: homescore,
        oppScore : oppscore,
        result: result
     
    })
}
function pushTeam(teams , teamName){
    let tidx = -1;
    for(let j = 0 ; j < teams.length ; j++){
        if(teams[j].name == teamName){
            tidx = j;
        }
    }

    if(tidx == -1 ){
        let team = {
            name: teamName,
            matches : []
        }
        teams.push(team);
    }
}

// extract information using jsdom
